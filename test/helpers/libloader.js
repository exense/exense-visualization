var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

var $ = jQuery = require('jquery')(window);

var fs = require('fs');
var vm = require('vm');
const path = require("path");

exports.load = function (paths) {
    let code = ""
    $.each(paths, function (idx, itm) {
        code += fs.readFileSync(path.resolve(__dirname, itm)) + '\n';
    });

    vm.runInThisContext(code);
}