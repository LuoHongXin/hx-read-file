#!/usr/bin/env node

var path = require('path');
const fileDisplay = require("./fileDisplay");
const argv = process.argv.slice(2);
if(argv[0] === '-v' || argv[0] === '-V') {
   return console.log('0.0.1');
}
if (isPath(argv[0])) {
    var filePath = path.resolve(argv[0]);
    let includeSuffix = null;
    if (argv[2]) {
        includeSuffix = argv[2].split(",")
    }
    fileDisplay(filePath, argv[1], includeSuffix)
} else {
    console.log("Please enter the correct path");
}
function isPath(str) {
    return /^[a-zA-Z]:\\(.*\\)*.*$/.test(str);
}