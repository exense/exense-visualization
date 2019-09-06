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
                    var datasource = $scope.currentquery.datasource.service;
                    $scope.servicesent = JSON.stringify(datasource.data);
                    $scope.executeHttp(datasource.method, datasource.url, datasource.data, $scope.dispatchSuccessResponse, datasource, $scope.dispatchErrorResponse);
                };

                $scope.dispatchAsync = function (response) {
                    console.log('async:' + JSON.stringify(response));
                };

                $scope.dispatchErrorResponse = function (response) {
                    console.log('error:' + JSON.stringify(response));
                };

                $scope.executeHttp = function (method, url, payload, successcallback, successTarget, errorcallback) {
                    if (method === 'Get') { $http.get(url).then(function (response) { successcallback(response, successTarget); }, function (response) { errorcallback(response); }); }
                    if (method === 'Post') { $http.post(url, payload).then(function (response) { successcallback(response, successTarget); }, function (response) { errorcallback(response); }); }
                };

                $scope.dispatchSuccessResponse = function (response, successTarget) {
                    if ($scope.currentquery.type === 'Simple') {
                        $scope.loadData(response, successTarget)
                    }
                    if ($scope.currentquery.type === 'Async') {
                        var scallback = $scope.currentquery.datasource.callback;
                        $scope.state.data.raw = response;
                        $scope.rawserviceresponse = JSON.stringify(response);
                        if ($scope.currentquery.datasource.service.postproc.save) {
                            $scope.state.data.savedData = $scope.runResponseProc($scope.currentquery.datasource.service.postproc.save.function, response);
                        }
                        var datatosend = scallback.data;
                        var urltosend = scallback.url;
                        if (scallback.preproc.replace) {
                            if (scallback.preproc.replace.target === 'data') {
                                datatosend = JSON.parse($scope.runRequestProc(scallback.preproc.replace.function, JSON.stringify(datatosend), $scope.state.data.savedData));
                            } else {
                                if (scallback.preproc.replace.target === 'url') {
                                    urltosend = JSON.parse($scope.runRequestProc(scallback.preproc.replace.function, JSON.stringify(urltosend), $scope.state.data.savedData));
                                }
                            }
                        }
                        $scope.callbacksent = 'url :' + JSON.stringify(urltosend) +'; payload:'+ JSON.stringify(datatosend);
                        $scope.executeHttp(scallback.method, urltosend, datatosend, $scope.loadData, scallback, $scope.dispatchErrorResponse);
                    }
                }

                $scope.loadData = function (response, proctarget) {
                    if ($scope.currentquery.type === 'Simple') {
                        $scope.state.data.raw = response;
                        $scope.rawserviceresponse = JSON.stringify(response);
                    }
                    if ($scope.currentquery.type === 'Async') {
                        $scope.state.data.asyncraw = response;
                        $scope.rawcallbackresponse = JSON.stringify(response);
                    }
                    $scope.state.data.chartData = $scope.runResponseProc(proctarget.postproc.lineChart.function, response);
                    $scope.state.data.tableData = $scope.runResponseProc(proctarget.postproc.table.function, response);
                };

                $scope.runResponseProc = function (postProc, response) {
                    return eval('(' + postProc + ')(response)');
                };

                $scope.runRequestProc = function (postProc, requestFragment, workData) {
                    return eval('(' + postProc + ')(requestFragment, workData)');
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