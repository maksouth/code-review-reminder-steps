const { App, ExpressReceiver } = require("@slack/bolt");
const { createDynamoDBInstallationStore } = require("./src/dynamoDBInstallationStore");
const {
    deleteScheduledMessages,
    handlePostedPRLink,
    ACTION_ID_IGNORE_PR,
    VCS_URLS_PATTERN,
    VCS_URL_DOMAINS, findMessageById
} = require("./src/reminderMessagesService");
const {createHomeAppViewWithReminderMinutesSelector, ACTION_ID_CONFIG_GLOBAL_SELECT_REMINDER_FREQUENCY} = require("./src/homeViewService");
const {createJoinChannelMessage} = require("./src/joinChannelViewService");
const {getConfig, updateConfigReminderFrequencyMinutes} = require("./src/reminderConfigurationService");

const expressReceiver = new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    stateSecret: 'my-state-secret',
    scopes: [
        'chat:write',
        'channels:history',
        'channels:read',
        'links:read',
        'reactions:read',
        'users:read'
    ],
    processBeforeResponse: true,
    installationStore: createDynamoDBInstallationStore(),
    installerOptions: {
        directInstall: true,
        legacyStateVerification: true,
    }
});

const createOAuthApp = () => {
    const app = new App({
        receiver: expressReceiver,
        processBeforeResponse: true,
    });

    return app;
}

// Initializes your app with your bot token and app token
const app = createOAuthApp();

// Listens to incoming messages that contain "hello"
app.message('hello', async ({ message, say }) => {
    // say() sends a message to the channel where the event was triggered
    await say({
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `Hey there <@${message.user}>!`
                },
                "accessory": {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Click Me"
                    },
                    "action_id": "button_click"
                }
            }
        ],
        text: `Hey there <@${message.user}>!`
    });
});

app.action('button_click', async ({ body, ack, say }) => {
    // Acknowledge the action
    await ack();
    await say(`<@${body.user.id}> clicked the button`);
});

VCS_URL_DOMAINS.forEach(domain => {
    app.message(domain, async ({message, say, client}) => {
        console.log('Message with link', message);
        await handlePostedPRLink(message, client, say);
    });
});

app.action(ACTION_ID_IGNORE_PR, async ({body, client, ack, say}) => {
    // Acknowledge the action
    await ack();
    console.log('Click ignore message', body);
    await say({
        text: `<@${body.user.id}> this PR has been ignored. I'll stop reminding about it.`,
        thread_ts: body.message.thread_ts,
        channel: body.channel.id
    });

    const parentMessage = await findMessageById(client, body.channel.id, body.message.thread_ts);
    console.log('Parent message', parentMessage);

    await deleteScheduledMessages(client, parentMessage, body.channel.id);
});

app.event('reaction_added', async ({event, client, logger, say}) => {
    console.log('Reaction added', event);
    const parentMessage = await findMessageById(client, event.item.channel, event.item.ts);
    console.log('Parent message', parentMessage);

    if (!parentMessage) {
        console.error('No reacted message found');
        return;
    }

    if (VCS_URLS_PATTERN.test(parentMessage.text) && event.reaction === 'white_check_mark') {
        await say({
            text: `<@${event.user}> approved PR of author <@${parentMessage.user}>. I'll stop reminding the team about this PR.`,
            thread_ts: event.item.ts,
            channel: event.item.channel
        });
        await deleteScheduledMessages(client, parentMessage, event.item.channel);
    }
});

app.event('app_home_opened', async ({event, client, logger, say}) => {
    console.log('App home: opened', event);

    const userProfile = await client.users.info({user: event.user, include_locale: true});
    const user = userProfile.user;

    const config = await getConfig(user.team_id);

    await client.views.publish(createHomeAppViewWithReminderMinutesSelector(event.user, config.reminder_frequency_minutes, false));
});

app.action(ACTION_ID_CONFIG_GLOBAL_SELECT_REMINDER_FREQUENCY, async ({body, ack, client}) => {
    await ack();
    const selectedReminderPeriod = body.actions[0].selected_option.value;
    console.log('App home: selected remindersMinutes', selectedReminderPeriod);

    const userId = body.user.id;

    // Update the Home tab view
    await client.views.publish(createHomeAppViewWithReminderMinutesSelector(userId, selectedReminderPeriod, true));

    await updateConfigReminderFrequencyMinutes(body.team.id, selectedReminderPeriod);
});

app.event('member_joined_channel', async ({event, client, logger, say}) => {
    console.log('Member join channel', event);
    const botUser = await client.auth.test();

    const joinedUserId = event.user;
    const botUserId = botUser.user_id;

    if (joinedUserId === botUserId) {
        await say(createJoinChannelMessage());
    }
});

module.exports.handler = require('serverless-http')(expressReceiver.app);