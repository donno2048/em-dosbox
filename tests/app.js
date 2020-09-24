'use strict';

const DELAY = process.env.DELAY || 5000;

const commandLineArgs = require('command-line-args');
const { w3cwebsocket } = require('websocket');

const usage = commandLineArgs([
    {
        name: 'path', alias: 'p', description: 'Path for input'
    },
    {
        name: 'url', alias: 'u', description: 'Url to navigate to'
    },
    {
        name: 'port', type: Number, description: 'Port, affected by Environment Variable Port'
    },
    {
        name: 'output', alias: 'o', type: String, description: 'Output to directory [can only be used with --run'
    },
    {
        name: 'run', alias: 'r', type: Boolean, description: 'Run Tests'
    }
]);

if (process.env.PORT) {

    usage.port = process.env.PORT;

} else if (!usage.port) {

    usage.port = 8000;

}

//Run Web Server
//Load HTTP Server and WebSocket Server
App = Express();
HttpServer = App.listen(usage.port);
WsServer = new w3cwebsocket({ httpServer: HttpServer });

//Proxy
WsServer.onerror = function (err) {
    console.error(err);
}

WsServer.onopen = function () {
    console.log("Handle proxy events");
}

//Load Static File Server @ Path
App.use(Express.static(usage.path));

var stdout = "";
var stderr = "";

//Grab output
Browser.extend(function (browser) {
    browser.on('console', function (level, message) {
        console.log(level, message);
    });
});

//If run
if (usage.run) {
    const Browser = require('zombie');

    //Browse to localhost:$PORT
    Browser.localhost('localhost', usage.port);

    describe('Application is launched', function () {

        var browser = new Browser();

        before(function () {
            return browser.visit(usage.url);
        });

        setTimeout(function () {

            

        }, DELAY);

    })



}