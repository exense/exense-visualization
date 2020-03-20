const libloader = require('../helpers/libloader');
const assert = require('assert');

const libs = ['../../src/js/modules/transformations.js'];
libloader.load(libs);

describe('Transformations', function () {
    describe('to4DimTableFormat', function () {
        var testInput = [
                { 'm': 'cnt', 'y': 2, 'z': 'OpenChrome', 'x': '1584373648355' },
                { 'm': 'avg', 'y': 251, 'z': 'OpenChrome', 'x': '1584373648355' },
                { 'm': 'cnt', 'y': 8, 'z': 'OpenChrome', 'x': '1584373649320' },
                { 'm': 'avg', 'y': 320, 'z': 'OpenChrome', 'x': '1584373649320' },
                { 'm': 'cnt', 'y': 10, 'z': 'Search', 'x': '1584373648355' },
                { 'm': 'avg', 'y': 2800, 'z': 'Search', 'x': '1584373648355' },
                { 'm': 'cnt', 'y': 17, 'z': 'Search', 'x': '1584373649320' },
                { 'm': 'avg', 'y': 1956, 'z': 'Search', 'x': '1584373649320' }
            ];

        it('should return an understandable xz-organized object',
            function () {
                assert.equal('{"1584373648355":{"OpenChrome":{"valueKey":2},"Search":{"valueKey":10}},"1584373649320":{"OpenChrome":{"valueKey":8},"Search":{"valueKey":17}},"zList":["1584373648355","1584373649320"],"xList":["OpenChrome","OpenChrome","Search","Search"]}',
                JSON.stringify(vizmdTransformation.toDualTable(testInput, 'x', 'z')));
            });

        it('should return an understandable zx-organized object',
            function () {
                assert.equal('{"OpenChrome":{"1584373648355":{"valueKey":2},"1584373649320":{"valueKey":8}},"Search":{"1584373648355":{"valueKey":10},"1584373649320":{"valueKey":17}},"zList":["OpenChrome","Search"],"xList":["1584373648355","1584373649320","1584373648355","1584373649320"]}',
                JSON.stringify(vizmdTransformation.toDualTable(testInput, 'z', 'x')));
            });

    });

});