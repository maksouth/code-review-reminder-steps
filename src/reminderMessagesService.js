const moment = require('moment-timezone');
const {getConfig, TIME_OPTIONS_MAP, checkIsSubscriptionActive} = require("./reminderConfigurationService");

const REMINDERS_COUNT = 10;
const VCS_URLS_PATTERN = /bitbucket|github|gitlab|azure|visualstudio/;
const VCS_URL_DOMAINS = ['bitbucket', 'github', 'gitlab', 'azure', 'visualstudio'];
const ACTION_ID_IGNORE_PR = "action_ignore_pr";
const REMINDER_PROMPT = "Gentle reminder to review pull request";

const handlePostedPRLink = async (message, client, say) => {
    console.log('CODE REVIEW MESSAGE', message);
    if (!message.user) {
        console.error('No user found in the message');
        return;
    }

    const config = await getConfig(message.team);

    if (checkIsSubscriptionActive(config)) {
        say(preparePRAcknowledgeMessage(message, config.reminder_frequency_minutes));
        return scheduleReminderMessages(message, client, config.reminder_frequency_minutes);
    } else {
        say(prepareSubscriptionRequiredMessage(message));
    }
};

const preparePRAcknowledgeMessage = (message, reminderFrequencyMinutes) => {
    return {
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `:wave: <@${message.user}> I'll remind the team about link to PR every ${TIME_OPTIONS_MAP[reminderFrequencyMinutes]}, until someone marks message with :white_check_mark:.`
                },
                "accessory": {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Ignore this PR"
                    },
                    "action_id": ACTION_ID_IGNORE_PR
                }
            }
        ],
        text: `:wave: <@${message.user}> I'll remind the team about link to PR every ${TIME_OPTIONS_MAP[reminderFrequencyMinutes]}, until someone marks message with :white_check_mark:.`,
        thread_ts: message.ts,
        channel: message.channel
    }
};

const prepareSubscriptionRequiredMessage = (message) => {
    return {
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `:wave: <@${message.user}> You need to subscribe to use reminders feature.`
                }
            }
        ],
        text: `:wave: <@${message.user}> You need to subscribe to use reminders feature.`,
        thread_ts: message.ts,
        channel: message.channel
    }
}

const scheduleReminderMessages = async (message, client, reminderFrequencyMinutes) => {
    const reminderTimestamps = generateTimestamps(reminderFrequencyMinutes);
    console.log('REMINDER TIMESTAMPS', reminderTimestamps);

    const pullRequestUrl = findPullRequestUrl(message);
    console.log('EXTRACTED URL', pullRequestUrl);

    const scheduleMessagePromises = reminderTimestamps.map((post_at) => {
        return client.chat.scheduleMessage({
            text: `${REMINDER_PROMPT}\n${pullRequestUrl}`,
            channel: message.channel,
            post_at: post_at,
            reply_broadcast: true,
            thread_ts: message.ts
        });
    });
    await Promise.all(scheduleMessagePromises)
        .then(responses => {
            const scheduledMessageIds = responses.map(response => response.scheduled_message_id);
            console.log('Scheduled message ids', scheduledMessageIds);
        });
}

const generateTimestamps = (reminderFrequencyMinutes) => {
    const timestamps = [];
    for (let i = 1; i <= REMINDERS_COUNT; i++) {
        timestamps.push(moment().add(i * reminderFrequencyMinutes, 'minutes').unix());
    }
    return timestamps;
}

const deleteScheduledMessages = async (client, parentMessage, channelId) => {
    const pullRequestUrl = findPullRequestUrl(parentMessage);
    const reminderMessageIds = await findScheduledReminderMessageIds(client, pullRequestUrl);
    console.log('Reminder message ids', reminderMessageIds);

    return Promise
        .all(reminderMessageIds.map(async (id) => {
            return client.chat.deleteScheduledMessage({
                channel: channelId,
                scheduled_message_id: id
            });
        }))
        .catch(e => {
            console.error('Error deleting scheduled messages', e);
        });
}

const findPullRequestUrl = (message) => {
    return message.blocks[0]?.elements[0]?.elements
        ?.find(e => e.type === 'link' && VCS_URLS_PATTERN.test(e.url))
        ?.url;
}

const findScheduledReminderMessageIds = async (client, pullRequestUrl) => {
    return client.chat.scheduledMessages.list().then((response) =>
        response.scheduled_messages
            .filter(message => message.text.includes(pullRequestUrl))
            .map(message => message.id));
}

const findMessageById = async (client, channelId, id) => {
    return client.conversations.history({
        channel: channelId,
        latest: id,
        inclusive: true,
        limit: 1
    }).then((response) => response.messages[0]);
}

module.exports = {
    deleteScheduledMessages,
    findMessageById,
    handlePostedPRLink,
    ACTION_ID_IGNORE_PR,
    VCS_URL_DOMAINS,
    VCS_URLS_PATTERN
};
