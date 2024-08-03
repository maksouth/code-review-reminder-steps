const {Paddle, Environment} = require('@paddle/paddle-node-sdk')
const {handlePaddleEvent} = require("./paddleController");

const paddle = new Paddle(process.env.PADDLE_API_KEY, {
    environment: Environment.sandbox, // or Environment.sandbox for accessing sandbox API
});

const handler = async (req, context, callback) => {
    const signature = req.headers['Paddle-Signature'] || req.headers['paddle-signature'];
    const rawRequestBody = req.body.toString();
    const secretKey = process.env.PADDLE_WEBHOOK_SECRET_KEY || '';

    try {
        if (signature && rawRequestBody) {
            // The `unmarshal` function will validate the integrity of the webhook and return an entity
            const eventData = paddle.webhooks.unmarshal(rawRequestBody, secretKey, signature);
            console.log('[Paddle] event data', eventData);
            await handlePaddleEvent(eventData);
        } else {
            console.log('[Paddle] Signature missing in header');
        }
    } catch (e) {
        // Handle signature mismatch or other runtime errors
        console.log('[Paddle] ' + e);
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify({message: 'Processed webhook event'}),
    };

    callback(null, response);
}

module.exports.paddleHandler = handler;