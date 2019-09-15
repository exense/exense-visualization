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
var transform = function (data) {
    var x = 'x', y = 'y', z = 'z';//begin,value,name
    var retData = [];
    var index = {};
    var payload = data;
    for (var i = 0; i < payload.length; i++) {
        var curSeries = payload[i][x];
        if (!(curSeries in index)) {
            retData.push({
                values: [],
                key: curSeries,
            });
            index[curSeries] = retData.length - 1;
        }
        retData[index[curSeries]].values.push({
            y: payload[i][y],
            z: payload[i][z]
        });
    }
    return retData;
}

var testData = [{ "x": 1567610595151, "y": 3498, "z": "Transaction_2" }, { "x": 1567610596578, "y": 1298, "z": "Transaction_2" }, { "x": 1567610595151, "y": 4202, "z": "Transaction_3" }, { "x": 1567610595151, "y": 2789, "z": "Transaction_1" }];

var actual = JSON.stringify(transform(testData));
var expected = '[{"values":[{"x":1567610595151,"y":3498},{"x":1567610596578,"y":1298}],"key":"Transaction_2","color":"rgb(250,240,128)","strokeWidth":2,"classed":"dashed"},{"values":[{"x":1567610595151,"y":4202}],"key":"Transaction_3","color":"rgb(240,209,128)","strokeWidth":2,"classed":"dashed"},{"values":[{"x":1567610595151,"y":2789}],"key":"Transaction_1","color":"rgb(30,132,128)","strokeWidth":2,"classed":"dashed"}]';

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