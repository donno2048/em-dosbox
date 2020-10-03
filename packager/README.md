# Packager

This is an alternative to the emscripten packager thereby making emscripten totally unecessary for packaging programs.

## Installation

Installation required nodejs with the normal `npm install`.

## Usage

```shell
node packager.js args

-p / --path    [required]    The path of the filesystem containing your application
-o / --output  [required]    The name of the output files, aka the package name
-r / --run     [optional]    Mount Virtual Drive and Run EXE upon loading

For example to run QBasic one could have all files in \QBASIC folder

npm install
node packager.js -p qbasic/ -o qbasic -r \QBASIC\QB.EXE
```

This results in a qbasic.data (Encoded Root File System), qbasic.js (The application support JavaScript) and dosbox.wasm

### Running

```html
<html>
    <head>
    <title>My QBasic Application</title>
    </head>
    <body>
    <canvas id="cnv" data-function="screen"></canvas>
    <input type="hidden" data-function="error" />
    <script type="text/javascript" src="qbasic.js"></script>
    </body>

```

### Known Bugs

* Autorun doesn't fire like it should, so with --run creates a command to mount the C: drive, and then runs your application.
* Audio is only activated after you click into the virtual screen (canvas), this is a chrome design choice.
