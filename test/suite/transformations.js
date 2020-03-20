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
                assert.equal('[["1584373648355","OpenChrome",2,251],["1584373648355","OpenChrome",2,251],["1584373648355","Search",10,2800],["1584373648355","Search",10,2800],["1584373649320","OpenChrome",8,320],["1584373649320","OpenChrome",8,320],["1584373649320","Search",17,1956],["1584373649320","Search",17,1956]]',
                    JSON.stringify(
                        vizmdTransformation.toPlainTable(
                            vizmdTransformation.toDualGrouping(testInput, 'x', 'z')
                        ).data
                    )
                )
            });

            it('should return an understandable zx-organized object',
            function () {
                assert.equal('[["OpenChrome","1584373648355",2,251],["OpenChrome","1584373648355",2,251],["OpenChrome","1584373649320",8,320],["OpenChrome","1584373649320",8,320],["Search","1584373648355",10,2800],["Search","1584373648355",10,2800],["Search","1584373649320",17,1956],["Search","1584373649320",17,1956]]',
                    JSON.stringify(
                        vizmdTransformation.toPlainTable(
                            vizmdTransformation.toDualGrouping(testInput, 'z', 'x')
                        ).data
                    )
                )
            });
    });

});