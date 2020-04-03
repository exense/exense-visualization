function importTest(name, path) {
    describe(name, function () {
        require(path);
    });
}

describe("top", function () {

    importTest("abstract-classes", './suite/abstract-classes-tests.js');
    importTest("service-chain", './suite/service-chain-tests.js');
    importTest("transform", './suite/transformations-tests.js');
    //importTest("ajax-client", './suite/ajax-client-tests.js');

    before(function () {
        //console.log("-- starting test suite --");
     });
    beforeEach(function () {
       //console.log("-- starting test run --");
    });
    afterEach(function () {
        //console.log("-- completed test run --");
     });
     
    after(function () {
        //console.log("-- completed test run --");
    });
});