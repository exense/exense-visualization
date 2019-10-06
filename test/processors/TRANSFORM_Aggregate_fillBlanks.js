var testmode = true;

var transform = function (response, args) {
    var metric = args.metric;
    var retData = [], series = [];

    var payload = response.data.payload.stream.streamData;
    var payloadKeys = Object.keys(payload);

    for (i = 0; i < payloadKeys.length; i++) {
        var serieskeys = Object.keys(payload[payloadKeys[i]])
        for (j = 0; j < serieskeys.length; j++) {
            if(!series.includes(serieskeys[j])){
                series.push(serieskeys[j]);
            }
        }
    }

    for (i = 0; i < payloadKeys.length; i++) {
        var serieskeys = Object.keys(payload[payloadKeys[i]])
        for (j = 0; j < series.length; j++) {
            var yval;
            if(payload[payloadKeys[i]][serieskeys[j]] && payload[payloadKeys[i]][serieskeys[j]][metric]){
              yval = payload[payloadKeys[i]][serieskeys[j]][metric];
            }else{
              //console.log('missing dot: x=' + payloadKeys[i] + '; series=' + series[j]);
              yval = 0;
            }
            retData.push({
                x: payloadKeys[i],
                y: yval,
                z: series[j]
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

var actual = JSON.stringify(transform(testResponse, {metric: 'cnt'}));
var expected = '[{"x":"1567669833837","y":0,"z":"Echo"},{"x":"1567669833837","y":0,"z":"EBC_Get"},{"x":"1567669833928","y":0,"z":"Echo"},{"x":"1567669833928","y":0,"z":"EBC_Get"}]';

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