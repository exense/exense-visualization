var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;
global.window = window;

var $ = jQuery = require('jquery');

var fs = require('fs');
var vm = require('vm');
const path = require("path");

function getLibraryCode(fileArray){
    let code = "";
    $.each(fileArray, function (idx, itm) {
        code += fs.readFileSync(path.resolve(__dirname, itm)) + '\n';
    });
    return code;
}

exports.load = function (paths) {
    paths.push('../../node_modules/jquery/dist/jquery.js');
    paths.push('./commons.js');
    vm.runInThisContext(getLibraryCode(paths));
}