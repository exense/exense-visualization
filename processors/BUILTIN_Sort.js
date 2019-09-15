var testmode = true;

function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

var testData = [{"x":1,"y":1},{"x":0,"y":0},{"x":2,"y":2},{"x":1567610595151,"y":3498},{"x":1567610596578,"y":1298}];

var actual = JSON.stringify(testData.sort(dynamicSort("x")));
var expected = '[{"x":0,"y":0},{"x":1,"y":1},{"x":2,"y":2},{"x":1567610595151,"y":3498},{"x":1567610596578,"y":1298}]';

if (testmode) {
    if (actual === expected) {
        console.log('[PASSED]')
        //console.log(result);
    }
    else {
        console.log('[FAILED]')
        console.log('actual:' + actual);
        console.log(' != ');
        console.log('expected:' + expected);
    }
}