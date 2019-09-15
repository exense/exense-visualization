var testmode = true;

var transform = function (response) {
    var x = 'begin', y = 'value', z = 'name';
    var retData = [], index = {};
    var payload = response.data.payload;
    for (var i = 0; i < payload.length; i++) {
        retData.push({
            x: payload[i][x],
            y: payload[i][y],
            z: payload[i][z]
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
var expected = '[{"x":1567610595151,"y":3498,"z":"Transaction_2"},{"x":1567610595151,"y":4202,"z":"Transaction_3"},{"x":1567610595151,"y":2789,"z":"Transaction_1"}]';

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