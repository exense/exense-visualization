var testmode = true;


var runDynamicEval = function (expression) {
    return eval(expression);
};


var testData = 'new Date()';

var actual = JSON.stringify(runDynamicEval(testData));
var expected = new Date().toString();

if (testmode) {
    if (actual === expected) {
        console.log('[PASSED]')
        //console.log(actual);
    }
    else {
        console.log('[FAILED]')
        console.log('actual:' + actual);
        console.log(' != ');
        console.log('expected:' + expected);
    }
}