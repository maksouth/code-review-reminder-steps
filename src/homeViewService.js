const {TIME_OPTIONS_MAP} = require("./reminderConfigurationService");

const ACTION_ID_CONFIG_GLOBAL_SELECT_REMINDER_FREQUENCY = 'action_config_global_select_reminder_minutes';

const createHomeAppViewWithReminderMinutesSelector = (userId, reminderFrequencyMinutes, showToastReminderFrequencyMinutes) => {
    const blocks = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "Hey there 👋 I'm CodeReviewReminder bot. I'm here to remind your team about posted code changes to review."
            }
        },
        {
            "type": "divider"
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "🏗️️ Bot is not integrated with VCS. It's triggered by messages containing VCS URLs. When a message with a VCS URL is posted, bot will schedule reminders for the team to review the code changes."
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "🛎️ When a team member reacts with a :white_check_mark: to the message, bot will stop sending reminders for that PR.\n You can also skip reminders for a PR by clicking the *Ignore this PR* button in the message posted in thread"
            }
        },
        {
            "type": "section",
            "block_id": "reminder_frequency_minutes_select_block",
            "text": {
                "type": "mrkdwn",
                "text": "⏰ Select how often I should remind team about posted PRs:"
            },
            "accessory": {
                "type": "static_select",
                "action_id": ACTION_ID_CONFIG_GLOBAL_SELECT_REMINDER_FREQUENCY,
                "placeholder": {
                    "type": "plain_text",
                    "text": "Select a reminder period"
                },
                "options": Object.entries(TIME_OPTIONS_MAP).map(([value, text]) => ({
                    "text": {
                        "type": "plain_text",
                        "text": text
                    },
                    "value": value
                })),
                "initial_option": reminderFrequencyMinutes ? {
                    "text": {
                        "type": "plain_text",
                        "text": TIME_OPTIONS_MAP[reminderFrequencyMinutes]
                    },
                    "value": reminderFrequencyMinutes
                } : undefined
            }
        },
        ...(showToastReminderFrequencyMinutes ?
                [{
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `Your reminder period has been set to: *${TIME_OPTIONS_MAP[reminderFrequencyMinutes]}*`
                    }
                }] : []
        ),
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "➕ To start tracking your team's PRs, *add me to a channel* and I'll introduce myself. I'm usually added to a team or project channel. Type `/invite @CodeReviewReminderDev` from the channel"
            }
        },
        {
            "type": "video",
            "title": {
                "type": "plain_text",
                "text": "How to use Slack for code reviews?",
                "emoji": true
            },
            "title_url": "https://youtu.be/4jNY3UyWpGw?si=7XKJ7KFrMyT8pLYp",
            "description": {
                "type": "plain_text",
                "text": "Slack is a new way to communicate with your team. It's faster, better organised and more secure than email.",
                "emoji": true
            },
            "video_url": "https://www.youtube.com/embed/4jNY3UyWpGw?si=7XKJ7KFrMyT8pLYp?feature=oembed&autoplay=1",
            "thumbnail_url": "https://i.ytimg.com/vi/4jNY3UyWpGw/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDS_eaKndwlnwCyxQ3ePavoSTHdtA",
            "alt_text": "How to use Slack?",
            "author_name": "Slack",
            "provider_name": "YouTube",
            "provider_icon_url": "https://a.slack-edge.com/80588/img/unfurl_icons/youtube.png"
        }
    ];

    return {
        user_id: userId,
        view: {
            type: 'home',
            callback_id: 'home_view',
            blocks: blocks
        }
    };
}

module.exports = {
    createHomeAppViewWithReminderMinutesSelector,
    ACTION_ID_CONFIG_GLOBAL_SELECT_REMINDER_FREQUENCY
};