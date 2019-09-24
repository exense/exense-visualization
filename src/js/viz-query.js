registerScript();
angular.module('viz-query', ['nvd3', 'ui.bootstrap', 'key-val-collection', 'rtm-controls'])
    .directive('vizQuery', function () {
        return {
            restrict: 'E',
            scope: {
                formwidth: '=',
                state: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-query.html'),
            controller: function ($scope) {
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

                $scope.isPagingOff = function () {
                    if ($scope.state.query.controls
                        && $scope.state.query.controls.template
                        && $scope.state.query.paged.ispaged) {
                        return $scope.state.query.paged.ispaged === 'Off';
                    } else {
                        return false;
                    }
                }

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
            controller: function ($scope) {

            }
        };
    })
    .directive('vizConfig', function (dashletcomssrv) {
        return {
            restrict: 'E',
            scope: {
                formwidth: '=',
                widgetid: '=',
                state: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-config.html'),
            controller: function ($scope) {

                $scope.state.shared.config.dashlettitle = $scope.state.title;

                $scope.loadConfigPreset = function (preset) {
                    $scope.currentconfig = preset;
                    $scope.state.shared.config = $scurrentconfig;
                };

                $scope.loadMaster = function (m) {
                    $scope.$emit('master-loaded', m);
                };

                $scope.titleChange = function () {
                    $scope.$emit('dashlettitle-change', { newValue: $scope.state.shared.config.dashlettitle })
                };

                $scope.titleChange();
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
            controller: function ($scope) { }
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

                $scope.globalsettings = [];

                $scope.loadQueryPreset = function (querypreset) {
                    $scope.state.query = querypreset.query;
                }

                $scope.$on('key-val-collection-change-Placeholders', function (event, arg) {
                    $scope.templateplaceholders = arg.collection;
                    $scope.change(false);
                });

                $scope.processTemplate = function (placeholders) {
                    var data = runRequestProc(
                        $scope.state.query.datasource.service.preproc.replace.function,
                        $scope.state.query.controls.template.templatedPayload,
                        evalDynamic($scope.mergePlaceholders()));

                    var params = runRequestProc(
                        $scope.state.query.datasource.service.preproc.replace.function,
                        $scope.state.query.controls.template.templatedParams,
                        evalDynamic($scope.mergePlaceholders()));

                    return {
                        data: data,
                        params: params
                    };
                }

                // integration with outer settings via events
                $scope.$on('globalsettings-change', function (event, arg) {
                    $scope.globalsettings = arg.collection;

                    // ignoring case where no template has been loaded yet
                    if ($scope.state.query.controls.template) {
                        $scope.change(arg.async);
                    }
                });

                $scope.mergePlaceholders = function (placeholders) {
                    var phcopy = JSON.parse(JSON.stringify($scope.state.query.controls.template.placeholders));
                    var gscopy = JSON.parse(JSON.stringify($scope.globalsettings));
                    var pagingph = [];
                    console.log($scope.state)
                    if ($scope.state.query.controls.template && $scope.state.query.paged.ispaged === 'On') {
                        pagingph.push({ key: $scope.state.query.paged.offsets.first.vid, value: $scope.state.query.paged.offsets.first.state });
                        pagingph.push({ key: $scope.state.query.paged.offsets.second.vid, value: $scope.state.query.paged.offsets.second.state });
                    }
                    console.log('merging paging:')
                    console.log(pagingph)
                    return gscopy.concat(phcopy).concat(pagingph); // global settings dominate local placeholders
                };

                $scope.loadTemplatePreset = function (template) {
                    $scope.state.query = template.queryTemplate;
                    if (!$scope.state.query.controls) {
                        $scope.state.query.controls = { template: {} };
                    }
                    $scope.state.query.controls.template.templatedPayload = template.templatedPayload;
                    $scope.state.query.controls.template.templatedParams = template.templatedParams;
                    $scope.state.query.controls.template.placeholders = template.placeholders;

                    $scope.$emit('templateph-loaded');
                };

                $scope.change = function (async) {
                    var appliedTemplate = $scope.processTemplate();
                    $scope.state.query.datasource.service.data = appliedTemplate.data;
                    $scope.state.query.datasource.service.params = appliedTemplate.params;
                }
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
    })