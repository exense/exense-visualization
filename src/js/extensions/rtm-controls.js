registerScript();

function Filter(type, key) {
    return {
        type: type,
        key: key
    }
}

function TextFilter(key, value, isRegex) {
    var filter = new Filter('text', key);
    filter.value = value;
    filter.regex = isRegex;
    return filter;
};

function NumericalFilter(key, minValue, maxValue) {
    var filter = new Filter('numerical', key);
    filter.minValue = minValue;
    filter.maxValue = maxValue;
    return filter;
};

function DateFilter(key, minDate, maxDate) {
    var filter = new Filter('date', key);
    filter.minDate = minDate;
    filter.maxDate = maxDate;
    return filter;
};

function Selector(textFilters, numericalFilters) {
    return {
        textFilters: textFilters,
        numericalFilters: numericalFilters
    };
}

function ServiceParams(cpu, granularity, groupby, partition, sessionId, timeout, nextFactor, timeField, timeFormat, valueField) {
    return {
        "aggregateService.cpu": cpu,
        "aggregateService.granularity": granularity,
        "aggregateService.groupby": groupby,
        "aggregateService.partition": partition,
        "aggregateService.sessionId": sessionId,
        "aggregateService.timeout": timeout,
        "measurementService.nextFactor": nextFactor,
        "aggregateService.timeField": timeField,
        "aggregateService.timeFormat": timeFormat,
        "aggregateService.valueField": valueField
    };
}

function RTMPayload(selectorCollection, serviceParams) {
    return {
        selectors1: selectorCollection,
        serviceParams: serviceParams
    };
}

function DefaultTextFilter() {
    return new TextFilter('', '', false);
};

function DefaultNumericalFilter() {
    return new NumericalFilter('value', 0, 1);
};

function DefaultDateFilter() {
    return new DateFilter('begin', new Date(0), new Date(1577840400000));
};

function DefaultSelector() {
    return {
        //textFilters: [new DefaultTextFilter()],
        textFilters: [],
        numericalFilters: [new DefaultDateFilter()]
    };
}

function DefaultServiceParams() {
    return new ServiceParams(
    /* "aggregateService.cpu": */ "1",
    /* "aggregateService.granularity": */ "auto",
    /* "aggregateService.groupby": */ "name",
    /* "aggregateService.partition": */ "8",
    /* "aggregateService.sessionId": */ "defaultSid",
    /* "aggregateService.timeout": */ "600",
    /* "measurementService.nextFactor": */ "0",
    /*"aggregateService.timeField": */ "begin",
    /*"aggregateService.timeFormat": */ "long",
    /*"aggregateService.valueField": */ "value"
    );
}

function DefaultRTMPayload() {
    return new RTMPayload([new DefaultSelector()], new DefaultServiceParams());
}

function RTMMasterWidget() {
    return new Widget(
        getUniqueId(),
        new DefaultWidgetState(),
        new RTMDashletState()
    );
};

function RTMSlaveWidget() {
    return new Widget(
        getUniqueId(),
        new DefaultWidgetState(),
        new RTMDashletState()
    );
};

function RTMQuery() {
    var query = new DefaultAsyncQuery();
    query.controls = new DefaultControls();
    query.paged = new DefaultPaging();

    var transform = "function (response, args) {\r\n    var metric = args.metric;\r\n    var retData = [], series = {};\r\n\r\n    var payload = response.data.payload.stream.streamData;\r\n    var payloadKeys = Object.keys(payload);\r\n\r\n    for (i = 0; i < payloadKeys.length; i++) {\r\n        var serieskeys = Object.keys(payload[payloadKeys[i]])\r\n        for (j = 0; j < serieskeys.length; j++) {\r\n            retData.push({\r\n                x: payloadKeys[i],\r\n                y: payload[payloadKeys[i]][serieskeys[j]][metric],\r\n                z: serieskeys[j]\r\n            });\r\n        }\r\n    }\r\n    return retData;\r\n}";
    query.type = 'Async';
    query.datasource = {
        service: new Service(//service
            "/rtm/rest/aggregate/get", "Post",
            "",//templated
            new Preproc("function(requestFragment, workData){var newRequestFragment = requestFragment;for(i=0;i<workData.length;i++){newRequestFragment = newRequestFragment.replace(workData[i].key, workData[i].value);}return newRequestFragment;}"),
            new Postproc("", "", [], "function(response){if(!response.data.payload){console.log('No payload ->' + JSON.stringify(response)); return null;}return [{ placeholder : '__streamedSessionId__', value : response.data.payload.streamedSessionId, isDynamic : false }];}", "")),
        callback: new Service(//callback
            "/rtm/rest/aggregate/refresh", "Post",
            "{\"streamedSessionId\": \"__streamedSessionId__\"}",
            new Preproc("function(requestFragment, workData){var newRequestFragment = requestFragment;for(i=0;i<workData.length;i++){newRequestFragment = newRequestFragment.replace(workData[i].placeholder, workData[i].value);}return newRequestFragment;}"),
            new Postproc("function(response){return response.data.payload.stream.complete;}", transform, [{ "key": "metric", "value": "cnt", "isDynamic": false }], {}, ""))
    };

    query.controls.rtmpayload = new DefaultRTMPayload();
    return query;
}

function RTMDashletState() {
    return new DashletState(
        'RTM Dashlet', true, 0,
        new DefaultDashletData(),
        new DefaultChartOptions(),
        new DefaultConfig(),
        new RTMQuery(),
        new DefaultGuiClosed(),
        new DefaultInfo()
    );
};

function RTMDashboardState() {

    return new DashboardState(
        new DefaultGlobalSettings(),
        [new RTMMasterWidget(), new RTMSlaveWidget()],
        'RTM Dashboard',
        'aggregated',
        new DefaultDashboardGui()
    );
};

function RTMDashboard() {
    return new Dashboard(
        getUniqueId(),
        new RTMDashboardState(),
        'rtm'
    );
};

function RTMserialize(guiPayload) {
    if (!guiPayload) {
        throw new Error('guiPayload is null or undefined');
    }

    var copy = JSON.parse(angular.toJson(guiPayload));

    $.each(guiPayload.selectors1, function (selIdx, selector) {

        var newNumericals = [];
        // Convert date filters into numerical filters
        $.each(selector.numericalFilters, function (filIdx, filter) {
            if (filter.type === 'date') {
                newNumericals.push(
                    new NumericalFilter(
                        filter.key,
                        filter.minDate.getTime(),
                        filter.maxDate.getTime()
                    )
                );
            } else {
                newNumericals.push(filter);
            }
        });

        copy.selectors1[selIdx].numericalFilters = newNumericals;
    });

    $.each(copy.selectors1, function (selIdx, selector) {
        // Remove type info (unknown to backend)
        $.each(selector.textFilters, function (filIdx, filter) {
            filter.type = undefined;
        });

        $.each(selector.numericalFilters, function (filIdx, filter) {
            filter.type = undefined;
        });

    });

    console.log(angular.toJson(copy))
    return angular.toJson(copy);
}


angular.module('rtm-controls', [])

    .directive('rtmControls', function () {

        var controllerScript = 'rtm-controls.js';
        var horizontal = resolveTemplateURL(controllerScript, 'rtm-controls-horizontal.html');
        var vertical = resolveTemplateURL(controllerScript, 'rtm-controls-vertical.html');

        return {
            restrict: 'E',
            scope: {
                payload: '=',
                orientation: '=?'
            },

            template: '<div ng-include="resolveDynamicTemplate()"></div>',
            controller: function ($scope) {
                
                /* Dynamic template impl*/
                $scope.resolveDynamicTemplate = function () {
                    if ($scope.orientation === 'horizontal') {
                        return horizontal;
                    }
                    else {
                        return vertical;
                    }
                };

                $scope.addSelector = function () {
                    $scope.payload.selectors1.push(new DefaultSelector());
                };

                $scope.clearAll = function () {
                    $scope.payload.selectors1.length = 0;
                };

                $scope.removeSelector = function (idx) {
                    $scope.payload.selectors1.splice(idx, 1);
                };

            }
        };
    })
    .directive('rtmSelector', function () {
        return {
            restrict: 'E',
            scope: {
                textfilters: '=',
                numericalfilters: '=',
            },

            templateUrl: resolveTemplateURL('rtm-controls.js', 'rtm-selector.html'),
            controller: function ($scope) {
                //console.log(angular.toJson($scope.textfilters));
                //console.log(angular.toJson($scope.numericalfilters));

                $scope.addTextFilter = function () {
                    $scope.textfilters.push(new DefaultTextFilter());
                };

                $scope.addNumericalFilter = function () {
                    $scope.numericalfilters.push(new DefaultNumericalFilter());
                };

                $scope.addDateFilter = function () {
                    $scope.numericalfilters.push(new DefaultDateFilter());
                };


                $scope.removeTextfilter = function (idx) {
                    $scope.textfilters.splice(idx, 1);
                };

                $scope.removeNumericalfilter = function (idx) {
                    $scope.numericalfilters.splice(idx, 1);
                };
            }
        };
    })
    .directive('rtmServiceParams', function () {
        return {
            restrict: 'E',
            scope: {
                params: '='
            },

            templateUrl: resolveTemplateURL('rtm-controls.js', 'rtm-service-params.html'),
            controller: function ($scope) {

                $scope.tabIndex = 0;

                $scope.selectTab = function (tabIndex) {
                    $scope.tabIndex = tabIndex;
                };

                $scope.isTabActive = function (tabIndex) {
                    return tabIndex === $scope.tabIndex;
                };

            }
        };
    })
    .directive('rtmTextFilter', function () {
        return {
            restrict: 'E',
            scope: {
                key: '=',
                value: '=',
                regex: '='
            },

            templateUrl: resolveTemplateURL('rtm-controls.js', 'rtm-text-filter.html'),
            controller: function ($scope) {
                $scope.setKey = function (key) {
                    $scope.key = key;
                };
            }
        };
    })
    .directive('rtmNumericalFilter', function () {
        return {
            restrict: 'E',
            scope: {
                key: '=',
                minvalue: '=',
                maxvalue: '='
            },

            templateUrl: resolveTemplateURL('rtm-controls.js', 'rtm-numerical-filter.html'),
            controller: function ($scope) {

                $scope.setKey = function (key) {
                    $scope.key = key;
                };
            }
        };
    })
    .directive('rtmDateFilter', function () {
        return {
            restrict: 'E',
            scope: {
                key: '=',
                mindate: '=',
                maxdate: '='
            },

            templateUrl: resolveTemplateURL('rtm-controls.js', 'rtm-date-filter.html'),
            controller: function ($scope) {

                $scope.setKey = function (key) {
                    $scope.key = key;
                };
            }
        };
    })
