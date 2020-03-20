const libloader = require('../helpers/libloader');
const assert = require('assert');

const libs = ['../../src/js/modules/transformations.js'];
libloader.load(libs);

describe('Transformations', function()
{
    describe('to4DimTableFormat', function()
    {
        it('should return a format understandable by a 4Dim table',
            function()
            {
                var testInput = {
                    data : [
                        {'m' : 'cnt', 'y' : 1, 'z' : 'OpenChrome'},
                        {'m' : 'x', '1584373648355' : 1, 'z' : 'OpenChrome'},
                        {'m' : 'cnt', 'y' : 1, 'z' : 'OpenChrome'},
                        {'m' : 'cnt', 'y' : 1, 'z' : 'OpenChrome'},
                    ]
                }
                assert.equal("1234", to4DimTableFormat());//new ServiceChain("foo").getServices());
            })
    });

});