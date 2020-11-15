### Em-DOSBox dist/

__NOTE: There are a lot of bugs in this variant of DOSBox, you may wish to consider another fork__

# After git push

After git push the CI server build the latest commit automatically and updates this folder, instead of building the entire
tree you can use the prebuilt files.

# There are two folders

* Standard - Contains code using vanilla JavaScript
  * Debug - Debug version
  * Release - Release version
* ES6 - ES6 DOSBox, i.e. DOSBox as an ES6 Module i.e. `import('./dist/es6/release/dosbox.js').then((module) => { ... })`
  * Debug - Debug version
  * Release - Release version


