module.exports.minExpirationPeriodMs = 10 * 1000;
module.exports.unsubSnippet = '**unsub_link**';

// Apifon credentials
// TODO: change in production!!!!!!!!!!!!!!!!!!!!!!!

module.exports.apifonAuthURL = 'https://ids.apifon.com';
module.exports.apifonRestAPI = 'https://ars.apifon.com';

module.exports.TinyUrl_token = 'TINY URL TOKEN';
module.exports.TinyUrl_API_url = 'https://api.tinyurl.com/create';

module.exports.dataExtensionExternalKey = '4CDC6DAF-7164-4356-9900-9162104A8ADB'; // DE ApifonAPIResponses

module.exports.getUnsubLink = function(subscriberKey) {
  return `https://somedomain.com/unsubscribe?subKey=${subscriberKey}`;
};

module.exports.getKeys = function(apifonProfile) {
  let clientId;
  let clientSecret;

  if (apifonProfile == 'profile_1') {
    clientId = 'ZHwcrhfLln4GYOv2GUOSlcjyGPuBouGx05dCWbwaYSWElBMU9kau9yHNDH6P7M7w';
    // clientId = 'PROFILE 1 CLIENT ID';
    clientSecret = 'PPp9IMwPxxnHpxY9MmyNgo_AsMsa';
    // clientSecret = 'PROFILE 1 CLIENT SECRET';
  } else {
    clientId = 'ZHwcrhfLln4GYOv2GUOSlcjyGPuBouGx05dCWbwaYSWElBMU9kau9yHNDH6P7M7w';
    // clientId = 'PROFILE 2 CLIENT ID';
    clientSecret = 'PPp9IMwPxxnHpxY9MmyNgo_AsMsa';
    // clientSecret = 'PROFILE 2 CLIENT SECRET';
  }

  return {clientId, clientSecret};
};

