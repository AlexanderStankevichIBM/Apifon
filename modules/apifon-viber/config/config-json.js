module.exports = function configJSON(req) {
  return {
    workflowApiVersion: '1.1',
    metaData: {
      icon: `images/apifon.png`,
      category: 'message'
    },
    type: 'REST',
    lang: {
      'en-US': {
        name: 'Apifon Viber',
        description: 'Send Viber Message via APIFON.'
      }
    },
    arguments: {
      execute: {
        inArguments: [],
        outArguments: [],
        url: `https://${req.headers.host}/modules/apifon-viber/execute`,
        // The amount of time we want Journey Builder to wait before cancel the request. Default is 60000, Minimal is 1000
        timeout: 10000,
        // how many retrys if the request failed with 5xx error or network error. default is 0
        retryCount: 3,
        // wait in ms between retry.
        retryDelay: 1000,
        // The number of concurrent requests Journey Builder will send all together
        concurrentRequests: 5
      }
    },
    configurationArguments: {
      publish: {
        url: `https://${req.headers.host}/modules/apifon-viber/publish`
      },
      validate: {
        url: `https://${req.headers.host}/modules/apifon-viber/validate`
      },
      stop: {
        url: `https://${req.headers.host}/modules/apifon-viber/stop`
      },
      save: {
        url: `https://${req.headers.host}/modules/apifon-viber/save`
      }
    },
    userInterfaces: {
      configurationSupportsReadOnlyMode : true,
      configInspector: {
        size: 'scm-lg',
        emptyIframe: true
      }
    }
  };
};
