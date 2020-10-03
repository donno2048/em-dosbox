module.exports = (usage, directories, files) => `

var Module = typeof Module !== "undefined" ? Module : {
};

if (!Module.expectedDataFileDownloads) {
    Module.expectedDataFileDownloads = 0;
}

Module.expectedDataFileDownloads++;

function DataRequest(start, end) {
    this.start = start;
    this.end = end;
}

DataRequest.prototype = {
    requests: {},

    open: function (mode, name) {
        this.name = name;
        this.requests[name] = this;
        Module.addRunDependency("fp " + this.name);
    },

    send: function () { console.log("DataRequest send: Not Implemented"); },

    onload: function () {
        var byteArray = this.byteArray.subarray(this.start, this.end);
        this.finish(byteArray);
    },

    finish: function (byteArray) {
        var that = this;

        // canOwn this data in the filesystem, it is a slide into the heap that will never change
        Module.FS_createDataFile(this.name, null, byteArray, true, true, true);
        Module.removeRunDependency("fp " + that.name);

        this.requests[this.name] = null;
    }
};

function assert(check, msg) {
    if (!check) {
        throw msg + new Error().stack;
    }
}

function handleError(error) {
    console.error("package error:", error);
}

function fetchRemotePackage(packageName, packageSize, callback, errback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", packageName, true);
    xhr.responseType = "arraybuffer";

    xhr.onprogress = function (event) {
        var url = packageName;
        var size = packageSize;
        if (event.total) size = event.total;
        if (event.loaded) {
            if (!xhr.addedTotal) {
                xhr.addedTotal = true;
                if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
                Module.dataFileDownloads[url] = {
                    loaded: event.loaded,
                    total: size
                };
            } else {
                Module.dataFileDownloads[url].loaded = event.loaded;
            }
            var total = 0;
            var loaded = 0;
            var num = 0;
            for (var download in Module.dataFileDownloads) {
                if (Module.dataFileDownloads.hasOwnProperty(download)) {
                    var data = Module.dataFileDownloads[download];
                    total += data.total;
                    loaded += data.loaded;
                    num++;
                }
            }
            total = Math.ceil(total * Module.expectedDataFileDownloads / num);
            if (Module.setStatus) Module.setStatus("Downloading data... (" + loaded + '/' + total + ")");
        } else if (!Module.dataFileDownloads) {
            if (Module.setStatus) Module.setStatus("Downloading data...");
        }
    };
    xhr.onerror = function (event) {
        throw new Error("NetworkError for: " + packageName);
    };
    xhr.onload = function (event) {
        if (xhr.status == 200 || xhr.status == 304 || xhr.status == 206 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            var packageData = xhr.response;
            callback(packageData);
        } else {
            throw new Error(xhr.statusText + " : " + xhr.responseURL);
        }
    };
    xhr.send(null);
}

function processPackageData(arrayBuffer, metadata) {
    assert(arrayBuffer, "Loading data file failed.");
    assert(arrayBuffer instanceof ArrayBuffer, "bad input to processPackageData");
    var byteArray = new Uint8Array(arrayBuffer);

    // Reuse the bytearray from the XHR as the source for file reads.
    DataRequest.prototype.byteArray = byteArray;

    var files = metadata.files;
    for (var i = 0; i < files.length; ++i) {
        DataRequest.prototype.requests[files[i].filename].onload();
    }

    Module.removeRunDependency(\`datafile_\${metadata.packageName}\`);
    //Module.run(['C:\\SRSE.EXE', '-c', 'MOUNT', 'C:', '/SRSE']);

}

function loadPackage(metadata) {
    var packagePath;

    if (typeof window === "object") {
        packagePath = window.encodeURIComponent(window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    } else if (typeof location !== undefined) {
        packagePath = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
    } else {
        throw "Using preloaded data can only be done on a web page or in a web worker";
    }

    var packageName = "${usage.output}.data";

    if (typeof Module.locateFilePackage === "function" && !Module.locateFile) {
        Module.locateFile = Module.locateFilePackage;
        handleError('warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)');
    }

    var packageSize = metadata.remote_package_size;

    var fetchedCallback = null;
    var fetched = Module.getPreloadedPackage ? Module.getPreloadedPackage(packageName, packageSize) : null;

    if (!fetched) {
        fetchRemotePackage(packageName, packageSize, function (data) {
            if (fetchedCallback) {
                fetchedCallback(data, metadata);
                fetchedCallback = null;
            } else {
                fetched = data;
            }
        }, handleError);
    }

    function runWithFS() {

        ${directories}

        var files = metadata.files;
        for (var i = 0; i < files.length; ++i) {
            new DataRequest(files[i].start, files[i].end).open("GET", files[i].filename);
        }

        metadata.packageName = packageName;

        Module.addRunDependency(\`datafile_\${packageName}\`);

        if (!Module.preloadResults) Module.preloadResults = {};

        Module.preloadResults[packageName] = { fromCache: false };

        if (fetched) {
            processPackageData(fetched, metadata);
            fetched = null;
        } else {
            fetchedCallback = processPackageData;
        }
    }

    if (Module.calledRun) {
        runWithFS();
    } else {
        if (!Module.preRun) Module.preRun = [];
        Module.preRun.push(runWithFS); // FS is not initialized yet, wait for it
    }

}

(function () {
    loadPackage({ "files": ${JSON.stringify(files)} });
})();
`