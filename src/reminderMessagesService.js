const moment = require('moment-timezone');

const REMINDERS_COUNT = 10;
const REMINDER_FREQUENCY_MINUTES = 2;
const VCS_URLS_PATTERN = /bitbucket|github|gitlab|azure|visualstudio/;
const VCS_URL_DOMAINS = ['bitbucket', 'github', 'gitlab', 'azure', 'visualstudio'];

const handlePostedPRLink = async (message, client, say) => {
    console.log('CODE REVIEW MESSAGE', message);
    if (!message.user) {
        console.error('No user found in the message');
        return;
    }

    say(preparePRAcknowledgeMessage(message));

    return scheduleReminderMessages(message, client);
};

const preparePRAcknowledgeMessage = (message) => {
    return {
        text: `:wave: <@${message.user}> I'll remind the team about link to PR every 2 minutes.`,
        thread_ts: message.ts,
        channel: message.channel
    }
};

const scheduleReminderMessages = async (message, client) => {
    const reminderTimestamps = generateTimestamps();
    console.log('REMINDER TIMESTAMPS', reminderTimestamps);

    const extractedURL = message.blocks[0]?.elements[0]?.elements
        ?.find(e => e.type === 'link' && VCS_URLS_PATTERN.test(e.url))
        ?.url;
    console.log('EXTRACTED URL', extractedURL);

    const scheduleMessagePromises = reminderTimestamps.map((post_at) => {
        client.chat.scheduleMessage({
            text: `Gentle reminder to review pull request\n${extractedURL}`,
            channel: message.channel,
            post_at: post_at,
            reply_broadcast: true,
            thread_ts: message.ts
        });
    });
    await Promise.all(scheduleMessagePromises);
}

const generateTimestamps = () => {
    const timestamps = [];
    for (let i = 1; i <= REMINDERS_COUNT; i++) {
        timestamps.push(moment().add(i * REMINDER_FREQUENCY_MINUTES, 'minutes').unix());
    }
    return timestamps;
}

module.exports = {
    handlePostedPRLink,
    VCS_URL_DOMAINS
};
