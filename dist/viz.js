var productionmode = true;
var productionFile = 'viz.js';;
var devJSFolder = '/js/';
var devTemplateFolder = '/templates/';

var vizScripts = {};

var registerScript = function(){
    var scripts = document.getElementsByTagName("script");
    var scriptUrl = scripts[scripts.length - 1].src;

    var filenameSplit = scriptUrl.split("/");
    var filename = filenameSplit[filenameSplit.length-1];

    vizScripts[filename] = scriptUrl;
    //console.log(JSON.stringify(vizScripts));
};
registerScript();

var resolveTemplateURL = function (containername, componentname){
    if (productionmode === false){
        templateUrl = vizScripts[containername].replace(devJSFolder, devTemplateFolder)
                          .replace(containername, componentname)
                           +'?who='+componentname
                           +'&anticache=' + getUniqueId();
    }else{
        templateUrl = vizScripts[productionFile].replace(productionFile, 'templates/'+componentname);
    }
    return templateUrl;
}

var resolve = function (obj, path) {
    path = path.split('.');
    var current = obj;
    while (path.length) {
        if (typeof current !== 'object') return undefined;
        current = current[path.shift()];
    }
    return current;
};

var getUniqueId = function () {
    return Math.random().toString(36).substr(2, 9);
}

function DefaultChartOptions(chartHeight, chartWidth, innerContainerHeight, innerContainerWidth, chartType) {
    return {
        innercontainer: {
            height: innerContainerHeight,
            width: innerContainerWidth,
        },
        chart: {
            type: chartType,
            height: chartHeight,
            width: chartWidth,
            margin: {
                top: 20,
                right: 20,
                bottom: 40,
                left: 55
            },
            x: function (d) { return d.x; },
            y: function (d) { return d.y; },
            useInteractiveGuideline: true,
            dispatch: {
                stateChange: function (e) { console.log("stateChange"); },
                changeState: function (e) { console.log("changeState"); },
                tooltipShow: function (e) { console.log("tooltipShow"); },
                tooltipHide: function (e) { console.log("tooltipHide"); }
            },
            xAxis: {
                axisLabel: 'Time (ms)'
            },
            yAxis: {
                axisLabel: 'y',
                tickFormat: function (d) {
                    return d3.format('.02f')(d);
                },
                axisLabelDistance: -10
            },
            showLegend: false,
            callback: function (chart) {
                //console.log("!!! lineChart callback !!!");
            }
        }
    };
};
;
registerScript();

angular.module('rtm-controls', [])

    .directive('rtmControls', function () {
        return {
            restrict: 'E',
            scope: {
                state: '='
            },

            templateUrl: resolveTemplateURL('rtm-controls.js', 'rtm-controls.html'),
            controller: function ($scope, $rootScope) {
                $rootScope.queryResult = { 'abc': 'def' };
            }
        };
    })
;
registerScript();

angular.module('viz-dashlet', ['viz-query'])
    .directive('vizDashlet', function () {
        return {
            restrict: 'E',
            scope: {
                options: '=',
                state: '='
            },
            templateUrl: resolveTemplateURL('viz-dashlet.js', 'viz-dashlet.html'),
            controller: function ($scope, $element) {

                $scope.redraw = 'drawn';

                $scope.toggleBarchevronToConf = function () {
                    $scope.state.shared.config.barchevron = !$scope.state.shared.config.barchevron;
                }

                $scope.toggleBarchevronToViz = function () {
                    $scope.$broadcast('child-firequery', {});
                    $scope.state.shared.config.barchevron = !$scope.state.shared.config.barchevron;
                }

                $scope.$on('autorefresh-toggle', function (event, arg) {
                    $scope.$broadcast('child-autorefresh-toggle', arg);
                });

                $scope.$on('firequery', function (event, arg) {
                    $scope.$broadcast('child-firequery', arg);
                });
            }
        };
    });;
registerScript();

angular.module('viz-mgd-widget', ['viz-dashlet'])

    .directive('vizMgdWidget', function () {
        return {
            restrict: 'E',
            scope: {
                options: '=',
                widgetwidth: '=',
                dashboardid: '=',
                widgetid: '=',
                state: '='
            },
            templateUrl: resolveTemplateURL('viz-mgd-widget.js', 'viz-mgd-widget.html'),
            controller: function ($scope, $element) {
                $scope.currentstate = JSON.parse(JSON.stringify($scope.state));
                $scope.state.shared.chevron = true;
                $scope.state.shared.savedHeight = $scope.state.shared.options.innercontainer.height;
                $scope.state.shared.options.innercontainer.offset = 50;
                $scope.dashlettitle = 'Dashlet title';

                $scope.toggleChevron = function () {
                    if ($scope.state.shared.chevron) {
                        $scope.collapse();
                    } else {
                        $scope.restore();
                    }
                    $scope.state.shared.chevron = !$scope.state.shared.chevron;
                };

                $scope.collapse = function () {
                    $scope.state.shared.savedHeight = $scope.state.shared.options.innercontainer.height;
                    $scope.state.shared.savedOffset = $scope.state.shared.options.innercontainer.offset;
                    $scope.state.shared.options.innercontainer.height = 30;
                    $scope.state.shared.options.innercontainer.offset = 0;
                };

                $scope.restore = function () {
                    $scope.state.shared.options.innercontainer.height = $scope.state.shared.savedHeight;
                    $scope.state.shared.options.innercontainer.offset = $scope.state.shared.savedOffset;
                };

                $scope.$on('dashlet-title', function (event, arg) {
                    $scope.dashlettitle = arg.newValue;
                });

                $scope.getActualDashletWidth = function () {
                    return $element[0].children[0].children[0].offsetWidth;
                }

                //TODO: this will be done once per dashlet in every dashboard
                // we must find a way to run this only once
                // from whichever dashlet exists in the dashboard 
                $(window).on('resize', function () {
                    $scope.resizeSingle();
                });

                $scope.resizeSingle = function () {
                    $scope.$emit('single-resize', { did: $scope.dashboardid, wid: $scope.widgetid, newsize: 0.8 * $scope.getActualDashletWidth() });
                };

                $scope.emitExtend = function () {
                    $scope.$emit('mgdwidget-extend', { wid: $scope.widgetid });
                    $(document).ready(function () {
                        $scope.resizeSingle();
                    });
                };

                $scope.emitReduce = function () {
                    $scope.$emit('mgdwidget-reduce', { wid: $scope.widgetid });
                    $(document).ready(function () {
                        $scope.resizeSingle();
                    });
                };

                $(document).ready(function () {
                    $scope.resizeSingle();
                });
            }
        };
    });;
registerScript();
angular.module('viz-query', ['nvd3', 'ui.bootstrap', 'rtm-controls'])
    .directive('vizQuery', function () {
        return {
            restrict: 'E',
            scope: {
                formwidth: '=',
                state: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-query.html'),
            controller: function ($scope) {

                $scope.$on('templatePhChange', function () {
                    $scope.state.query.datasource.service.data = JSON.parse($scope.runRequestProc(
                        $scope.state.query.datasource.service.controls.template.datasource.service.preproc.replace.function,
                        JSON.stringify($scope.state.query.datasource.service.controls.template.datasource.service.data),
                        $scope.state.query.datasource.service.controls.placeholders));
                });
            }
        }
    })
    .directive('vizView', function () {
        return {
            restrict: 'E',
            scope: {
                options: '=',
                state: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-view.html'),
            controller: function ($scope) {
                $scope.$watch('state.data.transformed', function () {
                    if ($scope.state.shared.options.chart.type === 'table')
                        $scope.tableData = $scope.toTable($scope.state.data.transformed);
                    if ($scope.state.shared.options.chart.type.endsWith('Chart'))
                        $scope.chartData = $scope.toChart($scope.state.data.transformed);
                });

                $scope.stringToColour = function (i) {
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

                $scope.toChart = function (data) {
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
                                color: $scope.stringToColour(i),
                                strokeWidth: 3,
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
                };

                $scope.toTable = function (data) {
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
                        if (!zlist.includes(payload[i][z]))
                            zlist.push(payload[i][z]);
                    }
                    return { zlist: zlist.sort(), data: retData };
                };
            }
        };
    })
    .directive('vizTransform', function () {
        return {
            restrict: 'E',
            scope: {
                options: '=',
                state: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-transform.html'),
            controller: function ($scope, $http) {

                $scope.counter = 0;
                $scope.queryFire = false;
                $scope.isOngoingQuery = false;
                $scope.autorefreshInterval = null;

                $scope.$on('child-firequery', function (event, arg) {
                    $scope.fireQuery();
                });

                $scope.$on('child-autorefresh-toggle', function (event, arg) {
                    if (arg.newValue == true) {
                        $scope.autorefreshInterval = setInterval(function () {
                            if (!$scope.isOngoingQuery) {
                                try {
                                    $scope.fireQuery();
                                } catch (e) {
                                    console.log('exception thrown while firing query: ' + e);
                                    $scope.isOngoingQuery = false;
                                }
                            }
                        },
                            1000);
                    } else {
                        clearInterval($scope.autorefreshInterval);
                    }
                });

                $scope.fireQuery = function () {
                    try {
                        $scope.isOngoingQuery = true;
                        $scope.counter++;
                        var datasource = $scope.state.query.datasource.service;
                        $scope.state.shared.http.servicesent = 'url :' + JSON.stringify(datasource.url) + '; payload:' + JSON.stringify(datasource.data);
                        $scope.executeHttp(datasource.method, datasource.url, datasource.data, $scope.dispatchSuccessResponse, datasource, $scope.dispatchErrorResponse);
                    } catch (e) {
                        console.log('exception thrown while firing query: ' + e);
                    }
                };

                $scope.dispatchAsync = function (response) {
                    console.log('async:' + JSON.stringify(response));
                };

                $scope.dispatchErrorResponse = function (response) {
                    console.log('error:' + JSON.stringify(response));
                    if ($scope.asyncInterval) {
                        clearInterval($scope.asyncInterval);
                    }
                    $scope.isOngoingQuery = false;
                };

                $scope.executeHttp = function (method, url, payload, successcallback, successTarget, errorcallback) {
                    if (method === 'Get') { $http.get(url).then(function (response) { successcallback(response, successTarget); }, function (response) { errorcallback(response); }); }
                    if (method === 'Post') { $http.post(url, payload).then(function (response) { successcallback(response, successTarget); }, function (response) { errorcallback(response); }); }
                };

                $scope.dispatchSuccessResponse = function (response, successTarget) {
                    $scope.isOngoingQuery = false;
                    if ($scope.state.query.type === 'Simple') {
                        $scope.loadData(response, successTarget)
                    }
                    if ($scope.state.query.type === 'Async') {
                        var scallback = $scope.state.query.datasource.callback;
                        //$scope.state.data.serviceraw = response;
                        $scope.state.shared.http.rawserviceresponse = JSON.stringify(response);
                        if ($scope.state.query.datasource.service.postproc.save) {
                            $scope.state.data.state = $scope.runResponseProc($scope.state.query.datasource.service.postproc.save.function, response);
                        }
                        var datatosend = scallback.data;
                        var urltosend = scallback.url;
                        if (scallback.preproc.replace) {
                            if (scallback.preproc.replace.target === 'data') {
                                datatosend = JSON.parse($scope.runRequestProc(scallback.preproc.replace.function, JSON.stringify(datatosend), $scope.state.data.state));
                            } else {
                                if (scallback.preproc.replace.target === 'url') {
                                    urltosend = JSON.parse($scope.runRequestProc(scallback.preproc.replace.function, JSON.stringify(urltosend), $scope.state.data.state));
                                }
                            }
                        }

                        $scope.state.shared.http.callbacksent = 'url :' + JSON.stringify(urltosend) + '; payload:' + JSON.stringify(datatosend);
                        $scope.asyncInterval = setInterval(function () {
                            $scope.executeHttp(scallback.method, urltosend, datatosend, $scope.loadData, scallback, $scope.dispatchErrorResponse)
                        },
                            1000);
                    }
                }

                $scope.loadData = function (response, proctarget) {
                    if ($scope.state.query.type === 'Simple') {
                        //$scope.state.data.serviceraw = response;
                        $scope.state.shared.http.rawserviceresponse = JSON.stringify(response);
                    }
                    if ($scope.state.query.type === 'Async') {
                        if ($scope.asyncInterval) {
                            try {
                                if ($scope.runResponseProc($scope.state.query.datasource.callback.postproc.asyncEnd.function, response)) {
                                    clearInterval($scope.asyncInterval);
                                }
                            } catch (e) {
                                console.log(e);
                                clearInterval($scope.asyncInterval);
                            }
                        }
                        //$scope.state.data.callbackraw = response;
                        $scope.state.shared.http.rawcallbackresponse = JSON.stringify(response);
                    }
                    $scope.state.data.transformed = $scope.runResponseProc(proctarget.postproc.transform.function, response);
                    //console.log($scope.state.data);
                };

                $scope.runResponseProc = function (postProc, response) {
                    return eval('(' + postProc + ')(response)');
                };

                $scope.runRequestProc = function (postProc, requestFragment, workData) {
                    return eval('(' + postProc + ')(requestFragment, workData)');
                };
            }
        };
    })
    .directive('vizConfig', function () {
        return {
            restrict: 'E',
            scope: {
                formwidth: '=',
                state: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-config.html'),
            controller: function ($scope, $http) {

                $scope.currentconfig = $scope.state.shared.config;

                $scope.loadConfigPreset = function (preset) {
                    $scope.currentconfig = preset;
                    $scope.state.shared.config = $scurrentconfig;
                };
            }
        }
    })
    .directive('vizInfo', function () {
        return {
            restrict: 'E',
            scope: {
                formwidth: '=',
                state: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-info.html'),
            controller: function ($scope, $http) { }
        }
    })
    .directive('jsonText', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attr, ngModel) {
                function into(input) {
                    return JSON.parse(input);
                }
                function out(data) {
                    return JSON.stringify(data);
                }
                ngModel.$parsers.push(into);
                ngModel.$formatters.push(out);
            }
        };
    })
    .directive('vizQService', function () {
        return {
            restrict: 'E',
            scope: {
                options: '=',
                state: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-q-service.html'),
            controller: function ($scope) {
            }
        };
    })
    .directive('vizQInput', function () {
        return {
            restrict: 'E',
            scope: {
                options: '=',
                state: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-q-input.html'),
            controller: function ($scope) {
                $scope.initTemplateControls = function () {
                    $scope.state.query.datasource.service.controls = { template: '', placeholders: {} };
                    $scope.getNumber = function (num) {
                        return new Array(num);
                    }
                };

                $scope.addPlaceholder = function () {
                    $scope.state.query.datasource.service.controls.placeholders.push({ placeholder: '__?__', value: '?', isDynamic: false });
                }

                $scope.removePlaceholder = function ($index) {
                    $scope.state.query.datasource.service.controls.placeholders.splice($index, 1);
                }

                $scope.loadQueryPreset = function (querypreset) {
                    $scope.state.query = querypreset.query;
                    $scope.$emit('querychange');
                }

                $scope.loadTemplatePreset = function (template) {
                    $scope.state.query.datasource.service.controls.template = template.queryTemplate;
                    $scope.state.query.datasource.service.controls.placeholders = template.placeholders;
                };

            }
        };
    })
    .directive('vizQPreproc', function () {
        return {
            restrict: 'E',
            scope: {
                options: '=',
                state: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-q-preproc.html'),
            controller: function ($scope) {
            }
        };
    })
    .directive('vizQPostproc', function () {
        return {
            restrict: 'E',
            scope: {
                options: '=',
                state: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-q-postproc.html'),
            controller: function ($scope) {
            }
        };
    });
angular.module('wmservice', [])
    .service('wmservice', function ($rootScope) {

        var wmservice = {};

        wmservice.dashboards = [];

        wmservice.computeHeights = function () {
            var sHeight = window.innerHeight;

            // parameterize via arguments or server-originating conf & promise?
            wmservice.headersHeight = 250;
            wmservice.chartToContainer = 15;
            // wmservice.chartHeightSmall = 250;

            wmservice.chartHeightSmall = (sHeight - wmservice.headersHeight) / 2 - wmservice.chartToContainer;
            wmservice.chartHeightBig = sHeight - (wmservice.headersHeight - 80) - wmservice.chartToContainer;
            wmservice.chartWidthSmall = 0;
            wmservice.chartWidthBig = 0;
            wmservice.innerContainerHeightSmall = (sHeight - wmservice.headersHeight) / 2;
            wmservice.innerContainerHeightBig = sHeight - (wmservice.headersHeight - 80);
            wmservice.innerContainerWidthSmall = 0;
            wmservice.innerContainerWidthBig = 0;
        };

        wmservice.computeHeights();

        wmservice.forceRedraw = function () {
            //force new angular digest
            $rootScope.$apply(function () {
                self.value = 0;
            });
        };

        wmservice.getNewId = function () {
            return Math.random().toString(36).substr(2, 9);
        };

        wmservice.addDashboard = function () {
            var dId = wmservice.getNewId();
            wmservice.dashboards.push({
                title: 'New dashboard',
                widgets: [],
                dashboardid: dId
            });
            return dId;
        };

        wmservice.clearDashboards = function () {
            wmservice.dashboards.length = 0;
        };

        wmservice.clearWidgets = function (dId) {
            wmservice.getDashboardById(dId).widgets.length = 0;
        };

        wmservice.getWidget = function (dId, wId) {
            var dWidgets = wmservice.getDashboardById(dId).widgets;

            for (i = 0; i < dWidgets.length; i++) {
                if (dWidgets[i].widgetId === wId) {
                    return dWidgets[i];
                }
            }
            return null;
        };

        wmservice.updateSingleChartSize = function (dId, wId, newWidth) {

            //should only be done once at manager level
            wmservice.computeHeights();

            var widget = wmservice.getWidget(dId, wId);
            widget.state.shared.options.chart.width = newWidth;
            widget.state.shared.options.innercontainer.width = newWidth - 50;

            if (widget.widgetWidth === 'col-md-6') {
                widget.state.shared.options.chart.height = wmservice.chartHeightSmall;
                widget.state.shared.options.innercontainer.height = wmservice.innerContainerHeightSmall;
            }
            else {
                widget.state.shared.options.chart.height = wmservice.chartHeightBig;
                widget.state.shared.options.innercontainer.height = wmservice.innerContainerHeightBig;
            }
            wmservice.forceRedraw();
        };

        wmservice.extendWidget = function (dId, wId) {
            var widget = wmservice.getWidget(dId, wId);
            widget.widgetWidth = 'col-md-12';
            widget.state.shared.options.chart.height = wmservice.chartHeightBig;
            widget.state.shared.options.chart.width = wmservice.chartWidthBig;
            widget.state.shared.options.innercontainer.height = wmservice.innerContainerHeightBig;
            widget.state.shared.options.innercontainer.width = wmservice.innerContainerWidthBig;
        };

        wmservice.reduceWidget = function (dId, wId) {
            var widget = wmservice.getWidget(dId, wId);
            widget.widgetWidth = 'col-md-6';
            widget.state.shared.options.chart.height = wmservice.chartHeightSmall;
            widget.state.shared.options.chart.width = wmservice.chartWidthSmall;
            widget.state.shared.options.innercontainer.height = wmservice.innerContainerHeightSmall;
            widget.state.shared.options.innercontainer.width = wmservice.innerContainerWidthSmall;
        };

        wmservice.addWidget = function (dId, presets) {

            wId = wmservice.getNewId();

            widget = {
                widgetId: wId,
                widgetWidth: 'col-md-6',
                title: 'Dashlet title',
                state: {
                    tabindex: 0,
                    data: {
                        transformed: [],
                        state: {}
                    },
                    shared: {
                        presets: presets,
                        options: new DefaultChartOptions(wmservice.chartHeightSmall, wmservice.chartWidthSmall, wmservice.innerContainerHeightSmall, wmservice.innerContainerWidthSmall,
                            'lineChart'),
                        config: {
                            autorefresh: 'Off',
                            barchevron: true
                        },
                        http: {}
                    },
                    query: {
                        inputtype: "Raw",
                        type: "Simple",
                        datasource: {
                            service: {
                                method: "Get",
                                controls: {}
                            }
                        }
                    }
                }
            };

            // initialize every new dashboard with a first basic widget
            wmservice.getDashboardById(dId).widgets.push(widget);
        };

        wmservice.removeWidget = function (dId, wId) {
            var dWidgets = wmservice.getDashboardById(dId).widgets;

            for (i = 0; i < dWidgets.length; i++) {
                if (dWidgets[i].widgetId === wId) {
                    dWidgets.splice(i, 1);
                }
            }
        };

        wmservice.getWidgetIndex = function (dId, wId) {
            return wmservice.getObjectIndexFromArray(wmservice.getDashboardById(dId).widgets, 'widgetId', wId);
        }

        wmservice.getDashboardIndex = function (dId) {
            return wmservice.getObjectIndexFromArray(wmservice.dashboards, 'dashboardid', dId);
        }

        wmservice.getDashboardById = function (dId) {
            return wmservice.dashboards[wmservice.getDashboardIndex(dId)];
        }

        wmservice.removetDashboardById = function (dId) {
            wmservice.dashboards.splice(wmservice.getDashboardIndex(dId), 1);
        }

        wmservice.getObjectIndexFromArray = function (array, oIdKey, oId) {
            for (i = 0; i < array.length; i++) {
                if (array[i][oIdKey] === oId) {
                    return i;
                }
            }
        }

        wmservice.moveWidget = function (dId, old_index, new_index) {
            var dWidgets = wmservice.getDashboardById(dId).widgets;

            if (new_index >= dWidgets.length) {
                var k = new_index - dWidgets.length + 1;
                while (k--) {
                    arr.push(undefined);
                }
            }
            dWidgets.splice(new_index, 0, dWidgets.splice(old_index, 1)[0]);
        };

        wmservice.moveWidgetLeft = function (dId, wId) {
            var widgetIndex = wmservice.getWidgetIndex(dId, wId);

            if (widgetIndex > 0) {
                wmservice.moveWidget(dId, widgetIndex, widgetIndex - 1);
            }
        };

        wmservice.moveWidgetRight = function (dId, wId) {
            var widgetIndex = wmservice.getWidgetIndex(dId, wId);
            wmservice.moveWidget(dId, widgetIndex, widgetIndex + 1);

        };

        wmservice.duplicateWidget = function (dId, wId) {
            var copy = wmservice.getWidgetCopy(dId, wId);
            wmservice.getDashboardById(dId).widgets.push(copy);
            wmservice.moveWidget(dId, wmservice.getWidgetIndex(dId, copy.widgetId), wmservice.getWidgetIndex(dId, wId) + 1);
        };

        wmservice.getWidgetCopy = function (dId, wId) {
            var copy = JSON.parse(JSON.stringify(wmservice.getWidget(dId, wId)));
            copy.widgetId = wmservice.getNewId();
            return copy;
        };
        return wmservice;
    });
registerScript();

angular.module('viz-widget-manager', ['wmservice', 'viz-mgd-widget', 'ui.bootstrap'])
    .directive('vizDashboardManager', function (wmservice) {
        return {
            restrict: 'E',
            scope: {
                presets: '=',
            },
            templateUrl: resolveTemplateURL('viz-widget-manager.js', 'viz-dashboard-manager.html'),
            controller: function ($scope, wmservice) {

                $scope.dashboards = wmservice.dashboards;

                $scope.$on('dashboard-reload', function () {
                    $scope.dashboards = wmservice.dashboards;
                });

                // default tab (1st)
                if (wmservice.dashboards.length > 0) {
                    $scope.mgrtabstate = wmservice.dashboards[0].dashboardid;
                }

                $scope.selectTab = function (tabIndex) {
                    $scope.mgrtabstate = tabIndex;
                };

                $scope.isTabActive = function (tabIndex) {
                    return tabIndex === $scope.mgrtabstate;
                };

                $scope.$on('removeDashboard', function (event, arg) {
                    //If the currently opened tab is killed
                    if ($scope.mgrtabstate === arg) {
                        // if has previous, open previous
                        if (wmservice.getDashboardIndex($scope.mgrtabstate) > 0) {
                            var previous = wmservice.dashboards[wmservice.getDashboardIndex($scope.mgrtabstate) - 1].dashboardid;
                            $scope.mgrtabstate = previous;
                            $scope.savedState = $scope.mgrtabstate;
                        } else {// if has next, open next
                            if (wmservice.getDashboardIndex($scope.mgrtabstate) < wmservice.dashboards.length - 1) {
                                var next = wmservice.dashboards[wmservice.getDashboardIndex($scope.mgrtabstate) + 1].dashboardid;
                                $scope.mgrtabstate = next;
                                $scope.savedState = $scope.mgrtabstate;
                            }
                        }
                    }
                    wmservice.removetDashboardById(arg);
                });

                // todo: bind to config
                $scope.saveState = function () {
                    $scope.savedState = $scope.mgrtabstate;
                };

                $scope.$on('single-resize', function (event, arg) {
                    $(document).ready(function () {
                        wmservice.updateSingleChartSize(arg.did, arg.wid, arg.newsize);
                    });

                });

                $scope.$on('dashboard-new', function (event, arg) {
                    wmservice.addDashboard();
                    //Not needed anymore since reimplemented uib-tab
                    //$(document).ready(function () {
                    $scope.mgrtabstate = $scope.dashboards[$scope.dashboards.length - 1].dashboardid;
                    //});
                });

                $scope.$on('dashboard-clear', function () {
                    wmservice.clearDashboards();
                });
                $scope.$on('dashboard-current-addWidget', function () {
                    wmservice.addWidget($scope.mgrtabstate, $scope.presets);
                });
                $scope.$on('dashboard-current-clearWidgets', function () {
                    wmservice.clearWidgets($scope.mgrtabstate);
                });

                $scope.$emit('dashboard-ready');
            }
        };
    })
    .directive('vizWidgetManager', function () {
        return {
            restrict: 'E',
            scope: {
                dashboard: '=',
                presets: '='
            },
            templateUrl: resolveTemplateURL('viz-widget-manager.js', 'viz-widget-manager.html'),
            controller: function ($scope, wmservice) {

                $scope.widgets = $scope.dashboard.widgets;

                $scope.$on('mgdwidget-reduce', function (event, arg) {
                    wmservice.reduceWidget($scope.dashboard.dashboardid, arg.wid);
                });
                $scope.$on('mgdwidget-extend', function (event, arg) {
                    wmservice.extendWidget($scope.dashboard.dashboardid, arg.wid);
                });
                $scope.$on('mgdwidget-remove', function (event, arg) {
                    wmservice.removeWidget($scope.dashboard.dashboardid, arg.wid);
                });
                $scope.$on('mgdwidget-moveLeft', function (event, arg) {
                    wmservice.moveWidgetLeft($scope.dashboard.dashboardid, arg.wid);
                });
                $scope.$on('mgdwidget-moveRight', function (event, arg) {
                    wmservice.moveWidgetRight($scope.dashboard.dashboardid, arg.wid);
                });
                $scope.$on('mgdwidget-duplicate', function (event, arg) {
                    wmservice.duplicateWidget($scope.dashboard.dashboardid, arg.wid);
                });
                $scope.$on('mgdwidget-refresh', function (event, arg) {
                    //not implemented yet
                });

                //wmservice.addWidget($scope.dashboard.dashboardid, $scope.presets);
            }
        };
    })

