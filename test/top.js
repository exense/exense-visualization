function importTest(name, path) {
    describe(name, function () {
        require(path);
    });
}

describe("top", function () {
    beforeEach(function () {
       console.log("running something before each test");
    });
    importTest("service-chain", './suite/service-chain-tests.js');
    //importTest("b", './b/b');
    after(function () {
        console.log("after all tests");
    });
});