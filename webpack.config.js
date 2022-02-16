const apifonSMS = require('./modules/apifon-sms/webpack.config');
const apifonViber = require('./modules/apifon-viber/webpack.config');

module.exports = function(env, argv) {
    return [
        apifonSMS(env, argv),
        apifonViber(env, argv)
    ];
};
