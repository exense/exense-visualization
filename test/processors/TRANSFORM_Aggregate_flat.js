var testmode = true;

var transform = function (response) {
    var metric = 'avg';
    var retData = [], series = {};

    var payload = response.data.payload.stream.streamData;
    var payloadKeys = Object.keys(payload);

    for (i = 0; i < payloadKeys.length; i++) {
        var serieskeys = Object.keys(payload[payloadKeys[i]])
        for (j = 0; j < serieskeys.length; j++) {
            retData.push({
                x: payloadKeys[i],
                y: payload[payloadKeys[i]][serieskeys[j]][metric],
                z: serieskeys[j]
            });
        }
    }
    return retData;
}

var testResponse = {
    "data": {
        "status": "SUCCESS",
        "metaMessage": "Found stream with id=025bc36b-7586-4b48-8d4c-3cca5daef37c. Delivering payload at time=1567669857191",
        "payload": {
            "stream": {
                "streamData": {
                    "1567669833837": {
                        "Echo": {
                            "avg": 5
                        },
                        "EBC_Get": {
                            "avg": 6
                        }
                    },
                    "1567669833928": {
                        "Echo": {
                            "avg": 2
                        },
                        "EBC_Get": {
                            "avg": 3
                        }
                    }
                }
            }
        }
    }
};

var actual = JSON.stringify(transform(testResponse));
var expected = '[{"x":"1567669833837","y":5,"z":"Echo"},{"x":"1567669833837","y":6,"z":"EBC_Get"},{"x":"1567669833928","y":2,"z":"Echo"},{"x":"1567669833928","y":3,"z":"EBC_Get"}]';

if (testmode) {
    if (actual === expected) {
        console.log('[PASSED]')
        //console.log(actual);
        console.log(JSON.stringify(transform.toString()))
    }
    else {
        console.log('[FAILED]')
        console.log('actual:' + actual);
        console.log(' != ');
        console.log('expected:' + expected);
    }
}