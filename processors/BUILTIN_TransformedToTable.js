var testmode = true;

var transform = function (data) {
    var x = 'x', y = 'y', z = 'z';//begin,value,name
    var retData = [], index = {}, zlist = [];
    var payload = data;
    for (var i = 0; i < payload.length; i++) {
        var curSeries = payload[i][x];
        if (!(curSeries in index)) {
            retData.push({
                values: {},
                x: curSeries,
            });
            index[curSeries] = retData.length - 1;
        };
        retData[index[curSeries]].values[payload[i][z]] = payload[i][y];
        if(!zlist.includes(payload[i][z]))
        zlist.push(payload[i][z]);
    }
    return { zlist : zlist.sort(), data : retData};
}

var testData = [{ "x": 1567610595151, "y": 3498, "z": "Transaction_2" }, { "x": 1567610596578, "y": 1298, "z": "Transaction_2" }, { "x": 1567610595151, "y": 4202, "z": "Transaction_3" }, { "x": 1567610595151, "y": 2789, "z": "Transaction_1" }];

var actual = JSON.stringify(transform(testData));
var expected = '{"zlist":["Transaction_1","Transaction_2","Transaction_3"],"data":[{"values":{"Transaction_2":3498,"Transaction_3":4202,"Transaction_1":2789},"x":1567610595151},{"values":{"Transaction_2":1298},"x":1567610596578}]}';

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