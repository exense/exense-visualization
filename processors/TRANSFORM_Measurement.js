var testmode = true;

var transform = function (response) {
    var retData = [];
    var index = {};
    var payload = response.data.payload;
    for (var i = 0; i < payload.length; i++) {
        var curSeries = payload[i].name;
        if (!(curSeries in index)) {
            retData.push({
                values: [],
                key: curSeries
            });
            index[curSeries] = retData.length - 1;
        }
        retData[index[curSeries]].values.push({
            x: payload[i].begin,
            y: payload[i].value
        });
    }
    return retData;
}

var testResponse = {
    "data": {
        "payload": [
            {
                "_id": {
                    "timestamp": 1567610595,
                    "machineIdentifier": 13078485,
                    "processIdentifier": 16224,
                    "counter": 8402743,
                    "date": 1567610595000,
                    "time": 1567610595000,
                    "timeSecond": 1567610595
                },
                "eId": "JUnit_Dynamic",
                "name": "Transaction_2",
                "begin": 1567610595151,
                "value": 3498
            },
            {
                "_id": {
                    "timestamp": 1567610595,
                    "machineIdentifier": 13078485,
                    "processIdentifier": 16224,
                    "counter": 8402751,
                    "date": 1567610595000,
                    "time": 1567610595000,
                    "timeSecond": 1567610595
                },
                "eId": "JUnit_Dynamic",
                "name": "Transaction_3",
                "begin": 1567610595151,
                "value": 4202
            },
            {
                "_id": {
                    "timestamp": 1567610595,
                    "machineIdentifier": 13078485,
                    "processIdentifier": 16224,
                    "counter": 8402742,
                    "date": 1567610595000,
                    "time": 1567610595000,
                    "timeSecond": 1567610595
                },
                "eId": "JUnit_Dynamic",
                "name": "Transaction_1",
                "begin": 1567610595151,
                "value": 2789
            }
        ]
    }
};

var actual = JSON.stringify(transform(testResponse));
var expected = '[{"values":[{"x":1567610595151,"y":3498}],"key":"Transaction_2"},{"values":[{"x":1567610595151,"y":4202}],"key":"Transaction_3"},{"values":[{"x":1567610595151,"y":2789}],"key":"Transaction_1"}]';

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