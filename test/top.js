function importTest(name, path) {
    describe(name, function () {
        require(path);
    });
}

describe("top", function () {
    beforeEach(function () {
       console.log("starting test run.");
    });
    importTest("service-chain", './suite/service-chain-tests.js');
    importTest("ajax-client", './suite/ajax-client-tests.js');
    after(function () {
        console.log("completed test run.");
    });
});