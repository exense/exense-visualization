const libloader = require('./helpers/libloader');
const assert = require('assert');

const libs = ['../../src/js/core-classes.js','../../src/js/object-defaults.js'];
libloader.load(libs);

describe('Models', function()
{
    describe('GlobalSettings', function()
    {
        it('default interval property',
            function()
            {
                assert.equal(3000, new DefaultGlobalSettings().intervalduration);                
            })
    });

});