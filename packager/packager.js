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

            directories.push({ parent: parent, name: subFilesToRead[i].name });
            findFilesToRead(parent, subFilesToRead[i].name);

        } else {

            var buf = fs.readFileSync(parent + "/" + subFilesToRead[i].name);
            files.push({ parent: parent, name: subFilesToRead[i].name, buffer: buf });
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
        directories.push({ parent: usage.path, name: filesToRead[i].name })
        findFilesToRead(usage.path, filesToRead[i].name);

    } else {

        var buf = fs.readFileSync(usage.path + "/" + filesToRead[i].name);
        files.push({ parent: usage.path, name: filesToRead[i].name, buffer: buf });
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
        filename: (files[i].parent.substr(usage.path.length)) + '/' + files[i].name,
        start: files[i].start,
        end: files[i].end
    })
}

var code = require('./template')(usage, jsDirectories, files);

//Validate and tidy
try {
    var formatted = prettier.format(code);
} catch (e) {
    console.error(e);
    return -1;
}

fs.writeFileSync(`${usage.output}.js`, formatted);
fs.writeFileSync(`${usage.output}.data`, img);
return 0;