'use strict';

const fs = require('fs');
const commandLineArgs = require('command-line-args');
//var buffer = require('buffer').Buffer;
///FUTURE: var pako = require('pako');
const prettier = require("prettier-standard");

const usage = commandLineArgs([
    {
        name: 'output', alias: 'o', description: 'Output package name which results in packagename.html and packagename.js', require
    },
    {
        name: 'path', alias: 'p', description: 'Path containing the files for DOS'
    },
    {
        name: 'run', alias: 'r', description: 'Run file at launch'
    }
])

//Check args
if ((!usage.output) || (!usage.path)) {
    console.log(usage);
    return 0;
}

//Check path exists
if (!fs.existsSync(usage.path)) {
    console.error(`Path containing files does not exist: ${usage.path}`);
}

var files = [];
var directories = [];
var imgSize = 0;

function findFilesToRead(path, node) {

    var subFilesToRead = fs.readdirSync(path + "/" + node, { withFileTypes: true });

    for (var i = 0; i < subFilesToRead.length; i++) {

        var parent = path + "/" + node;

        if (subFilesToRead[i].isDirectory()) {

            directories.push({ parent: parent.substr(usage.path.length), name: subFilesToRead[i].name });
            findFilesToRead(parent, subFilesToRead[i].name);

        } else {

            var buf = fs.readFileSync(parent + "/" + subFilesToRead[i].name);
            files.push({ parent: parent.substr(usage.path.length), name: subFilesToRead[i].name, buffer: buf });
            imgSize += buf.length;

        }
    }
}

//Build up file list
var filesToRead = fs.readdirSync(usage.path, { withFileTypes: true });

//Add to vfs
for (var i = 0; i < filesToRead.length; i++) {

    if (filesToRead[i].isDirectory()) {
        //Recursive
        directories.push({ parent: '/', name: filesToRead[i].name })
        findFilesToRead(usage.path, filesToRead[i].name);

    } else {

        var buf = fs.readFileSync(usage.path + "/" + filesToRead[i].name);
        files.push({ parent: '/', name: filesToRead[i].name, buffer: buf });
        imgSize += buf.length;

    }
}

//Template 
/*
 * {
 * start: x
 * audio: 0
 * end: 130
 * filename: "/BIN/BRIEF.EXE"
}*/

//Iterate over directories and create disk
var img = Buffer.allocUnsafe(imgSize);
var nextStart = 0;

for (var i = 0; i < files.length; i++) {
    files[i].buffer.copy(img, nextStart);
    files[i].start = nextStart;
    files[i].end = nextStart + files[i].buffer.length;
    nextStart += files[i].buffer.length;
    delete files[i].buffer;
}

///FUTURE: var compressed = pako.deflate(img.buffer);

//console.log(`Compressed image ${img.length} bytes to ${compressed.length}`);

//Create directories in VFS
var jsDirectories = "";
for (var i = 0; i < directories.length; i++) {
    jsDirectories += `
        Module.FS_createPath("${directories[i].parent}", "${directories[i].name}", true, true);
    `
}

var jsFiles = [];

for (var i = 0; i < files.length; i++) {
    jsFiles.push({
        filename: files[i].parent + '/' + files[i].name,
        start: files[i].start,
        end: files[i].end
    })
}

var moduleTemplate = fs.readFileSync('./moduleTemplate.js');
var fileTemplate = require('./fileTemplate')(usage, jsDirectories, jsFiles);
var dosBoxSrc = fs.readFileSync('../dist/dosbox.js');
var args = `
(function () {
    //Add play icon to canvas
    var canvas = document.getElementsByTagName("canvas")[0];
    var img = new Image();
    img.onload = function() {
        canvas.getContext('2d').drawImage(img, 0, 0);
    }
    img.src = "data:image/svg+xml;charset=utf-8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjxzdmcgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgNzQ0LjA5IDEwNTIuNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCiA8ZyB0cmFuc2Zvcm09Im1hdHJpeCguODYyMzMgMCAwIC44NjYxMyAtNDM4Ljg4IDEyNi4xMSkiPg0KICA8cmVjdCB4PSI1NDMuODEiIHk9IjIwNi45NSIgd2lkdGg9IjgwMC45MiIgaGVpZ2h0PSI1NzMuNDciIHJ4PSI0LjI2NDgiIHJ5PSIwIiBmaWxsPSIjMGEwOTA3IiBvcGFjaXR5PSIuMjE3MjEiIHN0cm9rZT0iIzI1MCIgc3Ryb2tlLWRhc2hhcnJheT0iNS41ODcyODQ4NSwgMi43OTM2NDI0MSwgMS4zOTY4MjEyLCAyLjc5MzY0MjQxIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2Utd2lkdGg9IjIuNzkzNiIvPg0KICA8cGF0aCB0cmFuc2Zvcm09Im1hdHJpeCgyLjI4OTkgMCAwIDIuMzcxIC0xNjcuNzUgLTEzMjkuNikiIGQ9Im01NDMuMTIgNzY1Ljg4YTYxLjQzMSA1OS4xMzQgMCAxIDEgLTEyMi44NiAwIDYxLjQzMSA1OS4xMzQgMCAxIDEgMTIyLjg2IDB6IiBmaWxsPSIjNjY2IiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iNy4zOTMiLz4NCiAgPHBhdGggZD0ibTg5My40OCA0MjkuMDh2MTE4LjE0bDExNS45My01OS4xNjItMTE1LjkzLTU4Ljk3OCIgZmlsbD0iI2ZmZiIvPg0KIDwvZz4NCjwvc3ZnPg==";
    //Latch event listener so when user clicks play the module is run with specified args
    var args = '${usage.run} -c MOUNT C /SRSE';
    canvas.addEventListener("click", function (ev) {
        console.log("Launching application");
        Module.run(args.split(" "));
    });
})();
`;

//Concatenate files, dosbox and module
//Validate and tidy
try {
    var formatted = prettier.format(moduleTemplate + dosBoxSrc + fileTemplate + args);
} catch (e) {
    console.error(e);
    return -1;
}

fs.writeFileSync(`${usage.output}.js`, formatted);
fs.writeFileSync(`${usage.output}.data`, img);

console.log(`${usage.output}.js and ${usage.output}.data successfully built.`);

return 0;