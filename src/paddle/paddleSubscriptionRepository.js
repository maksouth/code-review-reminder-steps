const {getAllItems, getItemByCompositeKey, putItem} = require("../dynamoDB");

const TABLE_NAME = 'codeReviewReminderBotSubscriptions';

const getSubscriptionByCustomerId = async (customerId) => {
    console.log('[DYNAMODB] Get subscription', customerId);
    return getItemByCompositeKey(
        TABLE_NAME,
        { paddle_customer_id: customerId}
    ).then((data) => {
            return data.Item ?? {};
        });
}

const getUnassignedSubscriptions = async () => {
    console.log('[DYNAMODB] Get unassigned subscriptions');
    const subscriptions = await getAllSubscriptions();
    return subscriptions.filter(subscription => !subscription.slack_team_id);
}

const getAllSubscriptions = async () => {
    return getAllItems(
        TABLE_NAME,
    ).then((data) => {
        console.log('[DYNAMODB] Get all subscriptions', data.Items);
        return data.Items ?? [];
    });
}

const createSubscription = async (customerId, subscription) => {
    subscription = {
        paddle_customer_id: customerId,
        ...subscription
    }
    return putItem(TABLE_NAME, subscription);
}

const updateSubscription = async (customerId, updateSubscription) => {
    console.log('[DYNAMODB] Update subscription', customerId, updateSubscription);
    const subscription = await getSubscriptionByCustomerId(customerId);
    const updatedSubscription = {
        ...subscription,
        paddle_customer_id: customerId,
        ...updateSubscription
    }
    return putItem(TABLE_NAME, updatedSubscription);
}

const updateSubscriptionSlackTeam = async (customerId, slackTeamId) => {
    console.log('[DYNAMODB] Update subscription', customerId, slackTeamId);
    const subscription = await getSubscriptionByCustomerId(customerId);
    const updatedSubscription = {
        ...subscription,
        paddle_customer_id: customerId,
        slack_team_id: slackTeamId
    }
    return putItem(TABLE_NAME, updatedSubscription);
}

module.exports = {
    getSubscriptionByCustomerId,
    getUnassignedSubscriptions,
    createSubscription,
    updateSubscription,
    updateSubscriptionSlackTeam
}