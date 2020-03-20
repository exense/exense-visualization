const libloader = require('../helpers/libloader');
const assert = require('assert');

const libs = ['../../src/js/modules/transformations.js', '../../src/js/modules/id-index-array.js'];

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
                assert.equal('{"data":{"array":[{"array":[{"values":{"m":"cnt","y":2},"oid":"OpenChrome"},{"values":{"m":"cnt","y":10},"oid":"Search"}],"oid":"1584373648355"},{"array":[{"values":{"m":"cnt","y":8},"oid":"OpenChrome"},{"values":{"m":"cnt","y":17},"oid":"Search"}],"oid":"1584373649320"}]},"zList":["1584373648355","1584373649320"],"xList":["OpenChrome","OpenChrome","Search","Search"],"mList":["cnt","avg"]}',
                    JSON.stringify(vizmdTransformation.toDualTable(testInput, 'x', 'z')));
            });

        it('should return an understandable zx-organized object',
            function () {
                assert.equal('{"data":{"array":[{"array":[{"values":{"m":"cnt","y":2},"oid":"1584373648355"},{"values":{"m":"cnt","y":8},"oid":"1584373649320"}],"oid":"OpenChrome"},{"array":[{"values":{"m":"cnt","y":10},"oid":"1584373648355"},{"values":{"m":"cnt","y":17},"oid":"1584373649320"}],"oid":"Search"}]},"zList":["OpenChrome","Search"],"xList":["1584373648355","1584373649320","1584373648355","1584373649320"],"mList":["cnt","avg"]}',
                    JSON.stringify(vizmdTransformation.toDualTable(testInput, 'z', 'x')));
            });

    });

});