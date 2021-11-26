const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

const express = require('express');
const app = express();

const config = JSON.parse(fs.readFileSync(path.join(
    __dirname,
    'config.json'
)));

const { csp_options, twitch, listen } = config;

/*
Setup Express to Listen on a Port
*/
app.listen(listen, function () {
    console.log('booted express on', listen);
})

const twitchextensioncsp = require('twitchextensioncsp');
app.use(twitchextensioncsp(csp_options);

/*
Setup a "Log" Event for file loading.
So you can see what is trying to be loaded
*/
app.use(function(req, res, next) {
    console.log('received from', req.get('X-Forwarded-For'), ':', req.method, req.originalUrl);
    next();
});
/*
Setup express Static to server those files
*/
app.use('/extension/', express.static(__dirname + '/build/'));
