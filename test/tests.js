var assert = require('assert');
var fs = require('fs');
var vm = require('vm');
const path = require("path");
const file1 = fs.readFileSync(path.resolve(__dirname, '../src/js/core-classes.js'));
const file2 = fs.readFileSync(path.resolve(__dirname, '../src/js/object-defaults.js'));

vm.runInThisContext(file1 + '\n' + file2);

describe('SpaceTime', function()
{
    describe('brabra', function()
    {
        it('something',
            function()
            {
                assert.equal(3000, new DefaultGlobalSettings().intervalduration);
            })
    });

});