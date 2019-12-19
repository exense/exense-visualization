const libloader = require('../helpers/libloader');
const assert = require('assert');

const libs = ['../../src/js/modules/ajax-client.js'];
libloader.load(libs);

describe('Core', function () {
    describe('ServiceChain', function () {
        it('should perform ajax call', function () {
            let result = null;

            (async () => {

                let promise = new Promise((resolve, reject) => {
                    try {
                        new AjaxClient("a", "b", "c", resolve, reject).execute();
                    } catch (e) {
                        reject(e);
                    }
                });

                
                try {
                    console.log('result:');
                    await promise;
                    console.log(JSON.stringify(result));
                } catch (e) {
                    console.log('Error during test:' + e);
                }
            })();

            assert.notEqual(null, result);
            assert.notEqual(undefined, result);
        })
    });

});