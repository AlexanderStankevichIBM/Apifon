const FuelRest = require('fuel-rest');

const options = {
  auth: {
    clientId: 'gt06c34bny02vklfo8t239pn',
    clientSecret: '8YoB3PaYwoZDsfJkkm8TsHqP',
    authOptions: {
      authVersion: 2,
      accountId: 510003693,
    },
    authUrl: `https://mcw50wksptqsxkv74lz7glc86wty.auth.marketingcloudapis.com/v2/token`,
  },
  origin: `https://mcw50wksptqsxkv74lz7glc86wty.rest.marketingcloudapis.com/`,
  globalReqOptions: {
  },
};

const client = new FuelRest(options);

/**
 * Save data in DE
 * @param externalKey
 * @param data
 * @returns {?Promise}
 */
const saveData = async (externalKey, data) => client.post({
  uri: `/hub/v1/dataevents/key:${externalKey}/rowset`,
  headers: {
    'Content-Type': 'application/json',
  },
  json: true,
  body: data,
}).then(result => {
  console.log('save data de:::' + externalKey);
  console.log('save data::: ' + JSON.stringify(result));
}).catch(error => {
  console.log(error);
});

module.exports = {
  client,
  saveData,
};