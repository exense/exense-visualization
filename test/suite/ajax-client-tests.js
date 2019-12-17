const libloader = require('../helpers/libloader');
const assert = require('assert');

const libs = ['../../src/js/modules/ajax-client.js'];
libloader.load(libs);

describe('Core', function()
{
    describe('ServiceChain', function()
    {
        it('should perform ajax call',
            function()
            {
                assert.equal("a", new AjaxClient("a","b","c","d").url);
            })
    });

});