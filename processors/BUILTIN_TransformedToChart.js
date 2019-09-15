var testmode = true;

var stringToColour = function (i) {
    var num = (i + 1) * 500000;
    if ((i % 2) == 0) {
        num = num * 100;
    }
    num >>>= 0;
    var b = num & 0xFF,
        g = (num & 0xFF00) >>> 8 % 255,
        r = (num & 0xFF0000) >>> 16 % 255;
    return "rgb(" + [r, g, b].join(",") + ")";
}

var transform = function (data) {
    var x = 'x', y = 'y', z = 'z';//begin,value,name
    var retData = [];
    var index = {};
    var payload = data;
    for (var i = 0; i < payload.length; i++) {
        var curSeries = payload[i][z];
        if (!(curSeries in index)) {
            retData.push({
                values: [],
                key: curSeries,
                color: stringToColour(i),
                strokeWidth: 2,
                classed: 'dashed'
            });
            index[curSeries] = retData.length - 1;
        }
        retData[index[curSeries]].values.push({
            x: payload[i][x],
            y: payload[i][y]
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
        //console.log(actual);
    }
    else {
        console.log('[FAILED]')
        console.log('actual:' + actual);
        console.log(' != ');
        console.log('expected:' + expected);
    }
}