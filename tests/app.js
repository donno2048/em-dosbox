'use strict';

const DELAY = process.env.DELAY || 5000;

const commandLineArgs = require('command-line-args');
const Express = require('express');
var app = Express();
/*const WebSocket = */require('express-ws')(app);
const fs = require('fs');
const Browser = require('puppeteer');

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
        name: 'output', alias: 'o', type: String, description: 'Output to directory [can only be used with --run]'
    },
    {
        name: 'run', alias: 'r', type: Boolean, description: 'Run Tests'
    },
    {
        name: 'headed', alias: 'd', type: Boolean, description: 'Headed [usually test automation is headless]'
    }
]);

if (process.env.PORT) {

    usage.port = Number.parseInt(process.env.PORT);

} else if (!usage.port) {

    usage.port = 8000;

}

//Run Web Server
//Load HTTP Server and WebSocket Server

var httpServer = app.listen(usage.port);

app.ws('/', function (ws, req) {
    ws.on('error', function (msg) {
        ws.send(msg);
    });
    ws.on('message', function (msg) {
        ws.send(msg);
    });

    console.log(req);
});

//Load Static File Server @ Path
app.use(Express.static(usage.path));

var std = "";

//If run
if (usage.run) {

    function iserr(err) {
        if (err) {
            console.error(err);
        }
    }

    function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function sleep(ms, fn, ...args) {
        await timeout(ms);
        return fn(...args);
    }

    async function capture(instance, page) {
        console.log("Capturing result"); //Note Windows has supported '/' in path since 2.0
        var oScreenshot = (usage.output == undefined ? (usage.path + '/screenshot.png') : (usage.output + '/screenshot.png'));
        var oStd = (usage.output == undefined ? (usage.path + '/std.txt') : (usage.output + '/std.txt'));

        await page.screenshot({ path: oScreenshot });
        fs.writeFile(oStd, std, iserr);

        console.log("Closing instance");
        await instance.close();

        console.log("Returning to main thread");
        return;
    }

    async function run() {

        console.log("Launching Instance");
        const instance = (usage.headed ? await Browser.launch({ headless: false }) : await Browser.launch());

        console.log("Opening Page");
        const page = await instance.newPage();
        page.setJavaScriptEnabled = true;

        page.on('console', msg => std += msg);

        await page.goto(`http://localhost:${usage.port}/${usage.url}`);

        //Wait for the program to run a bit
        const dimensions = await page.evaluate(() => {
            return {
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight,
                deviceScaleFactor: window.devicePixelRatio
            };
        });

        console.log(dimensions);

        //Sleep for 10 seconds, then capture with instance of browser on page x
        sleep(10000, capture, instance, page);

    };

    new Promise(run).then(() => {

        console.log("done");

    }).catch((reason) => {

        console.error(reason);

    });

}