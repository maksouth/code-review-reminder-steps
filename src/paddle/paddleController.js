const {EventName} = require("@paddle/paddle-node-sdk");
const {createSubscription, updateSubscription, getSubscriptionByCustomerId} = require("./paddleSubscriptionRepository");
const {updateConfigPaddleCustomerId} = require("../reminderConfigurationService");

const handlePaddleEvent = async (eventData) => {
    switch (eventData.eventType) {
        case EventName.CustomerUpdated:
        case EventName.CustomerCreated:
            await handleCustomerCreated(eventData);
            // todo save customer id and email to database
            break;
        case EventName.AddressUpdated:
            await handleAddressUpdated(eventData);
            break;
        case EventName.TransactionCompleted:
            await handleTransactionCompleted(eventData);
            // todo mark subscription as paid in database
            // todo send email to user about successful payment and next steps
            break;
        case EventName.SubscriptionCreated:
            await handleSubscriptionCreated(eventData);
            // todo save subscription to database
            break;
        case EventName.SubscriptionCanceled:
            await handleSubscriptionCanceled(eventData);
            // todo update subscription status in database
            break;
        default:
            console.log("[PADDLE] not-handled event", eventData.eventType);
    }
}

const handleCustomerCreated = async (eventData) => {
    console.log(`[PADDLE] Customer ${eventData.data.id} was created`);
    const example = {
        "eventId": "evt_01j098s82y1gzgg69r4sqbhyyf",
        "eventType": "customer.created",
        "occurredAt": "2024-06-13T17:02:04.387938Z",
        "notificationId": "ntf_01j098s8fhgrc7g4a2yyykxn97",
        "data": {
            "id": "ctm_01j098s7dm9hzabrtrv3trjswv",
            "name": null,
            "email": "max@reviewnudgebot.com",
            "locale": "en",
            "status": "active",
            "createdAt": "2024-06-13T17:02:03.7Z",
            "updatedAt": "2024-06-13T17:02:03.7Z",
            "customData": null,
            "importMeta": null,
            "marketingConsent": true
        }
    }

    return createSubscription(eventData.data.id, {
        paddle_customer_email: eventData.data.email,
    });
}

const handleAddressUpdated = async (eventData) => {
    console.log(`Address ${eventData.data.id} was updated`);
    const example = {
        "eventId": "evt_01j098t28mc46dbmrct6y2nb0v",
        "eventType": "address.updated",
        "occurredAt": "2024-06-13T17:02:31.188859Z",
        "notificationId": "ntf_01j098t2ehr4q2absfkajqcxz9",
        "data": {
            "id": "add_01j098s7e623anjce94efxxv2j",
            "city": "Warsaw",
            "region": "Poland",
            "status": "active",
            "createdAt": "2024-06-13T17:02:03.718Z",
            "firstLine": "Zlota 44",
            "updatedAt": "2024-06-13T17:02:30.869304Z",
            "customData": null,
            "customerId": "ctm_01j098s7dm9hzabrtrv3trjswv",
            "description": null,
            "importMeta": null,
            "postalCode": null,
            "secondLine": null,
            "countryCode": "PL"
        }
    }
}

const handleTransactionCompleted = async (eventData) => {
    console.log(`Transaction ${eventData.data.id} was completed`);
    const example = {
        "eventId": "evt_01j098va65hjv8fmnjqwdmjbzp",
        "eventType": "transaction.completed",
        "occurredAt": "2024-06-13T17:03:12.069692Z",
        "notificationId": "ntf_01j098vac1esvav6c9p97vfw1r",
        "data": {
            "id": "txn_01j098rkyax69765hrsh4v9rvj",
            "items": [
                {
                    "price": {
                        "id": "pri_01j04e5ynw6q9adg6mxty21pk4",
                        "name": "ReviewNudgeBot Plus monthly",
                        "type": "standard",
                        "status": "active",
                        "quantity": {
                            "maximum": 1,
                            "minimum": 1
                        },
                        "taxMode": "account_setting",
                        "createdAt": "2024-06-11T20:00:11.453Z",
                        "productId": "pro_01j04dw2a1z9s6xr2c9y1jaq0z",
                        "unitPrice": {
                            "amount": "1000",
                            "currencyCode": "USD"
                        },
                        "updatedAt": "2024-06-13T16:35:26.015282Z",
                        "customData": null,
                        "description": "ReviewNudgeBot Plus monthly",
                        "trialPeriod": null,
                        "billingCycle": {
                            "interval": "month",
                            "frequency": 1
                        },
                        "unitPriceOverrides": []
                    },
                    "priceId": "pri_01j04e5ynw6q9adg6mxty21pk4",
                    "quantity": 1,
                    "proration": null
                }
            ],
            "origin": "web",
            "status": "completed",
            "details": {
                "totals": {
                    "fee": "100",
                    "tax": "0",
                    "total": "1000",
                    "credit": "0",
                    "balance": "0",
                    "discount": "0",
                    "earnings": "900",
                    "subtotal": "1000",
                    "grandTotal": "1000",
                    "currencyCode": "USD",
                    "creditToBalance": "0"
                },
                "lineItems": [
                    {
                        "id": "txnitm_01j098t32k129dbha8cf9jn27m",
                        "totals": {
                            "tax": "0",
                            "total": "1000",
                            "discount": "0",
                            "subtotal": "1000"
                        },
                        "itemId": null,
                        "product": {
                            "id": "pro_01j04dw2a1z9s6xr2c9y1jaq0z",
                            "name": "ReviewNudgeBot Plus",
                            "type": "standard",
                            "status": "active",
                            "imageUrl": "https:\/\/ucarecdn.com\/ab7fd42d-62b9-4168-b962-7ecd46323fa8\/",
                            "createdAt": "2024-06-11T19:54:47.489Z",
                            "updatedAt": "2024-06-11T19:54:47.489Z",
                            "customData": null,
                            "description": "ReviewNudgeBot Plus package",
                            "taxCategory": "standard"
                        },
                        "priceId": "pri_01j04e5ynw6q9adg6mxty21pk4",
                        "quantity": 1,
                        "taxRate": "0",
                        "unitTotals": {
                            "tax": "0",
                            "total": "1000",
                            "discount": "0",
                            "subtotal": "1000"
                        }
                    }
                ],
                "payoutTotals": {
                    "fee": "100",
                    "tax": "0",
                    "total": "1000",
                    "credit": "0",
                    "balance": "0",
                    "discount": "0",
                    "earnings": "900",
                    "feeRate": "0.05",
                    "subtotal": "1000",
                    "grandTotal": "1000",
                    "currencyCode": "USD",
                    "exchangeRate": "1",
                    "creditToBalance": "0"
                },
                "taxRatesUsed": [
                    {
                        "totals": {
                            "tax": "0",
                            "total": "1000",
                            "discount": "0",
                            "subtotal": "1000"
                        },
                        "taxRate": "0"
                    }
                ],
                "adjustedTotals": {
                    "fee": "100",
                    "tax": "0",
                    "total": "1000",
                    "earnings": "900",
                    "subtotal": "1000",
                    "grandTotal": "1000",
                    "currencyCode": "USD"
                }
            },
            "checkout": {
                "url": "https:\/\/reviewnudgebot.com\/pay-test?_ptxn=txn_01j098rkyax69765hrsh4v9rvj"
            },
            "payments": [
                {
                    "amount": "1000",
                    "status": "captured",
                    "createdAt": "2024-06-13T17:03:06.923828Z",
                    "errorCode": null,
                    "capturedAt": "2024-06-13T17:03:09.865266Z",
                    "methodDetails": {
                        "card": {
                            "type": "visa",
                            "last4": "4242",
                            "expiryYear": 2025,
                            "expiryMonth": 11,
                            "cardholderName": "Maksym Harbovskyi"
                        },
                        "type": "card"
                    },
                    "paymentMethodId": "paymtd_01j098v54rwxrfcdhm2a3d12gn",
                    "paymentAttemptId": "6c273d16-4903-4046-b4b2-56a88aa50869",
                    "storedPaymentMethodId": "9c487b06-f557-4fe6-9c8b-655768045c6b"
                }
            ],
            "billedAt": "2024-06-13T17:03:10.349048Z",
            "addressId": "add_01j098s7e623anjce94efxxv2j",
            "createdAt": "2024-06-13T17:01:43.85161Z",
            "invoiceId": "inv_01j098v8tgb3tw22qecet77y9s",
            "updatedAt": "2024-06-13T17:03:11.490722218Z",
            "businessId": "biz_01j098t2dta4fym66c0z2b53dr",
            "customData": null,
            "customerId": "ctm_01j098s7dm9hzabrtrv3trjswv",
            "discountId": null,
            "receiptData": null,
            "currencyCode": "USD",
            "billingPeriod": {
                "endsAt": "2024-07-13T17:03:09.865266Z",
                "startsAt": "2024-06-13T17:03:09.865266Z"
            },
            "invoiceNumber": "7492-10002",
            "billingDetails": null,
            "collectionMode": "automatic",
            "subscriptionId": "sub_01j098v8sar4r0jxh5dqkvb6vd"
        }
    }

    return updateSubscription(eventData.data.customerId, {
        is_subscription_completed: true,
    });
}

const handleSubscriptionCreated = async (eventData) => {
    console.log(`Subscription ${eventData.data.id} was created`);
    const example = {
        "eventId": "evt_01j098v9kt4zbsvwy0pdzex03s",
        "eventType": "subscription.created",
        "occurredAt": "2024-06-13T17:03:11.482909Z",
        "notificationId": "ntf_01j098v9tgqxymhbqd1sry3cdw",
        "data": {
            "id": "sub_01j098v8sar4r0jxh5dqkvb6vd",
            "items": [
                {
                    "price": {
                        "id": "pri_01j04e5ynw6q9adg6mxty21pk4",
                        "name": "ReviewNudgeBot Plus monthly",
                        "type": "standard",
                        "status": "active",
                        "quantity": {
                            "maximum": 1,
                            "minimum": 1
                        },
                        "taxMode": "account_setting",
                        "createdAt": "2024-06-11T20:00:11.453Z",
                        "productId": "pro_01j04dw2a1z9s6xr2c9y1jaq0z",
                        "unitPrice": {
                            "amount": "1000",
                            "currencyCode": "USD"
                        },
                        "updatedAt": "2024-06-13T16:35:26.015282Z",
                        "customData": null,
                        "description": "ReviewNudgeBot Plus monthly",
                        "importMeta": null,
                        "trialPeriod": null,
                        "billingCycle": {
                            "interval": "month",
                            "frequency": 1
                        },
                        "unitPriceOverrides": []
                    },
                    "status": "active",
                    "quantity": 1,
                    "recurring": true,
                    "createdAt": "2024-06-13T17:03:10.634Z",
                    "updatedAt": "2024-06-13T17:03:10.634Z",
                    "trialDates": null,
                    "nextBilledAt": "2024-07-13T17:03:09.865266Z",
                    "previouslyBilledAt": "2024-06-13T17:03:09.865266Z"
                }
            ],
            "status": "active",
            "discount": null,
            "pausedAt": null,
            "addressId": "add_01j098s7e623anjce94efxxv2j",
            "createdAt": "2024-06-13T17:03:10.634Z",
            "startedAt": "2024-06-13T17:03:09.865266Z",
            "updatedAt": "2024-06-13T17:03:10.634Z",
            "businessId": "biz_01j098t2dta4fym66c0z2b53dr",
            "canceledAt": null,
            "customData": null,
            "customerId": "ctm_01j098s7dm9hzabrtrv3trjswv",
            "importMeta": null,
            "billingCycle": {
                "interval": "month",
                "frequency": 1
            },
            "currencyCode": "USD",
            "nextBilledAt": "2024-07-13T17:03:09.865266Z",
            "transactionId": "txn_01j098rkyax69765hrsh4v9rvj",
            "billingDetails": null,
            "collectionMode": "automatic",
            "firstBilledAt": "2024-06-13T17:03:09.865266Z",
            "scheduledChange": null,
            "currentBillingPeriod": {
                "endsAt": "2024-07-13T17:03:09.865266Z",
                "startsAt": "2024-06-13T17:03:09.865266Z"
            }
        }
    }

    return updateSubscription(eventData.data.customerId, {
        paddle_subscription_id: eventData.data.id,
        paddle_subscription_status: eventData.data.status,
        paddle_subscription_updated_at: eventData.data.updatedAt,
        paddle_subscription_currency_code: eventData.data.currencyCode,
        paddle_subscription_collection_mode: eventData.data.collectionMode,
        paddle_subscription_next_billed_at: eventData.data.nextBilledAt,
        paddle_subscription: JSON.stringify(eventData.data)
    });
}

const handleSubscriptionCanceled = async (eventData) => {
    console.log(`Subscription ${eventData.data.id} was cancelled`);
    const example = {
        "eventId": "evt_01j0994spsvx3n103n589h1g5g",
        "eventType": "subscription.canceled",
        "occurredAt": "2024-06-13T17:08:22.873679Z",
        "notificationId": "ntf_01j0994strr7nykhkjrs16x3yb",
        "data": {
            "id": "sub_01j098v8sar4r0jxh5dqkvb6vd",
            "items": [
                {
                    "price": {
                        "id": "pri_01j04e5ynw6q9adg6mxty21pk4",
                        "name": "ReviewNudgeBot Plus monthly",
                        "type": "standard",
                        "status": "active",
                        "quantity": {
                            "maximum": 1,
                            "minimum": 1
                        },
                        "taxMode": "account_setting",
                        "createdAt": "2024-06-11T20:00:11.453Z",
                        "productId": "pro_01j04dw2a1z9s6xr2c9y1jaq0z",
                        "unitPrice": {
                            "amount": "1000",
                            "currencyCode": "USD"
                        },
                        "updatedAt": "2024-06-13T16:35:26.015282Z",
                        "customData": null,
                        "description": "ReviewNudgeBot Plus monthly",
                        "importMeta": null,
                        "trialPeriod": null,
                        "billingCycle": {
                            "interval": "month",
                            "frequency": 1
                        },
                        "unitPriceOverrides": []
                    },
                    "status": "active",
                    "quantity": 1,
                    "recurring": true,
                    "createdAt": "2024-06-13T17:03:10.634Z",
                    "updatedAt": "2024-06-13T17:03:10.634Z",
                    "trialDates": null,
                    "nextBilledAt": null,
                    "previouslyBilledAt": "2024-06-13T17:03:09.865266Z"
                }
            ],
            "status": "canceled",
            "discount": null,
            "pausedAt": null,
            "addressId": "add_01j098s7e623anjce94efxxv2j",
            "createdAt": "2024-06-13T17:03:10.634Z",
            "startedAt": "2024-06-13T17:03:09.865266Z",
            "updatedAt": "2024-06-13T17:08:21.838Z",
            "businessId": "biz_01j098t2dta4fym66c0z2b53dr",
            "canceledAt": "2024-06-13T17:08:21.832Z",
            "customData": null,
            "customerId": "ctm_01j098s7dm9hzabrtrv3trjswv",
            "importMeta": null,
            "billingCycle": {
                "interval": "month",
                "frequency": 1
            },
            "currencyCode": "USD",
            "nextBilledAt": null,
            "billingDetails": null,
            "collectionMode": "automatic",
            "firstBilledAt": "2024-06-13T17:03:09.865266Z",
            "scheduledChange": null,
            "currentBillingPeriod": null
        }
    }

    const subscription = await getSubscriptionByCustomerId(eventData.data.customerId);
    return updateSubscription(eventData.data.customerId, {
        paddle_subscription_status: eventData.data.status,
        paddle_subscription_cancelled_at: eventData.data.canceledAt,
        paddle_subscription_updated_at: eventData.data.updatedAt,
        paddle_subscription: JSON.stringify(eventData.data)
    }).then(() => {
        if (subscription.slack_team_id) {
            updateConfigPaddleCustomerId(
                subscription.slack_team_id,
                eventData.data.customerId,
                false,
            );
        }
    });
}

module.exports.handlePaddleEvent = handlePaddleEvent;