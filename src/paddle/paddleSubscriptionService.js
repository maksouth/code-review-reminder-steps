const {getUnassignedSubscriptions, updateSubscriptionSlackTeam} = require("./paddleSubscriptionRepository");
const {updateConfigPaddleCustomerId} = require("../reminderConfigurationService");

const tryMatchTeamWithSubscription = async (teamId, client) => {
    const unassignedSubscriptions = await getUnassignedSubscriptions();

    console.log('Unassigned subscriptions', unassignedSubscriptions);

    for (const subscription of unassignedSubscriptions) {
        if (await tryAssignSubscriptionToTeam(subscription, teamId, client)) {
            return true;
        }
    }
}

const tryAssignSubscriptionToTeam = async (subscription, teamId, client) => {
    const user = await getSlackUserByEmail(client, subscription.paddle_customer_email);
    if (!user) {
        return false;
    }

    await updateSubscriptionSlackTeam(subscription.paddle_customer_id, teamId);
    await updateConfigPaddleCustomerId(
        teamId,
        subscription.paddle_customer_id,
        !!subscription.paddle_subscription_status && subscription.paddle_subscription_status !== 'cancelled',
    );
    return true;
}

async function getSlackUserByEmail(client, email) {
    if (!email) {
        return null;
    }
    try {
        const response = await client.users.lookupByEmail({ email });
        console.log('Lookup by email result', email, response);
        return response.user;
    } catch (error) {
        if (error.data && error.data.error === 'users_not_found') {
            return null;
        } else {
            throw error;
        }
    }
}


module.exports = {
    tryMatchTeamWithSubscription,
}