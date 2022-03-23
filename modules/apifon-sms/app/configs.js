module.exports.minExpirationPeriodMs = 10 * 1000;
module.exports.unsubSnippet = '**unsub_link**';

// Apifon credentials
// TODO: change in production!!!!!!!!!!!!!!!!!!!!!!!

module.exports.apifonAuthURL = 'https://ids.apifon.com';
module.exports.apifonRestAPI = 'https://ars.apifon.com';

module.exports.TinyUrl_token = 'TINY URL TOKEN';
module.exports.TinyUrl_API_url = 'https://api.tinyurl.com/create';

module.exports.dataExtensionExternalKey = '4BAFF190-E9A4-4942-9BF3-A5FBF1A46CD0'; // DE ApifonAPIResponses

module.exports.getUnsubLink = function(subscriberKey) {
  return `https://somedomain.com/unsubscribe?subKey=${subscriberKey}`;
};

module.exports.getKeys = function(apifonProfile) {
  let clientId;
  let clientSecret;

  if (apifonProfile == 'profile_1') {
    clientId = 'TxQxa8b6MnubWMjOtRuSvXsEQCnOVYOJciZ2wfKqNvPpu5aJLs2MAr27jzYpmgxm';
    // clientId = 'Loyalty CLIENT ID';
    clientSecret = 's4IhlbhLWPcd_3XXhhUjBfv5z0Ia';
    // clientSecret = 'Loyalty CLIENT SECRET';
  } else {
    clientId = 'dEC1gMPFFLPGcDXzJN6XS4ADhWp5XdVzRrl2mX0aVpDYAngjskT7PgppTkTjWkNl';
    // clientId = 'PROFILE 2 CLIENT ID';
    clientSecret = 'lDi4OXfSWUuk4ZRWaW5p4QmoqEQa';
    // clientSecret = 'PROFILE 2 CLIENT SECRET';
  }

  return {clientId, clientSecret};
};

