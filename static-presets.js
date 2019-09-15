function StaticPresets() {
    return {
        queries: [
            {
                "name": "RTM Measurements - File",
                "query": {
                    "inputtype": "Raw",
                    "type": "Simple",
                    "datasource": {
                        "service": {
                            "url": "/mocks/001_RESPONSE_Simple_RTM_Measurements.json",
                            "method": "Get",
                            "postproc": {
                                "transform": {
                                    "function": "function(response){var retData = [];var index = {};var payload = response.data.payload;for (var i = 0; i < payload.length; i++) {var curSeries = payload[i].name;if (!(curSeries in index)) {retData.push({values: [],key: curSeries});index[curSeries] = retData.length - 1;}retData[index[curSeries]].values.push({ x: payload[i].begin, y: payload[i].value });}return retData;}",
                                    "abs": { "title": "time", "unit": "seconds" },
                                    "ord": { "title": "duration", "unit": "ms" },
                                    "transformations": [{ "path": "timestamp", "function": "function () {Math.random().toString(36).substr(2, 9);}" }]
                                }
                            }
                        }
                    }
                }
            },
            {
                "name": "RTM Measurements - Call",
                "query": {
                    "inputtype": "Raw",
                    "type": "Simple",
                    "datasource": {
                        "service": {
                            "url": "/rtm/rest/measurement/find",
                            "method": "Post",
                            "data": {
                                "selectors1": [{ "textFilters": [{ "key": "eId", "value": "JUnit_Dynamic", "regex": "false" }, { "key": "name", "value": "Transaction_1", "regex": "false" }], "numericalFilters": [] }],
                                "serviceParams": { "measurementService.nextFactor": "0", "aggregateService.sessionId": "defaultSid", "aggregateService.granularity": "auto", "aggregateService.groupby": "name", "aggregateService.cpu": "1", "aggregateService.partition": "8", "aggregateService.timeout": "600" }
                            },
                            "postproc": {
                                "transform": {
                                    "function": "function(response){var retData = [];var index = {};var payload = response.data.payload;for (var i = 0; i < payload.length; i++) {var curSeries = payload[i].name;if (!(curSeries in index)) {retData.push({values: [],key: curSeries});index[curSeries] = retData.length - 1;}retData[index[curSeries]].values.push({ x: payload[i].begin, y: payload[i].value });}return retData;}",
                                    "abs": { "title": "time", "unit": "seconds" }, "ord": { "title": "duration", "unit": "ms" },
                                    "transformations": [{ "path": "timestamp", "function": "function () {Math.random().toString(36).substr(2, 9);}" }]
                                }
                            }
                        }
                    }
                }
            },
            {
                "name": "RTM Aggregates - File",
                "query": {
                    "inputtype": "Raw",
                    "type": "Async",
                    "datasource": {
                        "service": {
                            "url": "/mocks/002_RESPONSE_Async_Get_RTM_Aggregates.json",
                            "method": "Get",
                            "data": { "selectors1": [{ "textFilters": [{ "key": "eId", "value": "JUnit_Dynamic", "regex": "false" }, { "key": "name", "value": "Transaction_1", "regex": "false" }], "numericalFilters": [] }], "serviceParams": { "measurementService.nextFactor": "0", "aggregateService.sessionId": "defaultSid", "aggregateService.granularity": "auto", "aggregateService.groupby": "name", "aggregateService.cpu": "1", "aggregateService.partition": "8", "aggregateService.timeout": "600" } },
                            "postproc": {
                                "save": {
                                    "function": "function(response){return [{ placeholder : '__streamedSessionId__', value : response.data.payload.streamedSessionId, isDynamic : false }];}",
                                }
                            }
                        },
                        "callback": {
                            "url": "/mocks/002_RESPONSE_Async_Refresh_RTM_Aggregates.json",
                            "method": "Get",
                            "data": {
                                "streamedSessionId": "__streamedSessionId__"
                            },
                            "preproc": {
                                "replace": {
                                    "target": "data",
                                    "function": "function(requestFragment, workData){var newRequestFragment = requestFragment;for(i=0;i<workData.length;i++){newRequestFragment = newRequestFragment.replace(workData[i].placeholder, workData[i].value);}return newRequestFragment;}",
                                }
                            },
                            "postproc": {
                                "asyncEnd": {
                                    "function": "function(response){return response.data.payload.stream.complete;}",
                                },
                                "transform": {
                                    "function": "function (response) {\
                                                        var metric = \"avg\";\
                                                        var retData = [];\
                                                        var series = {};\
                                                        var payload = response.data.payload.stream.streamData;\
                                                        var begin = \"\";\
                                                        var payloadKeys = Object.keys(payload);\
                                                        if (payloadKeys[0].length > 0) {\
                                                            var keys = Object.keys(payload[payloadKeys[0]]);\
                                                            for (i = 0; i < keys.length; i++) {\
                                                                series[keys[i]] = [];\
                                                            }\
                                                        }\
                                                        for (i = 0; i < payloadKeys.length; i++) {\
                                                            begin = payload[payloadKeys[i]];\
                                                            var serieskeys = Object.keys(payload[payloadKeys[i]]);\
                                                            for (j = 0; j < serieskeys.length; j++) {\
                                                                series[serieskeys[j]].push({ x: payloadKeys[i], y: payload[payloadKeys[i]][serieskeys[j]][metric] });\
                                                            }\
                                                        }\
                                                        for (i = 0; i < Object.keys(series).length; i++) {\
                                                            retData.push({ values: series[Object.keys(series)[i]], key: Object.keys(series)[i]);\
                                                        }\
                                                        return retData;\
                                                    }"
                                }
                            }
                        }
                    }
                }
            },
            {
                "name": "RTM Aggregates - Call",
                "query": {
                    "inputtype": "Raw",
                    "type": "Async",
                    "datasource": {
                        "service": {
                            "url": "/rtm/rest/aggregate/get",
                            "method": "Post",
                            "data": {
                                "selectors1": [{ "textFilters": [{ "key": "eId", "value": ".*", "regex": "true" }], "numericalFilters": [] }],
                                "serviceParams": { "measurementService.nextFactor": "0", "aggregateService.sessionId": "defaultSid", "aggregateService.granularity": "auto", "aggregateService.groupby": "name", "aggregateService.cpu": "1", "aggregateService.partition": "8", "aggregateService.timeout": "600" }
                            },
                            "postproc": {
                                "save": {
                                    "function": "function(response){return [{ placeholder : '__streamedSessionId__', value : response.data.payload.streamedSessionId, isDynamic : false }];}",
                                }
                            }
                        },
                        "callback": {
                            "url": "/rtm/rest/aggregate/refresh",
                            "method": "Post",
                            "data": {
                                "streamedSessionId": "__streamedSessionId__"
                            },
                            "preproc": {
                                "replace": {
                                    "target": "data",
                                    "function": "function(requestFragment, workData){var newRequestFragment = requestFragment;for(i=0;i<workData.length;i++){newRequestFragment = newRequestFragment.replace(workData[i].placeholder, workData[i].value);}return newRequestFragment;}",
                                }
                            },
                            "postproc": {
                                "asyncEnd": {
                                    "function": "function(response){return response.data.payload.stream.complete;}",
                                },
                                "transform": {
                                    "function": "function (response) {\
                                                        var metric = \"avg\";\
                                                        var retData = [];\
                                                        var series = {};\
                                                        var payload = response.data.payload.stream.streamData;\
                                                        var begin = \"\";\
                                                        var payloadKeys = Object.keys(payload);\
                                                        for (i = 0; i < payloadKeys.length; i++) {\
                                                            begin = payload[payloadKeys[i]];\
                                                            var serieskeys = Object.keys(payload[payloadKeys[i]]);\
                                                            for (j = 0; j < serieskeys.length; j++) {\
                                                            	if(!series[serieskeys[j]]){\
                                                            	series[serieskeys[j]] = [];\
                                                            	}\
                                                            	series[serieskeys[j]].push({ x: payloadKeys[i], y: payload[payloadKeys[i]][serieskeys[j]][metric] });\
                                                            }\
                                                        }\
                                                        for (i = 0; i < Object.keys(series).length; i++) {\
                                                            retData.push({ values: series[Object.keys(series)[i]], key: Object.keys(series)[i]);\
                                                        }\
                                                        return retData;\
                                                    }",
                                }
                            }
                        }
                    }
                }
            }
        ],
        controls: {
            templates: [
                {
                    "name": 'RTM Measurements Template',
                    "placeholders": [{ "placeholder": "__eId__", "value": "?", "isDynamic" : false }, { "placeholder": "__name__", "value": "?", "isDynamic" : false }, { "placeholder": "__minValue__", "value": "0", "isDynamic" : false }, { "placeholder": "__maxValue__", "value": "999999999", "isDynamic" : false }],
                    "queryTemplate": {
                        "type": "Simple",
                        "datasource": {
                            "service": {
                                "url": "/rtm/rest/measurement/find",
                                "method": "Post",
                                "data": { "selectors1": [{ "textFilters": [{ "key": "eId", "value": "__eId__", "regex": "false" }, { "key": "name", "value": "__name__", "regex": "false" }], "numericalFilters": [{"key":"begin","minValue":"__minValue__","maxValue":"__maxValue__"}] }], "serviceParams": { "measurementService.nextFactor": "0", "aggregateService.sessionId": "defaultSid", "aggregateService.granularity": "auto", "aggregateService.groupby": "name", "aggregateService.cpu": "1", "aggregateService.partition": "8", "aggregateService.timeout": "600" } },
                                "preproc": {
                                    "replace": {
                                        "target": "data",
                                        "function": "function(requestFragment, workData){var newRequestFragment = requestFragment;for(i=0;i<workData.length;i++){newRequestFragment = newRequestFragment.replace(workData[i].placeholder, workData[i].value);}return newRequestFragment;}",
                                    }
                                },
                                "postproc": {
                                    "transform": {
                                        "function": "function(response){var retData = [];var index = {};var payload = response.data.payload;for (var i = 0; i < payload.length; i++) {var curSeries = payload[i].name;if (!(curSeries in index)) {retData.push({values: [],key: curSeries});index[curSeries] = retData.length - 1;}retData[index[curSeries]].values.push({ x: payload[i].begin, y: payload[i].value });}return retData;}",
                                    }
                                }
                            }
                        }
                    }
                }
            ]
        },
        configs: [
            {
                name: 'defaultConfig',
                display: {
                    type: 'lineChart',
                    autorefresh: 'Off'
                }
            }
        ]
    };
}