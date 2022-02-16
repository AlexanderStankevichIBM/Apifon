const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')

const submodules = [
    require('./modules/apifon-sms/app/app'),
    require('./modules/apifon-viber/app/app')
];

const app = express();

// parse application/json
app.use(bodyParser.json())

app.set('port', (process.env.PORT || 80));
app.use('/', express.static(path.join(__dirname, 'home')));
app.use('/assets', express.static(path.join(__dirname, '/node_modules/@salesforce-ux/design-system/assets')));


submodules.forEach((sm) => sm(app, {
    rootDirectory: __dirname,
}));

app.listen(app.get('port'), function() {
    console.log(`Express is running at: ${app.get('port')}`);
});
