var testmode = true;

var transform = function (response) {
    //var metrics = response.data.payload.metricList;
    var metrics = ["avg", "cnt"];
    var retData = [], series = {};

    var payload = response.data.payload.stream.streamData;
    var payloadKeys = Object.keys(payload);

    if (payload && payloadKeys.length > 0) {
        var serieskeys = Object.keys(payload[payloadKeys[0]])
        for (j = 0; j < serieskeys.length; j++) {
            for (i = 0; i < metrics.length; i++) {
                var metric = metrics[i];
                if (payload[payloadKeys[0]][serieskeys[j]][metric]) {
                    retData.push({
                        x: serieskeys[j],
                        y: payload[payloadKeys[0]][serieskeys[j]][metric],
                        z: metric
                    });
                }
            }
        }
    }
    return retData;
};

var testResponse = { data: { "payload": { "stream": { "streamData": { "1570021521853": { "Transaction_1": { "avg": 5, "cnt": 6 }, "Transaction_2": { "avg": 2, "cnt": 2 } } }, "id": { "streamedSessionId": "fdf3fb95-3238-4b6e-9266-e540b49f5f6b" }, "complete": true, "clone": false, "compositeStream": false, "durationMs": 0 }, "metricList": ["avg", "cnt"] } } };

var actual = JSON.stringify(transform(testResponse));
var expected = '[{"x":"Transaction_1","y":5,"z":"avg"},{"x":"Transaction_1","y":6,"z":"cnt"},{"x":"Transaction_2","y":2,"z":"avg"},{"x":"Transaction_2","y":2,"z":"cnt"}]';

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