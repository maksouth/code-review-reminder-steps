const {DynamoDBClient} = require("@aws-sdk/client-dynamodb");
const {PutCommand, DynamoDBDocumentClient, GetCommand} = require("@aws-sdk/lib-dynamodb");

let client;
const getClient = () => {
    if (!client) {
        // TODO comment before deployment
        client = new DynamoDBClient({
            endpoint: "http://127.0.0.1:8000",
        });
        // TODO uncomment before deployment
        // client = new DynamoDBClient({region: 'us-east-1'});
    }
    return client;
};

let docClient;
const getDocClient = () => {
    if (!docClient)
        docClient = DynamoDBDocumentClient.from(getClient());
    return docClient;
};

const putItem = async (tableName, item) => {
    return getDocClient().send(new PutCommand({
        TableName: tableName,
        Item: item
    }));
};

// key is an object containing value of composite key - for hash and range keys
const getItemByCompositeKey = async (tableName, key) => {
    return getDocClient().send(new GetCommand({
        TableName: tableName,
        Key: key
    }));
}

exports.putItem = putItem;
exports.getItemByCompositeKey = getItemByCompositeKey;