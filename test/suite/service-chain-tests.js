const libloader = require('../helpers/libloader');
const assert = require('assert');

const libs = ['../../src/js/modules/service-chain.js'];
libloader.load(libs);

describe('Core', function()
{
    describe('ServiceChain', function()
    {
        it('should chain two successful service executions',
            function()
            {
                assert.equal("foo", new ServiceChain("foo").getValue());
            })
    });

});