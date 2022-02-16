const axios = require('axios');
const {v1: uuidv1} = require('uuid');
const SFClient = require('../../../utils/sfmc-client');

const {
  apifonAuthURL,
  apifonRestAPI,
  dataExtensionExternalKey,
  getKeys, getUnsubLink,
  minExpirationPeriodMs,
  TinyUrl_API_url, TinyUrl_token,
  unsubSnippet
} = require('./configs');

const tokens = {};

// Find the in argument - this is from example, probably will be removed
function getInArgument(req, k) {
  const request = req.body;

  if (request && request.inArguments) {
    for (let i = 0; i < request.inArguments.length; i++) {
      const e = request.inArguments[i];
      if (k in e) {
        return e[k];
      }
    }
  }
}

async function sendResponseToSFMC(subscriberKey, url, response) {
  const id = uuidv1();
  try {
    await SFClient.saveData(dataExtensionExternalKey, [{
      keys: {
        Id: id,
        SubscriberKey: subscriberKey,
      },
      values: {
        Response: response,
        Url: url,
      },
    }]);
  } catch (error) {
    console.log(error);
  }
}

let promisedTokens = {};
module.exports.getToken = async function(apifonProfile) {
  let promisedToken = promisedTokens[apifonProfile]

  if (promisedToken && !promisedToken.isResolved) {
    return await promisedToken;
  }

  const lastToken = tokens[apifonProfile];

  if (lastToken) {
	const tokenTimeLeftMs = lastToken.expiresAt - Date.now();
    if (tokenTimeLeftMs > minExpirationPeriodMs) {
      console.log('debug: Token for', apifonProfile, 'found!')
      return lastToken.access_token;
    }
    console.log('debug: Token is expired')
  }

  console.log('Requesting new token for', apifonProfile);

  // Initialize promisedToken
  let resolveToken;
  promisedToken = new Promise((resolve) => {
    resolveToken = resolve;
  });
  promisedTokens[apifonProfile] = promisedToken

  // Token WILL expire in less than {tokenTimeLeftMs} milliseconds
  // There is no need for pause if the token is already expired
  if (lastToken && lastToken.expiresAt > Date.now()) {
    // Pause execution for {tokenTimeLeftMs} + 1 milliseconds, to assure a fresh token
    await new Promise((resolve) => setTimeout(resolve, minExpirationPeriodMs + 1));
  }

  const {clientId, clientSecret} = getKeys(apifonProfile);

  const url = apifonAuthURL + '/oauth2/token';
  const requestedScopes = 'accountInfo+imGateway+smsGateway';
  const body = 'grant_type=client_credentials&client_id=CLIENT_ID&client_secret=CLIENT_SECRET&scopes=REQUESTED_SCOPES'
    .replace('CLIENT_ID', clientId)
    .replace('CLIENT_SECRET', clientSecret)
    .replace('REQUESTED_SCOPES', requestedScopes);
  const headers = {'Content-Type': 'application/x-www-form-urlencoded'};

  const token = await axios
    .post(url, body, {headers})
    .then((response) => {
      sendResponseToSFMC('AutoGetToken', url, JSON.stringify(response.data));
      return response.data;
    })
    .catch((error) => {
      console.log(error.response, ['config', 'headers', 'status', 'statusText', 'data']);
      sendResponseToSFMC('GetToken', url,
        JSON.stringify(error.response, ['config', 'headers', 'status', 'statusText', 'data']));
    });

  promisedToken.isResolved = true;

  if (!token) {
    resolveToken(null);
    return null;
  }

  // Save when the token is going to expire in milliseconds
  // Casing is not the as the response, as 
  token.expiresAt = Date.now() + (token.expires_in * 1000);
  // Save the token for future requests
  tokens[apifonProfile] = token;

  // Unlock pending requests that need the token
  resolveToken(token.access_token);
  return token.access_token;
};

module.exports.sendSMS = async function(req) {
  const apifonProfile = getInArgument(req, 'apifonProfile');
  const token = await module.exports.getToken(apifonProfile);

  const smsApiUrl = apifonRestAPI + '/services/api/v1/sms/send';
  const smsApiHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    'Authorization': `Bearer ${token}`,
  };

  const subscriberKey = getInArgument(req, 'subscriberKey');
  const smsPhoneNumber = getInArgument(req, 'phoneNumber');
  const smsSenderId = getInArgument(req, 'senderId');
  const smsJourneyMessageId = getInArgument(req, 'journeyMessageId');
  let smsMessage = getInArgument(req, 'smsText');

  smsMessage = processUnsubLink(subscriberKey, smsMessage);

  const smsApiBody = {
    'message': {
      'text': smsMessage,
      'sender_id': smsSenderId,
    },
    'subscribers': [{
      'number': smsPhoneNumber,
      'custom_id': subscriberKey,
    }],
    'callback_url': `https://${req.headers.host}/modules/apifon-sms/callback`,
    'reference_id': smsJourneyMessageId,
  };

  axios
    .post(smsApiUrl, smsApiBody, {headers: smsApiHeaders})
    .then((result) => {
      console.log('SMS send: ' + result.headers);
      sendResponseToSFMC(subscriberKey, smsApiUrl, JSON.stringify(result.data));
    })
    .catch((error) => {
      console.log('SMS send error:');
      const errorToString = JSON.stringify(error.response, ['config', 'headers', 'status', 'statusText', 'data']);
      console.log(errorToString);
      sendResponseToSFMC(subscriberKey, smsApiUrl, errorToString);
    });
};

async function getShortenedLink(unsubLink, smsText) {
  const TinyUrl_API_headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TinyUrl_token}`,
    'Accept': 'application/json',
  };
  const TinyUrl_API_body = {
    'url': unsubLink,
    'domain': 'somedomain',
    'tags': 'unsubscribe',
  };

  await axios
    .post(TinyUrl_API_url, TinyUrl_API_body, {
      headers: TinyUrl_API_headers
    })
    .then((result) => {
      const TinyUrlRespo = result.data;
      let shortenedLink;
      
      if (TinyUrlRespo.errors.length == 0) {
        shortenedLink = TinyUrlRespo.data.tiny_url;
        smsText = smsText.replace(unsubSnippet, shortenedLink);
      } else {
        smsText = smsText.replace(unsubSnippet, unsubLink);
      }
    })
    .catch((error) => {
      smsText = smsText.replace(unsubSnippet, unsubLink);
      // console.log('TinyUrl error:');
      // console.log(error);
    });

  return smsText;
}

function processUnsubLink(subscriberKey, smsText) {
  if (smsText.includes(unsubSnippet)) {
    const unsubLink = getUnsubLink(subscriberKey);
    smsText = getShortenedLink(unsubLink, smsText);
  }
  return smsText
}
