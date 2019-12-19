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

exports.load = function (paths) {
    paths.push('../../node_modules/jquery/dist/jquery.js');
    paths.push('./commons.js');

    $.each(fileArray, function (idx, itm) {
        //TODO load in isolated context instead?
        vm.runInThisContext(fs.readFileSync(path.resolve(__dirname, itm)), itm);
    });

}