const { putItem, getItemByCompositeKey, deleteItemsByCompositeKey } = require("./dynamoDB.js");

const TABLE_NAME = 'codeReviewReminderBotSlackInstalls';
const INSTALLATION_TYPE_ENTERPRISE = 'enterprise';
const INSTALLATION_TYPE_TEAM = 'team';
const database = {
    async get(key, installationType) {
        console.log('[DYNAMODB] GET INSTALLATION REQUEST', key, installationType);
        return getItemByCompositeKey(
            TABLE_NAME,
            {
                team_or_enterprise_id: key,
                installation_type: installationType
            }).then((data) => {
                const result = JSON.parse(data.Item?.installation);
                return result;
            });
    },
    async delete(key, installationType) {
        console.log("[DYNAMODB] DELETE INSTALLATION", key, installationType);
        return deleteItemsByCompositeKey(
            TABLE_NAME,
            {
                team_or_enterprise_id: key,
                installation_type: installationType
            });
    },
    async set(key, installationType, value) {
        console.log("[DYNAMODB] ADD INSTALLATION", value);
        return putItem(
            TABLE_NAME,
            {
                team_or_enterprise_id: key,
                installation_type: installationType,
                installation: JSON.stringify(value)
            });
    }
};

// Check how to implement the methods in the database object
// https://slack.dev/bolt-js/concepts#authenticating-oauth
const createDynamoDBInstallationStore = () => {
    return {
        storeInstallation: async (installation) => {
            // Bolt will pass your handler an installation object
            // Change the lines below so they save to your database
            if (installation.isEnterpriseInstall && installation.enterprise !== undefined) {
                // handle storing org-wide app installation
                return await database.set(installation.enterprise.id, INSTALLATION_TYPE_ENTERPRISE, installation);
            }
            if (installation.team !== undefined) {
                // single team app installation
                return await database.set(installation.team.id, INSTALLATION_TYPE_TEAM, installation);
            }
            throw new Error('Failed saving installation data to installationStore');
        },
        fetchInstallation: async (installQuery) => {
            // Bolt will pass your handler an installQuery object
            // Change the lines below so they fetch from your database
            if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
                // handle org wide app installation lookup
                return await database.get(installQuery.enterpriseId, INSTALLATION_TYPE_ENTERPRISE);
            }
            if (installQuery.teamId !== undefined) {
                // single team app installation lookup
                return await database.get(installQuery.teamId, INSTALLATION_TYPE_TEAM);
            }
            throw new Error('Failed fetching installation');
        },
        deleteInstallation: async (installQuery) => {
            // Bolt will pass your handler  an installQuery object
            // Change the lines below so they delete from your database
            if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
                // org wide app installation deletion
                return await database.delete(installQuery.enterpriseId, INSTALLATION_TYPE_ENTERPRISE);
            }
            if (installQuery.teamId !== undefined) {
                // single team app installation deletion
                return await database.delete(installQuery.teamId, INSTALLATION_TYPE_TEAM);
            }
            throw new Error('Failed to delete installation');
        },
    };
}

module.exports.createDynamoDBInstallationStore = createDynamoDBInstallationStore;