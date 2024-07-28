# Getting Started ⚡️ Bolt for JavaScript

## Step 7 - make separate environment for local and production applications

Important
New commands with stage (environments) name
- Start Serverless offline - local bot instance for testing 
```zsh
serverless offline --noPrependStageInUrl --stage dev-local
```

- Deploy app to AWS Lambda - production bot instance
```zsh
serverless deploy --stage dev
```

Install dotenv plugin to read environment variables from .env file, not from system environment variables
```zsh
serverless plugin install -n serverless-dotenv-plugin
```

Populate .env file with environment variables:
- .env.dev - Production bot instance "CodeReviewReminder"
- .env.local - Local bot instance "CodeReviewReminderDev"

## Step 6 - save config to DynamoDB

Download DynamoDB local
https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html

Start DynamoDB local instance from folder where you downloaded DynamoDB local
```zsh
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
```

Install AWS NoSQL Workbench
https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/workbench.settingup.html

Install official DynamoDB client library. Reference: https://www.npmjs.com/package/@aws-sdk/client-dynamodb
```zsh
npm install @aws-sdk/client-dynamodb
```

Install official DynamoDB library with handy data models. Reference: https://www.npmjs.com/package/@aws-sdk/lib-dynamodb
```zsh
npm install @aws-sdk/lib-dynamodb
```

Start DynamoDB locally
```zsh
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
```

Get user info by user ID
https://api.slack.com/methods/users.info

New scope required to get user info
https://api.slack.com/scopes/users:read

## Step 5 - user onboarding

Block Kit Builder - UI constructor
https://app.slack.com/block-kit-builder

Event when user or bot joined channel
https://api.slack.com/events/member_joined_channel

Event when user opens bot's App Home
https://api.slack.com/events/app_home_opened

API method to get bot auth data
https://api.slack.com/methods/auth.test

## Step 4
How to search message in conversation
https://api.slack.com/methods/conversations.history

List schedule messages in chat
https://api.slack.com/methods/chat.scheduledMessages.list

Delete schedule message
https://api.slack.com/methods/chat.deleteScheduledMessage

Event when user adds reaction to message
https://api.slack.com/events/reaction_added

## Step 3
Install moment-timezone
```zsh
 npm install moment-timezone
```

## Step 2
Export new environment variable
```zsh
export SLACK_SIGNING_SECRET=<your-signing-secret>
```
install Serverless dependencies
```zsh  
npm install --save-dev serverless-offline
```

Run app locally
- Start Serverless offline
```zsh
serverless offline --noPrependStageInUrl
```

- Start ngrok
```zsh
ngrok http 3000
```

Deploy app to AWS Lambda
```zsh
serverless deploy
```

## Overview

> Slack app example from 📚 [Getting started with Bolt for JavaScript tutorial][1]

This is a Slack app built with the [Bolt for JavaScript framework][2] that showcases
responding to events and interactive buttons.

## Running locally

### 0. Create a new Slack App

- Go to https://api.slack.com/apps
- Click **Create App**
- Choose a workspace
- Enter App Manifest using contents of `manifest.yaml`
- Click **Create**

Once the app is created click **Install to Workspace**
Then scroll down in Basic Info and click **Generate Token and Scopes** with both scopes

### 1. Setup environment variables

```zsh
# Replace with your bot and app token
export SLACK_BOT_TOKEN=<your-bot-token> # from the OAuth section
export SLACK_APP_TOKEN=<your-app-level-token> # from the Basic Info App Token Section
```

### 2. Setup your local project

```zsh
# Clone this project onto your machine
git clone https://github.com/slackapi/bolt-js-getting-started-app.git

# Change into the project
cd bolt-js-getting-started-app/

# Install the dependencies
npm install
```

### 3. Start servers
```zsh
npm run start
```

### 4. Test

Go to the installed workspace and type **Hello** in a DM to your new bot. You can also type **Hello** in a channel where the bot is present

## Contributing

### Issues and questions

Found a bug or have a question about this project? We'd love to hear from you!

1. Browse to [slackapi/bolt-js/issues][4]
1. Create a new issue
1. Select the `[x] examples` category

See you there and thanks for helping to improve Bolt for everyone!

[1]: https://slack.dev/bolt-js/tutorial/getting-started
[2]: https://slack.dev/bolt-js/
[3]: https://slack.dev/bolt-js/tutorial/getting-started#setting-up-events
[4]: https://github.com/slackapi/bolt-js/issues/new