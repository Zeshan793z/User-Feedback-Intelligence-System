"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// concat.ts
var fs = require("fs");
var path = require("path");
var rootDirs = ["backend/src", "frontend/src"]; // adjust to your project
var outputFile = "project-concatenated.ts";
function getAllFiles(dir, extFilter) {
    if (extFilter === void 0) { extFilter = [".ts", ".tsx"]; }
    var results = [];
    var list = fs.readdirSync(dir);
    list.forEach(function (file) {
        var filePath = path.join(dir, file);
        var stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllFiles(filePath, extFilter));
        }
        else if (extFilter.includes(path.extname(file))) {
            results.push(filePath);
        }
    });
    return results;
}
function concatFiles() {
    var allFiles = rootDirs.flatMap(function (dir) { return getAllFiles(dir); });
    var content = allFiles
        .map(function (file) { return "// FILE: ".concat(file, "\n") + fs.readFileSync(file, "utf-8"); })
        .join("\n\n");
    fs.writeFileSync(outputFile, content);
    console.log("Concatenated ".concat(allFiles.length, " files into ").concat(outputFile));
}
concatFiles();
