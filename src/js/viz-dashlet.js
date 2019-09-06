var vizDashletscripts = document.getElementsByTagName("script")
var vizDashletcurrentScriptPath = vizDashletscripts[vizDashletscripts.length - 1].src;

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

angular.module('viz-dashlet', ['nvd3', 'ui.bootstrap', 'rtm-controls'])
    .directive('vizDashlet', function () {
        return {
            restric: 'E',
            scope: {
                options: '=',
                state: '='
            },
            templateUrl: vizDashletcurrentScriptPath.replace('/js/', '/templates/').replace('viz-dashlet.js', 'viz-dashlet.html') + '?anticache=' + getUniqueId(),
            controller: function ($scope, $element) {

                $scope.redraw = 'drawn';

                $scope.dashlettabstate = $scope.state.tabindex;

                $scope.saveState = function () {
                    $scope.state.tabindex = $scope.dashlettabstate;
                };
            }
        };
    })
    .directive('vizQuery', function () {
        return {
            restric: 'E',
            scope: {
                formwidth: '=',
                state: '='
            },
            templateUrl: vizDashletcurrentScriptPath.replace('/js/', '/templates/').replace('viz-dashlet.js', 'viz-query.html') + '?anticache=' + getUniqueId(),
            controller: function ($scope, $http) {

                // Init
                $scope.currentquery = $scope.state.init.query;
                $scope.counter = 0;

                $scope.loadQueryPreset = function (querypreset) {
                    $scope.currentquery = querypreset.query;
                }

                $scope.fireQuery = function () {
                    $scope.counter++;
                    var service = $scope.currentquery.datasource.service;
                    if ($scope.currentquery.type === 'Simple') {
                        $scope.executeHttp(service.method, service.url, service.data, $scope.dispatchSuccessResponse, $scope.dispatchErrorResponse);
                    }
                    if ($scope.currentquery.type === 'Async') {
                        $scope.executeHttp(service.method, service.url, service.data,
                            $scope.dispatchAsync,
                            $scope.dispatchErrorResponse);
                    }
                };

                $scope.dispatchAsync = function (response) {
                    console.log('async:' + JSON.stringify(response));
                };

                $scope.dispatchErrorResponse = function (response) {
                    console.log('error:' + JSON.stringify(response));
                };

                $scope.executeHttp = function (method, url, payload, successcallback, errorcallback) {
                    if (method === 'Get') { $http.get(url).then(function (response) { console.log('get'); successcallback(response); }, function (response) { errorcallback(response); }); }
                    if (method === 'Post') { $http.post(url, payload).then(function (response) { successcallback(response); }, function (response) { errorcallback(response); }); }
                };

                $scope.dispatchSuccessResponse = function (response) {
                    $scope.state.data.raw = response;
                    console.log($scope.state.data.raw);
                    $scope.rawserviceresponse = JSON.stringify(response);
                    $scope.runPostProcs(response);
                }

                $scope.runPostProcs = function (response) {
                    var service = $scope.currentquery.datasource.service;
                    if (service.postproc.lineChart && service.postproc.lineChart.function)
                        $scope.state.data.lineChartData = eval('(' + service.postproc.lineChart.function + ')(response)');
                    if (service.postproc.table && service.postproc.table.function)
                        $scope.state.data.tableData = eval('(' + service.postproc.table.function + ')(response)');
                    if (service.postproc.saved && service.postproc.saved.function)
                        $scope.state.data.saved = eval('(' + service.postproc.saved.function + ')(response)');
                };
            }
        }
    })
    .directive('vizView', function () {
        return {
            restric: 'E',
            scope: {
                options: '=',
                state: '='
            },
            templateUrl: vizDashletcurrentScriptPath.replace('/js/', '/templates/').replace('viz-dashlet.js', 'viz-view.html') + '?anticache=' + getUniqueId(),
            controller: function ($scope) {

            }
        };
    })
    .directive('vizConfig', function () {
        return {
            restric: 'E',
            scope: {
                formwidth: '=',
                state: '='
            },
            templateUrl: vizDashletcurrentScriptPath.replace('/js/', '/templates/').replace('viz-dashlet.js', 'viz-config.html') + '?anticache=' + getUniqueId(),
            controller: function ($scope, $http) {

                // Default state, before loading any presets
                $scope.currentconfig = $scope.state.init.config;

                $scope.loadConfigPreset = function (preset) {
                    $scope.currentconfig = preset;
                };
            }
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
    });

function DefaultOptions(chartHeight, chartWidth, innerContainerHeight, innerContainerWidth) {
    return {
        innercontainer: {
            height: innerContainerHeight,
            width: innerContainerWidth,
        },
        chart: {
            type: 'lineChart',
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
                axisLabel: 'Voltage (v)',
                tickFormat: function (d) {
                    return d3.format('.02f')(d);
                },
                axisLabelDistance: -10
            },
            callback: function (chart) {
                //console.log("!!! lineChart callback !!!");
            }
        }
    };
};