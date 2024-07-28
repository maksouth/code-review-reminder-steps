
const createJoinChannelMessage = () => {
    return {
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Hey there! 👋 I'm here to help you stay on top of your pull request (PR) links posted to this channel. Here's how I work:"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Reminder Condition*: I'll remind about messages with a link to a PR."
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Stop Reminders*: Mark the original message with a ✅ or click the 'Ignore' button in the message posted to the thread, and I'll stop sending reminders for that PR."
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "📌 *Note*: You can pin message above so that your team doesn't forget about the process."
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Let's keep your PRs on track and make collaboration smooth! 🚀"
                }
            }
        ]
    };
};

module.exports = {
    createJoinChannelMessage
};