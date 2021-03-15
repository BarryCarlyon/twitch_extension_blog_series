const listen = 8050;

const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

const express = require('express');
const app = express();

/*
Setup Express to Listen on a Port
*/
app.listen(listen, function () {
    console.log('booted express on', listen);
})

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
