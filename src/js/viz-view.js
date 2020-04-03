registerScript();
angular.module('viz-view', ['nvd3'])
    .directive('vizView', function () {
        return {
            restrict: 'E',
            scope: {
                customheight: '=',
                state: '=',
                presets: '=',
                inputsettingscol: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-view.html'),
            controller: function ($scope) {

                // default
                $scope.colorFunction = stringToColour;

                if ($scope.state.options.chart.colorFunction) {
                    $scope.colorFunction = $scope.state.options.chart.colorFunction;
                }

                if ($scope.customheight) {
                    $scope.state.options.chart.height = customheight - 10;
                }

                $scope.state.unwatchers.push($scope.$watchCollection('state.data.transformed', function (newvalue) {
                    $scope.cleanupTooltips(true);
                    if (newvalue && newvalue.dashdata) {
                        if ($scope.state.options.chart.type.endsWith('seriesTable')) {
                            $scope.state.gui.tabledata = $scope.toTable(newvalue.dashdata);
                        }
                        if ($scope.state.options.chart.type.endsWith('dualTable')) {
                            var zx = $scope.state.options.chart.dualzx;
                            if (!zx || zx.length < 2) {
                                //console.log('regular zx (' + zx + ')');
                                $scope.state.gui.tabledata =
                                    vizmdTransformation.toPlainTable(
                                        vizmdTransformation.toDualGrouping(newvalue.dashdata, 'z', 'x'),
                                        'xAxis', 'series');
                            } else {
                                //console.log('alt zx (' + zx + ')');
                                $scope.state.gui.tabledata =
                                    vizmdTransformation.toPlainTable(
                                        vizmdTransformation.toDualGrouping(newvalue.dashdata, zx.substring(0, 1), zx.substring(1, 2)),
                                        'xAxis', 'series');
                            }
                        }
                        if ($scope.state.options.chart.type.endsWith('Chart')) {
                            $scope.state.gui.chartdata = $scope.toChart(newvalue.dashdata);
                            //$scope.applyDynamicChartConfig();
                            $scope.reapplyScales();
                        }

                        if ($scope.state.info.showraw === 'On') {
                            $scope.state.info.transformresult = angular.toJson(newvalue.dashdata);
                        }

                        $(document).ready(function () {
                            $scope.cleanupTooltips(false);
                        })
                    }
                }));

                $scope.cleanupTooltips = function (noopacity) {
                    // clear all but last
                    while ($("div.nvtooltip").length > 1) {
                        $("div.nvtooltip").first().remove();
                    }
                    // if current tooltip leaked, gets hidden
                    if (noopacity) {
                        d3.selectAll('.nvtooltip').style('opacity', '0');
                    }
                };

                $scope.$on('$destroy', function () {
                    $scope.cleanupTooltips();
                });

                $scope.applyDynamicChartConfig = function () {
                    $(document).ready(function () {
                        var size = $(".nv-axisMax-y text").text().length;
                        $scope.state.options.chart.margin.left = 35 + 5 * size;

                        // race condition with margin refresh (or any other dynamic update of the chart's config)
                        // need to find a way to fix rotateYLabel issue in nvd3
                        /*
                        $(document).ready(function () {
                            $(".nv-y .tick text").attr("transform", "rotate(-40 0,14)");
                            $(".nv-axisMaxMin-y text").attr("transform", "rotate(-40 0,14)");
                        });
                        */
                    });
                }

                $scope.reapplyScales = function () {
                    if ($scope.state.options.chart.xAxis) {
                        $scope.state.options.chart.xDomain = eval($scope.state.options.chart.xAxis.strScale);
                    }
                    if ($scope.state.options.chart.yAxis) {
                        $scope.state.options.chart.yDomain = eval($scope.state.options.chart.yAxis.strScale);
                    }
                }

                $scope.$on('resized', function () {
                    //$scope.applyDynamicChartConfig();
                });

                $scope.formatPotentialTimestamp = function (value) {
                    return formatPotentialTimestamp(value);
                };

                $scope.stringToColour = function (str) {
                    return stringToColour(str);
                };

                $scope.isPagingOff = function () {
                    if ($scope.state.query.controls
                        && $scope.state.query.controls.template
                        && $scope.state.query.paged.ispaged) {
                        return $scope.state.query.paged.ispaged === 'Off';
                    } else {
                        return true;
                    }
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
                                color: $scope.colorFunction(curSeries),
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

                $scope.$on('$destroy', function () {
                    $scope.cleanupTooltips();
                });
            }
        };
    })



    .directive('vizVSeriestable', function () {
        return {
            restrict: 'E',
            scope: {
                customheight: '=',
                state: '=',
                presets: '=',
                inputsettingscol: '='
            },
            templateUrl: resolveTemplateURL('viz-view.js', 'viz-v-seriestable.html'),
            controller: function ($scope) {

                $scope.stringToColour = function (str) {
                    return stringToColour(str);
                };

            }
        };
    })
    .directive('vizVDualtable', function () {
        return {
            restrict: 'E',
            scope: {
                customheight: '=',
                state: '=',
                presets: '=',
                inputsettingscol: '='
            },
            templateUrl: resolveTemplateURL('viz-view.js', 'viz-v-dualtable.html'),
            controller: function ($scope) {

                $scope.stringToColour = function (str) {
                    return stringToColour(str);
                };

            }
        };
    })
    .directive('vizVSinglevaluetable', function () {
        return {
            restrict: 'E',
            scope: {
                customheight: '=',
                state: '=',
                presets: '=',
                inputsettingscol: '='
            },
            templateUrl: resolveTemplateURL('viz-view.js', 'viz-v-singlevaluetable.html'),
            controller: function ($scope) {

                $scope.stringToColour = function (str) {
                    return stringToColour(str);
                };

            }
        };
    })
    .directive('vizVValuefulltext', function () {
        return {
            restrict: 'E',
            scope: {
                customheight: '=',
                state: '=',
                presets: '=',
                inputsettingscol: '='
            },
            templateUrl: resolveTemplateURL('viz-view.js', 'viz-v-singlevaluefulltext.html'),
            controller: function ($scope) {

                $scope.stringToColour = function (str) {
                    return stringToColour(str);
                };

            }
        };
    })
    .directive('vizVChart', function () {
        return {
            restrict: 'E',
            scope: {
                customheight: '=',
                state: '=',
                presets: '=',
                inputsettingscol: '='
            },
            templateUrl: resolveTemplateURL('viz-view.js', 'viz-v-chart.html'),
            controller: function ($scope) {

                $scope.stringToColour = function (str) {
                    return stringToColour(str);
                };

            }
        };
    })