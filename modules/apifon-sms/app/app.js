// JOURNEY BUILDER CUSTOM ACTIVITY - Apifon SMS ACTIVITY
// ````````````````````````````````````````````````````````````
// SERVER SIDE IMPLEMENTATION
//
// This code handles
// * Configuration Lifecycle Events
//    - save
//    - publish
//    - validate
// * Execution Lifecycle Events
//    - execute
//    - stop

const express = require('express');
const {v1: Uuidv1} = require('uuid');

const configJSON = require('../config/config-json');
const SFClient = require('../../../utils/sfmc-client');

const {sendSMS} = require('./helpers');

module.exports = function apifonSMS(app, options) {
  const moduleDirectory = `${options.rootDirectory}/modules/apifon-sms`;

  // setup static resources
  app.use('/modules/apifon-sms/dist', express.static(`${moduleDirectory}/dist`));
  app.use('/modules/apifon-sms/images', express.static(`${moduleDirectory}/images`));

  // setup the index redirect
  app.get('/modules/apifon-sms/', function (req, res) {
    return res.redirect('/modules/apifon-sms/index.html');
  });

  // setup index.html route
  app.get('/modules/apifon-sms/index.html', function (req, res) {
    // you can use your favorite templating library to generate your html file.
    // this example keeps things simple and just returns a static file
    console.log('get /modules/apifon-sms/index.html');
    return res.sendFile(`${moduleDirectory}/html/index.html`);
  });

  // setup config.json route
  app.get('/modules/apifon-sms/config.json', function (req, res) {
    // Journey Builder looks for config.json when the canvas loads.
    // We'll dynamically generate the config object with a function
    console.log('get /modules/apifon-sms/config.json');
    return res.status(200).json(configJSON(req));
  });

  // ```````````````````````````````````````````````````````
  // BEGIN JOURNEY BUILDER LIFECYCLE EVENTS
  //
  // CONFIGURATION
  // ```````````````````````````````````````````````````````
  // Reference:
  // https://developer.salesforce.com/docs/atlas.en-us.mc-apis.meta/mc-apis/interaction-operating-states.htm

  /**
   * Called when a journey is saving the activity.
   * @return {[type]}     [description]
   * 200 - Return a 200 iff the configuraiton is valid.
   * 30x - Return if the configuration is invalid (this will block the publish phase)
   * 40x - Return if the configuration is invalid (this will block the publish phase)
   * 50x - Return if the configuration is invalid (this will block the publish phase)
   */
  app.post('/modules/apifon-sms/save', function(req, res) {
    console.log('debug: /modules/apifon-sms/save');
    return res.status(200).json({"success": true});
  });

  /**
   * Called when a Journey has been published.
   * This is when a journey is being activiated and eligible for contacts
   * to be processed.
   * @return {[type]}     [description]
   * 200 - Return a 200 iff the configuraiton is valid.
   * 30x - Return if the configuration is invalid (this will block the publish phase)
   * 40x - Return if the configuration is invalid (this will block the publish phase)
   * 50x - Return if the configuration is invalid (this will block the publish phase)
   */
  app.post('/modules/apifon-sms/publish', function(req, res) {
    console.log('debug: /modules/apifon-sms/publish');
    return res.status(200).json({"success": true});
  });

  /**
   * Called when Journey Builder wants you to validate the configuration
   * to ensure the configuration is valid.
   * @return {[type]}
   * 200 - Return a 200 iff the configuraiton is valid.
   * 30x - Return if the configuration is invalid (this will block the publish phase)
   * 40x - Return if the configuration is invalid (this will block the publish phase)
   * 50x - Return if the configuration is invalid (this will block the publish phase)
   */
  app.post('/modules/apifon-sms/validate', function(req, res) {
    console.log('debug: /modules/apifon-sms/validate');
    return res.status(200).json({"success": true});
  });


  // ```````````````````````````````````````````````````````
  // BEGIN JOURNEY BUILDER LIFECYCLE EVENTS
  //
  // EXECUTING JOURNEY
  // ```````````````````````````````````````````````````````

  /**
   * Called when a Journey is stopped.
   * @return {[type]}
   */
  app.post('/modules/apifon-sms/stop', function(req, res) {
    console.log('debug: /modules/apifon-sms/stop');
    return res.status(200).json({"success": true});
  });

  /**
   * Called when a contact is flowing through the Journey.
   * @return {[type]}
   * 200 - Processed OK
   * 3xx - Contact is ejected from the Journey.
   * 4xx - Contact is ejected from the Journey.
   * 5xx - Contact is ejected from the Journey.
   */
  app.post('/modules/apifon-sms/execute', (req, res) => {
    console.log('debug: /modules/apifon-sms/execute');
    sendSMS(req);
    const responseObject = {};
    return res.status(200).json(responseObject);
  });

  /**
   * Called when a callback is set
   */
  app.post('/modules/apifon-sms/callback', (req, res) => {
    console.log('debug: /modules/apifon-sms/callback');
    const request = req.body;
    const status = request.data[0].status.text;
    const subscriberKey = request.data[0].custom_id;
    const journeyMessageId = request.reference_id;

    sendApifonResponseToSFMC(subscriberKey, JSON.stringify(request), status, journeyMessageId);

    async function sendApifonResponseToSFMC(subscriberKey, event, text, journeyMessageId) {
      const dataExtensionExternalKey = '8E75CB2F-9D91-4A77-81F9-6CC99AEC938B'; // ApifonSMSHistory DE
      const id = Uuidv1();

      try {
        await SFClient.saveData(dataExtensionExternalKey, [{
          keys: {
            Id: id,
            SubscriberKey: subscriberKey
          },
          values: {
            Event: event,
            Text: text,
            JourneyMessageId: journeyMessageId
          },
        }, ]);
      } catch (error) {
        console.log(error);
      }
    }

    return res.end();
  });

};
