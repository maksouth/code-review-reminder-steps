const { App, AwsLambdaReceiver } = require('@slack/bolt');
const {
    deleteScheduledMessages,
    handlePostedPRLink,
    ACTION_ID_IGNORE_PR,
    VCS_URLS_PATTERN,
    VCS_URL_DOMAINS, findMessageById
} = require('./src/reminderMessagesService');

const awsLambdaReceiver = new AwsLambdaReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Initializes your app with your bot token and app token
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    receiver: awsLambdaReceiver,
});

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

module.exports.handler = async (event, context, callback) => {
    const handler = await awsLambdaReceiver.start();
    return handler(event, context, callback);
}