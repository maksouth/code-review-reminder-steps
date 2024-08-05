const {putItem, getItemByCompositeKey} = require("./dynamoDB.js");

const TIME_OPTIONS_MAP = {
    '1': '1 minute',
    '15': '15 minutes',
    '30': '30 minutes',
    '45': '45 minutes',
    '60': '1 hour',
    '120': '2 hours',
    '180': '3 hours',
    '240': '4 hours',
    '360': '6 hours',
    '480': '8 hours',
    '600': '10 hours',
    '720': '12 hours',
    '1080': '18 hours',
    '1440': '24 hours'
};

const TABLE_NAME = 'codeReviewReminderBotConfigs';
const DEFAULT_FREQUENCY = '120';
const RECORD_TYPE_GLOBAL = 'global';

const DEFAULT_CONFIG = {
    reminder_frequency_minutes: DEFAULT_FREQUENCY,
    record_type: RECORD_TYPE_GLOBAL
};

const getConfig = async (teamId = null) => {
    console.log('[DYNAMODB] Get config', teamId);

    return getItemByCompositeKey(
        TABLE_NAME,
        {
            team_id: teamId,
            record_type: RECORD_TYPE_GLOBAL
        }).then((data) => {
            return {
                team_id: teamId,
                ...DEFAULT_CONFIG,
                ...data.Item
            };
        });
}

const updateConfigReminderFrequencyMinutes = async (teamId, reminderFrequencyMinutes) => {
    console.log('[DYNAMODB] Update config: reminder frequency', teamId, reminderFrequencyMinutes);
    const config = await getConfig(teamId);
    const updatedConfig = {
        ...config,
        last_updated: new Date().toISOString(),
        reminder_frequency_minutes: reminderFrequencyMinutes,
    };
    return putItem(TABLE_NAME, updatedConfig);
}

const updateConfigPaddleCustomerId = async (teamId, paddleCustomerId, isSubscriptionActive) => {
    console.log('[DYNAMODB] Update config: Paddle subscription', teamId, paddleCustomerId);
    const config = await getConfig(teamId);
    const updatedConfig = {
        ...config,
        team_id: teamId,
        record_type: RECORD_TYPE_GLOBAL,
        last_updated: new Date().toISOString(),
        paddle_customer_id: paddleCustomerId,
        paddle_is_subscription_active: isSubscriptionActive,
    };
    return putItem(TABLE_NAME, updatedConfig);
}

function checkIsSubscriptionActive(config) {
    return !!config.paddle_is_subscription_active;
}

module.exports = {
    getConfig,
    checkIsSubscriptionActive: checkIsSubscriptionActive,
    updateConfigPaddleCustomerId,
    updateConfigReminderFrequencyMinutes,
    TIME_OPTIONS_MAP
};