# RunTest for Emscripten DOSBox

This little application runs a simple test with Headless Chrome, captures an image and captures the output.  this most significant of which would be the console.error() information.

## Command Line Arguments

```
node ./apps.js args
```

where args:

```
-p / --path src/demo
```
The path to serve the http server affected by ```$PORT || 8000```

```
-o / --output src/results
```
Where to output results (expected directory)
```
-r / --run
```
Run the test, if run not specified the application just operates as a server in which you may use your own browser.



