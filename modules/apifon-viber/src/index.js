// JOURNEY BUILDER CUSTOM ACTIVITY - Apifon Viber ACTIVITY
// ````````````````````````````````````````````````````````````
// This example demonstrates a custom activity that utilizes an external service to generate
// a discount code where the user inputs the discount percent in the configuration.
//
// Journey Builder's Postmonger Events Reference can be found here:
// https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-app-development.meta/mc-app-development/using-postmonger.htm


// Custom activities load inside an iframe. We'll use postmonger to manage
// the cross-document messaging between Journey Builder and the activity
import Postmonger from 'postmonger';

// Create a new connection for this session.
// We use this connection to talk to Journey Builder. You'll want to keep this
// reference handy and pass it into your UI framework if you're using React, Angular, Vue, etc.
const connection = new Postmonger.Session();

// we'll store the activity on this variable when we receive it
let activity = null;

// Wait for the document to load before we doing anything
document.addEventListener('DOMContentLoaded', function main() {
    // setup our ui event handlers
    setupEventHandlers();

    // Bind the initActivity event...
    // Journey Builder will respond with "initActivity" after it receives the "ready" signal
    connection.on('initActivity', onInitActivity);
    connection.on('updateActivity', onUpdateActivity);

    // We're all set! let's signal Journey Builder
    // that we're ready to receive the activity payload...
    // Tell the parent iFrame that we are ready.
    connection.trigger('ready');
});

// this function is triggered by Journey Builder via Postmonger.
// Journey Builder will send us a copy of the activity here
function onInitActivity(payload) {

    // set the activity object from this payload. We'll refer to this object as we
    // modify it before saving.
    activity = payload;

    const hasInArguments = Boolean(
        activity.arguments &&
        activity.arguments.execute &&
        activity.arguments.execute.inArguments &&
        activity.arguments.execute.inArguments.length > 0
    );

    const inArguments = hasInArguments ? activity.arguments.execute.inArguments : [];

    console.log('-------- triggered:onInitActivity({obj}) --------');
    console.log('activity:\n ', JSON.stringify(activity, null, 4));

    // let journey builder know the activity has changes
    connection.trigger('setActivityDirtyState', true);
    
    // find DE fields that we can use for personalisation
    connection.trigger('requestSchema');
    connection.on('requestedSchema', function (data) {
      //create list from JB activity schema
      const ul = document.getElementById("customization-options");
      
      data['schema'].forEach(element => {
        const el = element.key;
        if(el.startsWith("Event")) {
          const li = document.createElement("li");    
          li.appendChild(document.createTextNode('{{' + el + '}}'));
          ul.appendChild(li);
        }
      });
    });

    // load SMS text if was set 
    const viberTextArgument = inArguments.find((arg) => arg.viberText);
    if (viberTextArgument) {
      const viberTextArea = document.getElementById('apifon-viber-text');
      viberTextArea.value = viberTextArgument.viberText;
    }
    // load SMS SenderId if was set 
    const senderIdArgument = inArguments.find((arg) => arg.senderId);
    if (senderIdArgument) {
      const senderIdInput = document.getElementById('apifon-senderid');
      senderIdInput.value = senderIdArgument.senderId;
    }

    const journeyMessageIdArgument = inArguments.find((arg) => arg.journeyMessageId);
    if (journeyMessageIdArgument) {
      const journeyMessageIdInput = document.getElementById('apifon-journeymessageid');
      journeyMessageIdInput.value = journeyMessageIdArgument.journeyMessageId;
    }

    const viberImageArgument = inArguments.find((arg) => arg.viberImage);
    if (viberImageArgument) {
      const viberImage = document.getElementById('apifon-viber-image');
      viberImage.value = viberImageArgument.viberImage;
    }
    const viberActionTitleArgument = inArguments.find((arg) => arg.viberActionTitle);
    if (viberActionTitleArgument) {
      const viberActionTitle = document.getElementById('apifon-viber-button-text');
      viberActionTitle.value = viberActionTitleArgument.viberActionTitle;
    }
    const viberActionUrlArgument = inArguments.find((arg) => arg.viberActionUrl);
    if (viberActionUrlArgument) {
      const viberActionUrl = document.getElementById('apifon-viber-button-action');
      viberActionUrl.value = viberActionUrlArgument.viberActionUrl;
    }

    // load Apifon profile if was set 
    const apifonProfileArgument = inArguments.find((arg) => arg.apifonProfile);
    if (apifonProfileArgument) {
      const apifonProfileInput = document.getElementById('apifon-profileid');
      apifonProfileInput.value = apifonProfileArgument.apifonProfile;
    }

}

function onUpdateActivity(payload) {
  console.log('onUpdateActivity called!');
}

function onDoneButtonClick() {
    // we set must metaData.isConfigured in order to tell JB that
    // this activity is ready for activation
    activity.metaData.isConfigured = true;

    // get the viber text that the user inputed
    const viberText = document.getElementById('apifon-viber-text');
    const senderId = document.getElementById('apifon-senderid');
    const journeyMessageId = document.getElementById('apifon-journeymessageid');
    const apifonProfile = document.getElementById('apifon-profileid');

    const viberImage = document.getElementById('apifon-viber-image');
    const viberActionTitle = document.getElementById('apifon-viber-button-text');
    const viberActionUrl = document.getElementById('apifon-viber-button-action');

    connection.trigger('requestSchema');
    connection.on('requestedSchema', data => {
        var viberPhoneNumber;
        data['schema'].forEach(element => {
            const el = element.key;
            if(el.startsWith("Event") && el.endsWith("MobilePhone")) {
                viberPhoneNumber = '{{' + el + '}}';
            }
        });
      
        if(viberPhoneNumber) {
            activity.arguments.execute.inArguments = [{
              viberText: viberText.value,
              phoneNumber: viberPhoneNumber,
              senderId: senderId.value,
              apifonProfile: apifonProfile.value,
              subscriberKey: '{{Contact.Key}}',
              journeyMessageId: journeyMessageId.value,
              viberImage: viberImage.value,
              viberActionTitle: viberActionTitle.value,
              viberActionUrl: viberActionUrl.value
            }];

            console.log('------------ triggering:updateActivity({obj}) ----------------');
            console.log('saving\n', JSON.stringify(activity, null, 4));
            connection.trigger('updateActivity', activity);
        } else {
            console.warn('Missing MobilePhone Column!');
            activity.metaData.isConfigured = false;
            activity.arguments.execute.inArguments = [{
              viberText: viberText.value,
              senderId: senderId.value,
              apifonProfile: apifonProfile.value,
              journeyMessageId: journeyMessageId.value,
              viberImage: viberImage.value,
              viberActionTitle: viberActionTitle.value,
              viberActionUrl: viberActionUrl.value
            }];

            console.log('------------ triggering:updateActivity({obj}) ----------------');
            console.log('saving\n', JSON.stringify(activity, null, 4));
            connection.trigger('updateActivity', activity);
        } 
    });
}

function onCancelButtonClick() {
    // tell Journey Builder that this activity has no changes.
    // we wont be prompted to save changes when the inspector closes
    connection.trigger('setActivityDirtyState', false);

    // now request that Journey Builder closes the inspector/drawer
    connection.trigger('requestInspectorClose');
}

function setupEventHandlers() {
    // Listen to events on the form
    document.getElementById('done').addEventListener('click', onDoneButtonClick);
    document.getElementById('cancel').addEventListener('click', onCancelButtonClick);
}