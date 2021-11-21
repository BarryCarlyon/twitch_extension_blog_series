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

/*
CSP
*/

/*
Current base CSP rules subject to change

See:
https://discuss.dev.twitch.tv/t/new-extensions-policy-for-content-security-policy-csp-directives-and-timeline-for-enforcement/33695/2

This example is based off a live extension
*/
let contentSecurityPolicy = {
    directives: {
        defaultSrc: [
            "'self'",
            `https://${twitch.client_id}.ext-twitch.tv`
        ],
        connectSrc: [
            "'self'",
            `https://${twitch.client_id}.ext-twitch.tv`,
            'https://extension-files.twitch.tv',
            'https://www.google-analytics.com',
            'https://stats.g.doubleclick.net'
        ],
        fontSrc:    [
            "'self'",
            `https://${twitch.client_id}.ext-twitch.tv`,
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com'
        ],
        imgSrc:     [
            "'self'",
            'data:',
            'blob:'
        ],
        mediaSrc:   [
            "'self'",
            'data:',
            'blob:'
        ],
        scriptSrc:  [
            "'self'",
            `https://${twitch.client_id}.ext-twitch.tv`,
            'https://extension-files.twitch.tv',
            'https://www.google-analytics.com',
            'https://stats.g.doubleclick.net'
        ],
        styleSrc:   [
            "'self'",
            "'unsafe-inline'",
            `https://${twitch.client_id}.ext-twitch.tv`,
            'https://fonts.googleapis.com'
        ],

        frameAncestors: [
            'https://supervisor.ext-twitch.tv',
            'https://extension-files.twitch.tv',
            'https://*.twitch.tv',
            'https://*.twitch.tech',
            'https://localhost.twitch.tv:*',
            'https://localhost.twitch.tech:*',
            'http://localhost.rig.twitch.tv:*'
        ]
    }
}

/*
should we enable the Rig?

The rig being an electron app, will call some other things
As well as having a file:// based parent
*/
if (csp_options.enable_rig) {
    let rig_sources = {
        connectSrc: [
            'wss://pubsub-edge.twitch.tv'
        ],
        frameAncestors: [
            'http://localhost:*',
            'file://*',
            'filesystem:'
        ]
    }

    // append these to the CSP
    for (let sourceType in rig_sources) {
        for (let x=0;x<rig_sources[sourceType].length;x++) {
            contentSecurityPolicy.directives[sourceType].push(rig_sources[sourceType][x]);
        }
    }
}
/*
Report URI will send a POST payload to a endpoint of your chooseing with information

https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/report-uri
Report URI is deprecated to be replace by report to, but not all browser supported it yet
*/
if (csp_options.report_uri) {
    contentSecurityPolicy.directives.reportUri = csp_options.report_uri;
}

/*
Did we configure an EBS to call
*/
if (csp_options.ebs_domain) {
    let test_only = {
        imgSrc: [
            'https://' + csp_options.ebs_domain,
            'wss://' + csp_options.ebs_domain
        ],
        mediaSrc: [
            'https://' + csp_options.ebs_domain,
            'wss://' + csp_options.ebs_domain
        ],
        connectSrc: [
            'https://' + csp_options.ebs_domain,
            'wss://' + csp_options.ebs_domain
        ]
    }

    for (let sourceType in test_only) {
        for (let x=0;x<test_only[sourceType].length;x++) {
            contentSecurityPolicy.directives[sourceType].push(test_only[sourceType][x]);
        }
    }
}

/*
Did we configure places that we can/may load media from
And yes we are just gonna glob them to all three groups
For example purposes
*/
csp_options.content_domains.forEach(domain => {
    contentSecurityPolicy.directives.imgSrc.push(domain);
    contentSecurityPolicy.directives.mediaSrc.push(domain);
    contentSecurityPolicy.directives.connectSrc.push(domain);
});

const helmet = require('helmet');
/*
You can use Security Headers to test your server, if this server is web accessable
https://securityheaders.com/
It'll test that your CSP is valid.
Best testing done with an extension, on Twitch or in the rig!
*/

console.log('Going to use the following CSP', contentSecurityPolicy);

app.use(helmet({
    contentSecurityPolicy
}));


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

/*
Setup Chokidar to watch for changes
*/
const chokidar = require('chokidar');

console.log('Monitor: ' + __dirname + '/develop/dev/');
const watcher = chokidar.watch([
    __dirname + '/develop/dev/'
], {
    ignored: /(^|[\/\\])\../,
    persistent: true
});

// https://davidwalsh.name/node-watch-file
watcher
    .on('error', function(error) { console.log('Error happened', error); })
    .on('ready', function() {
        if (!ready) {
            console.log('Initial scan complete. Ready for changes.');

            console.log('First Build');
            runBuild();

            ready = true;
        }
    })
    .on('add', function(path) {
        go(path);
    })
    .on('change', function(path) {
        go(path);
    })
    .on('unlink', function(path) {
        go(path);
    });

let ready = false;
function go(path) {
    if (ready) {
        console.log(path.replace(__dirname + '/develop/dev/', ''));
        // call compile
        runBuild();
    }
}

function runBuild() {
    var r = 'cd ' + __dirname + '/develop/dev && ./script.sh';
    console.log(r);
    child_process.exec(r, function(err, stdout, stderr) {
        if (err) {
            console.log(err);
        } else {
            console.log(stdout);
            console.error(stderr);
        }
    });
}
