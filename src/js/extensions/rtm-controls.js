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
    return new TextFilter('eId', '', 'Off');
};

function DefaultNumericalFilter() {
    return new NumericalFilter('value', 0, 1);
};

function DefaultDateFilter() {
    return new DateFilter('begin', new Date(new Date().getTime() - 3600000), new Date());
};

function DefaultSelector() {
    return {
        textFilters: [],
        numericalFilters: []
    };
}

function EidSelector(eId) {
    return {
        textFilters: [new TextFilter('eId', eId, false)],
        numericalFilters: []
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
    /* "measurementService.nextFactor": */ "__FACTOR__",
    /*"aggregateService.timeField": */ "begin",
    /*"aggregateService.timeFormat": */ "long",
    /*"aggregateService.valueField": */ "value"
    );
}

function DefaultRTMPayload() {
    return new RTMPayload([new DefaultSelector()], new DefaultServiceParams());
}

function StepRTMPayload() {
    return new RTMPayload([new EidSelector()], new DefaultServiceParams());
}

function RTMAggregatesMasterQuery() {
    var query = new DefaultAsyncQuery();
    query.controls = new DefaultControls();
    query.paged = new DefaultPaging();
    query.controltype = 'RTM';
    query.controls.querytype = 'aggregates';

    var tFunc = function (response, args) {

        console.log('master!')

        var metric = args.metric;
        var metricSplit = args.metric.split(';');
        var retData = [], series = {};
        var payload = response.data.payload.stream.streamData;
        var payloadKeys = Object.keys(payload);
        for (i = 0; i < payloadKeys.length; i++) {
            var serieskeys = Object.keys(payload[payloadKeys[i]])
            for (j = 0; j < serieskeys.length; j++) {
                $.each(metricSplit, function (idx, m) {
                    if (m && payload[payloadKeys[i]][serieskeys[j]][m]) {
                        retData.push({ x: payloadKeys[i], y: payload[payloadKeys[i]][serieskeys[j]][m], z: serieskeys[j] });
                    }
                });
            }
        }
        return retData;
    };
    var transform = tFunc.toString();

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

    query.controls.rtmmodel = new DefaultRTMPayload();
    return query;
}

function RTMAggregatesSlaveQuery() {
    var query = new DefaultAsyncQuery();
    query.controls = new DefaultControls();
    query.paged = new DefaultPaging();
    query.controltype = 'RTM';
    query.controls.querytype = 'aggregates';

    var tFunc = function (response, args) {

        console.log('slave!')
        var metric = args.metric;
        var metricSplit = args.metric.split(';');
        var retData = [], series = {};
        var payload = response.data.payload.stream.streamData;

        var payloadKeys = Object.keys(payload);
        $.each(payloadKeys, function (idx1, time) {

            var serieskeys = Object.keys(payload[time]);
            $.each(serieskeys, function (idx2, group) {

                $.each(metricSplit, function (idx3, m) {
                    if (m && payload[time][group][m]) {
                        retData.push({ 'x': time, 'y': payload[time][group][m], 'z': group, 'm': m });
                    }
                });
            });
        });

        return retData;
    };
    var transform = tFunc.toString();


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

    query.controls.rtmmodel = new DefaultRTMPayload();
    return query;
}

function RTMRawValuesBaseQuery(timeField, valueField, groupby) {
    return new SimpleQuery(
        "Raw", new Service(
            "/rtm/rest/measurement/find", "Post",
            "",
            new Preproc("function(requestFragment, workData){var newRequestFragment = requestFragment;for(i=0;i<workData.length;i++){newRequestFragment = newRequestFragment.replace(workData[i].key, workData[i].value);}return newRequestFragment;}"),
            new Postproc("", "function (response, args) {\r\n    var x = '" + timeField + "', y = '" + valueField + "', z = '" + groupby + "';\r\n    var retData = [], index = {};\r\n    var payload = response.data.payload;\r\n    for (var i = 0; i < payload.length; i++) {\r\n        retData.push({\r\n            x: payload[i][x],\r\n            y: payload[i][y],\r\n            z: payload[i][z]\r\n        });\r\n    }\r\n    return retData;\r\n}",
                [], {}, "")
        )
    );
};

function RTMRawValuesMasterQuery() {
    var query = new TemplatedQuery(
        "Plain",
        new RTMRawValuesBaseQuery("begin", "value", "name"),
        new Paging("On", new Offset("__FACTOR__", "return 0;", "return value + 1;", "if(value > 0){return value - 1;} else{return 0;}"), null),
        new Controls(
            new DefaultTemplate(),
            "",
            [new Placeholder("__FACTOR__", "100", false)]
        )
    );

    query.controltype = 'RTM';
    query.controls.querytype = 'rawvalues';
    query.controls.rtmmodel = new DefaultRTMPayload();
    return query;
}

function RTMRawValuesSlaveQuery() {
    var query = new TemplatedQuery(
        "Plain",
        new RTMRawValuesBaseQuery("begin", "value", "name"),
        new DefaultPaging(),
        new Controls(
            new DefaultTemplate(),
            "",
            [new Placeholder("__FACTOR__", "100", false)]
        )
    );

    query.controltype = 'RTM';
    query.controls.querytype = 'rawvalues';
    query.controls.rtmmodel = new DefaultRTMPayload();
    return query;
}

function RTMMasterState() {
    return new DashletState(
        'Chart', true, 0,
        new DashletData({}, [], null),
        new DefaultChartOptions(),
        new Config('Fire', 'Off', true, false, 'unnecessaryAsMaster'),
        //(toggleaction, autorefresh, master, slave, target, autorefreshduration, asyncrefreshduration, incremental, incmaxdots, transposetable)
        new RTMAggregatesMasterQuery(),
        new DefaultGuiClosed(),
        new DefaultInfo()
    );
};

function RTMSlaveState(RTMmasterId) {
    var slaveConfig = new Config('Fire', 'Off', false, true, 'state.data.rawresponse', null, null, null, null, 'On');
    slaveConfig.currentmaster = {
        oid: RTMmasterId,
        title: 'Chart'
    };

    return new DashletState(
        'Table', true, 0,
        new DefaultDashletData(),
        new ChartOptions('dualTable', false, false,
            'function (d) {\r\n    var value;\r\n    if ((typeof d) === \"string\") {\r\n        value = parseInt(d);\r\n    } else {\r\n        value = d;\r\n    }\r\n\r\n    return d3.time.format(\"%H:%M:%S\")(new Date(value));\r\n}',
            'function (d) { return d.toFixed(1); }',
            null,
            null
        ),
        slaveConfig,
        new RTMAggregatesSlaveQuery(),
        new DefaultGuiClosed(),
        new DefaultInfo()
    );
};

function RTMMasterWidget(RTMmasterId) {
    return new Widget(
        RTMmasterId,
        new DefaultWidgetState(),
        new RTMMasterState()
    );
};

function RTMSlaveWidget(RTMmasterId) {
    return new Widget(
        "RTM-Slave-" + getUniqueId(),
        new DefaultWidgetState(),
        new RTMSlaveState(RTMmasterId)
    );
};

function RTMDashboardState() {
    var RTMmasterId = "RTM-Master-" + getUniqueId();
    
    return new DashboardState(
        new DefaultGlobalSettings(),
        [new RTMMasterWidget(RTMmasterId), new RTMSlaveWidget(RTMmasterId)],
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

    $.each(copy.selectors1, function (selIdx, selector) {

        var newNumericals = [];
        // Convert date filters into numerical filters
        $.each(selector.numericalFilters, function (filIdx, filter) {
            if (filter.type === 'date') {
                newNumericals.push(
                    new NumericalFilter(
                        filter.key,
                        Date.parse(filter.minDate),
                        Date.parse(filter.maxDate)
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

            if (filter.regex === 'On') {
                filter.regex = true;
            } else {
                filter.regex = false;
            }
        });

        $.each(selector.numericalFilters, function (filIdx, filter) {
            filter.type = undefined;
        });

    });

    return angular.toJson(copy);
}


angular.module('rtm-controls', ['angularjs-dropdown-multiselect'])

    .directive('rtmControls', function () {

        var controllerScript = 'rtm-controls.js';
        var horizontal = resolveTemplateURL(controllerScript, 'rtm-controls-horizontal.html');
        var vertical = resolveTemplateURL(controllerScript, 'rtm-controls-vertical.html');

        return {
            restrict: 'E',
            scope: {
                payload: '=',
                query: '=',
                orientation: '=?',
                slavestate: '=',
                masterstate: '='
            },

            template: '<div ng-include="resolveDynamicTemplate()"></div>',
            controller: function ($scope) {

                $scope.unwatchers = [];

                $scope.forceReloadQuery = function () {
                    // force reload entire query for data update
                    forceRedraw($scope);
                    // need to force an angular cycle for the model change to be taken in account
                    setTimeout(function () { $scope.$emit('broadcastQueryFire'); }, 100);

                };

                $scope.forceReloadTransform = function () {
                    // force transform reload for metric/visualization update
                    if ($scope.masterstate) {
                        $scope.masterstate.data.rawresponse = JSON.parse(angular.toJson($scope.masterstate.data.rawresponse));
                    }
                };

                $scope.$on('forceReloadTransform', function (event, arg) {
                    $scope.forceReloadTransform();
                });

                $scope.$on('forceReloadQuery', function (event, arg) {
                    $scope.forceReloadQuery();
                });

                $scope.init = function () {

                    if ($scope.masterstate) {

                        $scope.unwatchers.push(
                            $scope.$watch('masterstate.query.controls.querytype', function (newValue, oldvalue) {

                                //preserve model in the event of a service switch (1)
                                var savedControl = $scope.masterstate.query.controls.rtmmodel;
                                var savedPayload = $scope.masterstate.query.controls.template.templatedPayload;

                                if ($scope.masterstate.query
                                    && $scope.masterstate.query.controls
                                    && $scope.masterstate.query.controls.querytype
                                    && oldvalue !== newValue) {

                                    if (newValue === 'aggregates') {
                                        $scope.masterstate.query = new RTMAggregatesMasterQuery();
                                        console.log('setting slave!')
                                        $scope.slavestate.query = new RTMAggregatesSlaveQuery();
                                    } else {
                                        if (newValue === 'rawvalues') {
                                            $scope.masterstate.query = new RTMRawValuesMasterQuery();
                                            $scope.slavestate.query = new RTMRawValuesSlaveQuery();
                                        } else {
                                            console.log("unsupported RTM service: " + newValue);
                                        }
                                    }

                                    //preserve model in the event of a service switch (2)
                                    if (savedControl) {
                                        $scope.masterstate.query.controls.rtmmodel = savedControl;
                                    }

                                    if (savedPayload) {
                                        $scope.masterstate.query.controls.template.templatedPayload = savedPayload;
                                    }

                                    $scope.forceReloadQuery();
                                }
                            })
                        );

                        $scope.unwatchers.push(
                            $scope.$watch('masterstate.query.controls.rtmmodel', function (newValue, oldValue) {
                                //if (angular.toJson(newValue) !== angular.toJson(oldValue)) {
                                var newPayload = RTMserialize(newValue);

                                if (newPayload) {
                                    $scope.masterstate.query.controls.template.templatedPayload = newPayload;
                                }
                                //}
                            }, true) // deep watching changes in the RTM models
                        );
                    }
                }

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

                // Very temporary intg with step (need to implement pre-tmplt update from controls)
                $scope.$on('apply-global-setting', function (event, arg) {
                    var split = arg.value.split(',');
                    var type = split[0];
                    var key = split[1];
                    var value1 = split[2];
                    var value2 = split[3];

                    if (type === 'text') {
                        $scope.payload.selectors1[0].textFilters.push(new TextFilter(key, value1, value2));
                    }
                });

                $scope.init();

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
                    console.log($scope.numericalfilters)
                    $scope.numericalfilters.push(new DefaultNumericalFilter());
                    console.log($scope.numericalfilters)
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
                params: '=',
                query: '=',
                masterstate: '=',
                slavestate: '='
            },

            templateUrl: resolveTemplateURL('rtm-controls.js', 'rtm-service-params.html'),
            controller: function ($scope) {

                $scope.setParam = function (pName, newGran) {
                    $scope.params[pName] = newGran;
                    $scope.forceReloadQuery();
                };

                $scope.setChartMetric = function (metric) {
                    $scope.query.datasource.callback.postproc.transform.args[0].value = metric;
                    $scope.forceReloadTransform();
                };

                $scope.forceReloadQuery = function () {
                    $scope.$emit('forceReloadQuery');
                };

                $scope.forceReloadTransform = function () {
                    $scope.$emit('forceReloadTransform');
                };

                $scope.retrieveRawvalueMetrics = function () {

                };

                $scope.updateTableMetrics = function (metricList) {
                    if (metricList && metricList.length > 0
                        && $scope.slavestate && $scope.slavestate.query && $scope.slavestate.query.datasource && $scope.slavestate.query.datasource.callback
                        && $scope.slavestate.query.datasource.callback.postproc && $scope.slavestate.query.datasource.callback.postproc.transform
                        && $scope.slavestate.query.datasource.callback.postproc.transform.args && $scope.slavestate.query.datasource.callback.postproc.transform.args[0]
                        && $scope.slavestate.query.datasource.callback.postproc.transform.args[0].value) {
                        $scope.slavestate.query.datasource.callback.postproc.transform.args[0].value = metricList;
                    }
                };

                $scope.$watchCollection('selectedMetrics', function (newValue) {
                    var list = "";
                    $.each(newValue, function (idx, value) {
                        console.log(value);
                        if (value) {
                            list += value.id + ";";
                        }
                    });
                    $scope.updateTableMetrics(list);
                    $scope.forceReloadTransform();
                });

                $scope.aggregatemetrics = [{
                    "label": "count",
                    "id": "cnt"
                }, {
                    "label": "average",
                    "id": "avg"
                }, {
                    "label": "min",
                    "id": "min"
                }, {
                    "label": "max",
                    "id": "max"
                }, {
                    "label": "median",
                    "id": "50th pcl"
                }, {
                    "label": "count / sec",
                    "id": "tps"
                }, {
                    "label": "count / min",
                    "id": "tpm"
                }, {
                    "label": "80th pcl",
                    "id": "80th pcl"
                }, {
                    "label": "90th pcl",
                    "id": "90th pcl"
                }, {
                    "label": "99th pcl",
                    "id": "99th pcl"
                }];
                $scope.selectedMetrics = [];
                $scope.metricSearchSettings = {
                    scrollableHeight: '200px',
                    scrollable: true,
                    enableSearch: true
                };
                $scope.tabIndex = 1;

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










var directiveModule = angular.module('angularjs-dropdown-multiselect', []);

directiveModule.directive('ngDropdownMultiselect', ['$filter', '$document', '$compile', '$parse',

    function ($filter, $document, $compile, $parse) {

        return {
            restrict: 'AE',
            scope: {
                selectedModel: '=',
                options: '=',
                extraSettings: '=',
                events: '=',
                searchFilter: '=?',
                translationTexts: '=',
                groupBy: '@'
            },
            template: function (element, attrs) {
                var checkboxes = attrs.checkboxes ? true : false;
                var groups = attrs.groupBy ? true : false;

                var template = '<div class="multiselect-parent btn-group dropdown-multiselect rtm-dropdown form-radio dropdown">';
                template += '<button type="button" class="dropdown-toggle" ng-class="settings.buttonClasses" ng-click="toggleDropdown()">{{getButtonText()}}&nbsp;<span class="caret"></span></button>';
                template += '<ul class="dropdown-menu dropdown-menu-form" ng-style="{display: open ? \'block\' : \'none\', height : settings.scrollable ? settings.scrollableHeight : \'auto\' }" style="overflow: scroll" >';
                template += '<li ng-hide="!settings.showCheckAll || settings.selectionLimit > 0"><a data-ng-click="selectAll()"><span class="glyphicon glyphicon-ok"></span>  {{texts.checkAll}}</a>';
                template += '<li ng-show="settings.showUncheckAll"><a data-ng-click="deselectAll();"><span class="glyphicon glyphicon-remove"></span>   {{texts.uncheckAll}}</a></li>';
                template += '<li ng-hide="(!settings.showCheckAll || settings.selectionLimit > 0) && !settings.showUncheckAll" class="divider"></li>';
                template += '<li ng-show="settings.enableSearch"><div class="dropdown-header"><input type="text" class="form-control" style="width: 100%;" ng-model="searchFilter" placeholder="{{texts.searchPlaceholder}}" /></li>';
                template += '<li ng-show="settings.enableSearch" class="divider"></li>';

                if (groups) {
                    template += '<li ng-repeat-start="option in orderedItems | filter: searchFilter" ng-show="getPropertyForObject(option, settings.groupBy) !== getPropertyForObject(orderedItems[$index - 1], settings.groupBy)" role="presentation" class="dropdown-header">{{ getGroupTitle(getPropertyForObject(option, settings.groupBy)) }}</li>';
                    template += '<li ng-repeat-end role="presentation">';
                } else {
                    template += '<li role="presentation" ng-repeat="option in options | filter: searchFilter">';
                }

                template += '<a role="menuitem" tabindex="-1" ng-click="setSelectedItem(getPropertyForObject(option,settings.idProp))">';

                if (checkboxes) {
                    template += '<div class="checkbox"><label><input class="checkboxInput" type="checkbox" ng-click="checkboxClick($event, getPropertyForObject(option,settings.idProp))" ng-checked="isChecked(getPropertyForObject(option,settings.idProp))" /> {{getPropertyForObject(option, settings.displayProp)}}</label></div></a>';
                } else {
                    template += '<span data-ng-class="{\'glyphicon glyphicon-ok\': isChecked(getPropertyForObject(option,settings.idProp))}"></span> {{getPropertyForObject(option, settings.displayProp)}}</a>';
                }

                template += '</li>';

                template += '<li class="divider" ng-show="settings.selectionLimit > 1"></li>';
                template += '<li role="presentation" ng-show="settings.selectionLimit > 1"><a role="menuitem">{{selectedModel.length}} {{texts.selectionOf}} {{settings.selectionLimit}} {{texts.selectionCount}}</a></li>';

                template += '</ul>';
                template += '</div>';

                element.html(template);
            },
            link: function ($scope, $element, $attrs) {
                var $dropdownTrigger = $element.children()[0];

                $scope.toggleDropdown = function () {
                    $scope.open = !$scope.open;
                };

                $scope.checkboxClick = function ($event, id) {
                    $scope.setSelectedItem(id);
                    $event.stopImmediatePropagation();
                };

                $scope.externalEvents = {
                    onItemSelect: angular.noop,
                    onItemDeselect: angular.noop,
                    onSelectAll: angular.noop,
                    onDeselectAll: angular.noop,
                    onInitDone: angular.noop,
                    onMaxSelectionReached: angular.noop
                };

                $scope.settings = {
                    dynamicTitle: true,
                    scrollable: false,
                    scrollableHeight: '300px',
                    closeOnBlur: true,
                    displayProp: 'label',
                    idProp: 'id',
                    externalIdProp: 'id',
                    enableSearch: false,
                    selectionLimit: 0,
                    showCheckAll: true,
                    showUncheckAll: true,
                    closeOnSelect: false,
                    buttonClasses: 'btn btn-primary viz-btn-success dropdown-toggle',
                    closeOnDeselect: false,
                    groupBy: $attrs.groupBy || undefined,
                    groupByTextProvider: null,
                    smartButtonMaxItems: 0,
                    smartButtonTextConverter: angular.noop
                };

                $scope.texts = {
                    checkAll: 'Check All',
                    uncheckAll: 'Uncheck All',
                    selectionCount: 'checked',
                    selectionOf: '/',
                    searchPlaceholder: 'Search...',
                    buttonDefaultText: 'Select',
                    dynamicButtonTextSuffix: 'checked'
                };

                $scope.searchFilter = $scope.searchFilter || '';

                if (angular.isDefined($scope.settings.groupBy)) {
                    $scope.$watch('options', function (newValue) {
                        if (angular.isDefined(newValue)) {
                            $scope.orderedItems = $filter('orderBy')(newValue, $scope.settings.groupBy);
                        }
                    });
                }

                angular.extend($scope.settings, $scope.extraSettings || []);
                angular.extend($scope.externalEvents, $scope.events || []);
                angular.extend($scope.texts, $scope.translationTexts);

                $scope.singleSelection = $scope.settings.selectionLimit === 1;

                function getFindObj(id) {
                    var findObj = {};

                    if ($scope.settings.externalIdProp === '') {
                        findObj[$scope.settings.idProp] = id;
                    } else {
                        findObj[$scope.settings.externalIdProp] = id;
                    }

                    return findObj;
                }

                function clearObject(object) {
                    for (var prop in object) {
                        delete object[prop];
                    }
                }

                if ($scope.singleSelection) {
                    if (angular.isArray($scope.selectedModel) && $scope.selectedModel.length === 0) {
                        clearObject($scope.selectedModel);
                    }
                }

                if ($scope.settings.closeOnBlur) {
                    $document.on('click', function (e) {
                        var target = e.target.parentElement;
                        var parentFound = false;

                        while (angular.isDefined(target) && target !== null && !parentFound) {
                            if (_.contains(target.className.split(' '), 'multiselect-parent') && !parentFound) {
                                if (target === $dropdownTrigger) {
                                    parentFound = true;
                                }
                            }
                            target = target.parentElement;
                        }

                        if (!parentFound) {
                            $scope.$apply(function () {
                                $scope.open = false;
                            });
                        }
                    });
                }

                $scope.getGroupTitle = function (groupValue) {
                    if ($scope.settings.groupByTextProvider !== null) {
                        return $scope.settings.groupByTextProvider(groupValue);
                    }

                    return groupValue;
                };

                $scope.getButtonText = function () {
                    if ($scope.settings.dynamicTitle && ($scope.selectedModel.length > 0 || (angular.isObject($scope.selectedModel) && _.keys($scope.selectedModel).length > 0))) {
                        if ($scope.settings.smartButtonMaxItems > 0) {
                            var itemsText = [];

                            angular.forEach($scope.options, function (optionItem) {
                                if ($scope.isChecked($scope.getPropertyForObject(optionItem, $scope.settings.idProp))) {
                                    var displayText = $scope.getPropertyForObject(optionItem, $scope.settings.displayProp);
                                    var converterResponse = $scope.settings.smartButtonTextConverter(displayText, optionItem);

                                    itemsText.push(converterResponse ? converterResponse : displayText);
                                }
                            });

                            if ($scope.selectedModel.length > $scope.settings.smartButtonMaxItems) {
                                itemsText = itemsText.slice(0, $scope.settings.smartButtonMaxItems);
                                itemsText.push('...');
                            }

                            return itemsText.join(', ');
                        } else {
                            var totalSelected;

                            if ($scope.singleSelection) {
                                totalSelected = ($scope.selectedModel !== null && angular.isDefined($scope.selectedModel[$scope.settings.idProp])) ? 1 : 0;
                            } else {
                                totalSelected = angular.isDefined($scope.selectedModel) ? $scope.selectedModel.length : 0;
                            }

                            if (totalSelected === 0) {
                                return $scope.texts.buttonDefaultText;
                            } else {
                                return totalSelected + ' ' + $scope.texts.dynamicButtonTextSuffix;
                            }
                        }
                    } else {
                        return $scope.texts.buttonDefaultText;
                    }
                };

                $scope.getPropertyForObject = function (object, property) {
                    if (angular.isDefined(object) && object.hasOwnProperty(property)) {
                        return object[property];
                    }

                    return '';
                };

                $scope.selectAll = function () {
                    $scope.deselectAll(false);
                    $scope.externalEvents.onSelectAll();

                    angular.forEach($scope.options, function (value) {
                        $scope.setSelectedItem(value[$scope.settings.idProp], true);
                    });
                };

                $scope.deselectAll = function (sendEvent) {
                    sendEvent = sendEvent || true;

                    if (sendEvent) {
                        $scope.externalEvents.onDeselectAll();
                    }

                    if ($scope.singleSelection) {
                        clearObject($scope.selectedModel);
                    } else {
                        $scope.selectedModel.splice(0, $scope.selectedModel.length);
                    }
                };

                $scope.setSelectedItem = function (id, dontRemove) {
                    var findObj = getFindObj(id);
                    var finalObj = null;

                    if ($scope.settings.externalIdProp === '') {
                        finalObj = _.find($scope.options, findObj);
                    } else {
                        finalObj = findObj;
                    }

                    if ($scope.singleSelection) {
                        clearObject($scope.selectedModel);
                        angular.extend($scope.selectedModel, finalObj);
                        $scope.externalEvents.onItemSelect(finalObj);
                        if ($scope.settings.closeOnSelect) $scope.open = false;

                        return;
                    }

                    dontRemove = dontRemove || false;

                    var exists = _.findIndex($scope.selectedModel, findObj) !== -1;

                    if (!dontRemove && exists) {
                        $scope.selectedModel.splice(_.findIndex($scope.selectedModel, findObj), 1);
                        $scope.externalEvents.onItemDeselect(findObj);
                    } else if (!exists && ($scope.settings.selectionLimit === 0 || $scope.selectedModel.length < $scope.settings.selectionLimit)) {
                        $scope.selectedModel.push(finalObj);
                        $scope.externalEvents.onItemSelect(finalObj);
                    }
                    if ($scope.settings.closeOnSelect) $scope.open = false;
                };

                $scope.isChecked = function (id) {
                    if ($scope.singleSelection) {
                        return $scope.selectedModel !== null && angular.isDefined($scope.selectedModel[$scope.settings.idProp]) && $scope.selectedModel[$scope.settings.idProp] === getFindObj(id)[$scope.settings.idProp];
                    }

                    return _.findIndex($scope.selectedModel, getFindObj(id)) !== -1;
                };

                $scope.externalEvents.onInitDone();
            }
        };
    }]);
