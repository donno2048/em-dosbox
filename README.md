DOSBox ported to Emscripten
===========================

![build-em-dosbox](https://github.com/warpcoil/em-dosbox/workflows/build-em-dosbox/badge.svg)

About
-----

[DOSBox](http://www.dosbox.com/) is an open source DOS emulator designed for
running old games. [Emscripten](https://github.com/kripken/emscripten)
compiles C/C++ code to JavaScript. This is a version of DOSBox which can be
compiled with Emscripten to run in a web browser. It allows running old DOS
games and other DOS programs in a web browser.

DOSBox is distributed under the GNU General Public License. See the
[COPYING file](https://github.com/dreamlayers/em-dosbox/blob/em-dosbox-0.74/COPYING)
for more information.

Status
------

Em-DOSBox runs most games successfully in web browsers. Although DOSBox has
not been fully re-structured for running as an Emscripten main loop, most
functionality is available thanks to emterpreter sync. A few programs can
still run into problems due to paging exceptions.

**This is a highly experimental version that implements most of the incoming branch
of DOSBox, there are still sections to port (namely a rewrite of the SDL____.cpp code).**

Other issues
------------

* This version uses the latest "incoming" SVN branch of DOSBox hosted at Sourceforge, updated to 20/09/2020,
  the SDL UI code has not yet been merged, the application should run "fine" with the old codebase.
* Game save files are written into the Emscripten file system, which is by
  default an in-memory file system. Saved games will be lost when you close
  the web page.
* Compiling in Windows is supported via Windows Subsystem for Linux. The build process requires a
  Unix-like environment due to use of GNU Autotools. See Emscripten
  [issue 2208](https://github.com/kripken/emscripten/issues/2208).
* Currently the runtime expects a canvas to be present with the id of "canvas" because a querySelector exists as #canvas.  This is automatically generated but it's something to be aware of.
* The same origin policy prevents access to data files when running via a
file:// URL in some browsers. Use a web server such as
`python -m SimpleHTTPServer` instead.
* In Firefox, ensure that
[dom.max\_script\_run\_time](http://kb.mozillazine.org/Dom.max_script_run_time)
 is set to a reasonable value that will allow you to regain control in case of
a hang.
* The FPU code uses doubles and does not provide full 80 bit precision.
DOSBox can only give full precision when running on an x86 CPU.

Compiling
---------

The use of the legacy asmjs backend of emscripten is not recommended and not \[currently\] tested, consider another fork.  This version specifically targets web assembly.  To build you will need the LATEST version of Emscripten (as of 17/09/2020).

First we have to build GNU compatible configure scripts, this requires Autotools, automake, autoconf etc

```./autogen.sh```

We then need to run the configure script targetting web assembly

```./configure --enable-wasm --disable-opengl```

We can then build the application

```emmake make```

All relevant files are located in src/

Running basic DOS shell
-----------------------

Enter the src/ directory

```cd src```

And run any compliant static HTTP Server, for example:

```python2 -m SimpleHTTPServer```

With your browser, set url to http://localhost:8000/dosbox.html to be presented with a basic DOS shell:

![DosBox](https://raw.githubusercontent.com/warpcoil/em-dosbox/master/dosbox.png)

Running DOS Programs
--------------------

To run DOS programs, you need to provide a suitable web page, load files into
the Emscripten file system, and give command line arguments to DOSBox. The
simplest method is by using the included packager tools.

The normal packager tool is `src/packager.py`, which runs the Emscripten
packager. It requires `dosbox.html`, which is created when building Em-DOSBox.
If you do not have Emscripten installed, you need to use `src/repackager.py`
instead. Any packager or repackager HTML output file can be used as a template
for the repackager. Name it `template.html` and put it in the same directory
as `repackager.py`.

The following instructions assume use of the normal packager. If using
repackager, replace `packager.py` with `repackager.py`. You need
[Python 2](https://www.python.org/downloads/) to run either packager.

If you have a single DOS executable such as `Gwbasic.exe`, place
it in the same `src` directory as `packager.py` and package it using:

```./packager.py gwbasic Gwbasic.exe```

This creates `gwbasic.html` and `gwbasic.data`. Placing those in the same
directory as `dosbox.js` and viewing `gwbasic.html` will run the program in a
web browser:

Some browsers have a same origin policy that prevents access to the required
data files while using `file://` URLs. To get around this you can use Python's
built in Really Simple HTTP Server and point the browser to
[http://localhost:8000](http://localhost:8000).

```python -m SimpleHTTPServer 8000```

If you need to package a collection of DOS files. Place all the files in a
single directory and package that directory with the executable specified. For
example, if Major Stryker's files are in the subdirectory `src/major_stryker`
and it's launched using `STRYKER.EXE` you would package it using:

```./packager.py stryker major_stryker STRYKER.EXE```

Again, place the created `stryker.html` and `stryker.data` files in the same
directory as `dosbox.js` and view `stryker.html` to run the game in browser.

You can also include a [DOSBox
configuration](http://www.dosbox.com/wiki/Dosbox.conf) file that will be
acknowledged by the emulator to modify any speed, audio or graphic settings.
Simply include a `dosbox.conf` text file in the package directory before you
run `./packager.py`.

To attempt to run Major Stryker in CGA graphics mode, you would create the
configuration file `/src/major_stryker/dosbox.conf` and include this body of
text:

```
[dosbox]
machine=cga
```

Then package it using:

```./packager.py stryker-cga major_stryker STRYKER.EXE```

Credits
-------

Most of the credit belongs to the
[DOSBox crew](http://www.dosbox.com/crew.php).
They created DOSBox and made it compatible with a wide variety of DOS games.
[Ismail Khatib](https://github.com/CeRiAl) got DOSBox
to compile with Emscripten, but didn't get it to work.
[Boris Gjenero](https://github.com/dreamlayers)
started with that and got it to work. Then, Boris re-implemented
Ismail's changes a cleaner way, fixed issues and improved performance to make
many games usable in web browsers. Meanwhile,
[Alon Zakai](https://github.com/kripken/) quickly fixed Emscripten bugs which
were encountered and added helpful Emscripten features.
