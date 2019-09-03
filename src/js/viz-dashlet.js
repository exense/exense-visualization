var vizDashletscripts = document.getElementsByTagName("script")
var vizDashletcurrentScriptPath = vizDashletscripts[vizDashletscripts.length - 1].src;

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
                $scope.currentquery = JSON.parse(JSON.stringify($scope.state.initialquery));
                $scope.counter = 0;
                $scope.inputtype = 'Raw';

                $scope.loadPreset = function (preset) {
                    $scope.currentquery = preset.query;
                    $scope.inputtype = preset.inputtype;
                }

                $scope.fireQuery = function () {
                    $scope.counter++;
                    $http.get($scope.currentquery.url)
                        .then(function (response) {
                            $scope.response = response;
                            $scope.rawresponse = JSON.stringify(response);
                            $scope.state.data = $scope.postProcess();
                        }, function (response) {
                            // send to info pane using factory / service
                            console.log('error:' + JSON.stringify(response));
                        }
                        );
                };

                $scope.postProcess = function () {
                    var retData = [];

                    var accessor = $scope.resolve($scope.response, $scope.currentquery.dataaccess);

                    //Data is represented as an array of {x,y} pairs.
                    for (var i = 0; i < accessor.length; i++) {
                        retData.push({ x: $scope.resolve(accessor[i], $scope.currentquery.keyaccess), y: $scope.resolve(accessor[i], $scope.currentquery.valueaccess) });
                    }

                    //Line chart data should be sent as an array of series objects.
                    return [
                        {
                            values: retData,      //values - represents the array of {x,y} data points
                            key: $scope.currentquery.valueaccess, //key  - the name of the series.
                            color: '#ff7f0e',  //color - optional: choose your own line color.
                            strokeWidth: 2,
                            classed: 'dashed'
                        }
                    ];
                };

                $scope.resolve = function (obj, path) {
                    path = path.split('.');
                    var current = obj;
                    while (path.length) {
                        if (typeof current !== 'object') return undefined;
                        current = current[path.shift()];
                    }
                    return current;
                };

                $scope.fireQuery();
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