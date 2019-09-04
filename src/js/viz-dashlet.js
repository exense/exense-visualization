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

angular.module('viz-dashlet', ['nvd3', 'ui.bootstrap', 'rtm-controls'])

    .directive('vizDashlet', function () {
        return {
            restric: 'E',
            scope: {
                options: '=',
                state: '='
            },
            templateUrl: vizDashletcurrentScriptPath.replace('/js/', '/templates/').replace('viz-dashlet.js', 'viz-dashlet.html'),
            controller: function ($scope, $element) {

                $scope.redraw = 'drawn';

                $scope.dashlettabstate = $scope.state.tabindex;

                $scope.$on('childevent', function (event, arg) {
                    $scope.$broadcast(arg.target + 'event', arg);
                });

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
            templateUrl: vizDashletcurrentScriptPath.replace('/js/', '/templates/').replace('viz-dashlet.js', 'viz-query.html'),
            controller: function ($scope, $http) {

                // Default state, before loading and presets
                $scope.currentquery = {
                    datasource: {
                        inputtype: 'Raw',
                        type: 'Simple',
                        url: '/mock_data2.json',
                        method: 'Get',
                        data: ''
                    },
                    postproc: {
                        dataaccess: 'data.data.payload',
                        seriesaccess: 'name',
                        keyaccess: 'begin',
                        valueaccess: 'value'
                    }
                };

                $scope.counter = 0;

                $scope.loadQueryPreset = function (querypreset) {
                    $scope.currentquery = querypreset;
                }

                $scope.fireQuery = function () {
                    $scope.counter++;

                    if ($scope.currentquery.datasource.method === 'Get') {
                        $http.get($scope.currentquery.datasource.url)
                            .then(function (response) {
                                $scope.response = response;
                                $scope.rawresponse = JSON.stringify(response);
                                $scope.state.data = $scope.postProcess();
                            }, function (response) {
                                // send to info pane using factory / service
                                console.log('error:' + JSON.stringify(response));
                            });
                    }
                    if ($scope.currentquery.datasource.method === 'Post') {
                        $http.post($scope.currentquery.datasource.url, $scope.currentquery.datasource.data)
                            .then(function (response) {
                                $scope.response = response;
                                $scope.rawresponse = JSON.stringify(response);
                                $scope.state.data = $scope.postProcess();
                            }, function (response) {
                                // send to info pane using factory / service
                                console.log('error:' + JSON.stringify(response));
                            });
                    }
                };

                // add switch: array of series or array of elements with series as attribute
                $scope.postProcess = function () {
                    var retData = [];
                    var index = {};
                    var accessor = resolve($scope.response, $scope.currentquery.postproc.dataaccess);

                    //Data is represented as an array of {x,y} pairs.
                    for (var i = 0; i < accessor.length; i++) {
                        var curSeries = resolve(accessor[i], $scope.currentquery.postproc.seriesaccess);
                        if (!index[curSeries]) {
                            retData.push({
                                values: [],
                                key: curSeries,
                                color: '#ff7f0e',
                                strokeWidth: 2,
                                classed: 'dashed'
                            });
                            index[curSeries] = retData.length - 1;
                        }
                        retData[index[curSeries]].values.push({ x: resolve(accessor[i], $scope.currentquery.postproc.keyaccess), y: resolve(accessor[i], $scope.currentquery.postproc.valueaccess) });
                    }

                    //Line chart data should be sent as an array of series objects.
                    return retData;
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
            templateUrl: vizDashletcurrentScriptPath.replace('/js/', '/templates/').replace('viz-dashlet.js', 'viz-view.html'),
            controller: function ($scope) {

                // Default
                $scope.configdisplaytype = 'LineChart';
                
                // option 1
                $scope.$on('viewevent', function (event, arg) {
                    $scope[arg.modelname] = arg[arg.modelname];
                });

                // option2 
                // listen directly on config control?

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
            templateUrl: vizDashletcurrentScriptPath.replace('/js/', '/templates/').replace('viz-dashlet.js', 'viz-config.html'),
            controller: function ($scope, $http) {

                // Default state, before loading any presets
                $scope.currentconfig = {
                    display: {
                        type: 'LineChart',
                        autorefresh: 'Off'
                    }
                };

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