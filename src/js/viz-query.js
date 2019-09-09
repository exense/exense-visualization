var vizQueryscripts = document.getElementsByTagName("script")
var vizQuerycurrentScriptPath = vizQueryscripts[vizQueryscripts.length - 1].src;

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

angular.module('viz-query', ['nvd3', 'ui.bootstrap', 'rtm-controls'])
    .directive('vizQuery', function () {
        return {
            restrict: 'E',
            scope: {
                formwidth: '=',
                state: '='
            },
            templateUrl: vizQuerycurrentScriptPath.replace('/js/', '/templates/').replace('viz-query.js', 'viz-query.html') + '?who=viz-query&anticache=' + getUniqueId(),
            controller: function ($scope, $http) {

                // Init
                $scope.currentquery = $scope.state.query;
                $scope.counter = 0;
                $scope.queryFire = false;
                $scope.isOngoingQuery = false;
                $scope.autorefreshInterval = null;

                $scope.$on('querychange', function () {
                    $scope.currentquery = $scope.state.query;
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

                $scope.$on('templatePhChange', function () {
                    $scope.state.query.datasource.service.data = JSON.parse($scope.runRequestProc(
                        $scope.state.query.datasource.service.controls.template.datasource.service.preproc.replace.function,
                        JSON.stringify($scope.state.query.datasource.service.controls.template.datasource.service.data),
                        $scope.state.query.datasource.service.controls.placeholders));
                });

                $scope.fireQuery = function () {
                    $scope.isOngoingQuery = true;
                    $scope.counter++;
                    var datasource = $scope.currentquery.datasource.service;
                    $scope.servicesent = 'url :' + JSON.stringify(datasource.url) + '; payload:' + JSON.stringify(datasource.data);
                    $scope.executeHttp(datasource.method, datasource.url, datasource.data, $scope.dispatchSuccessResponse, datasource, $scope.dispatchErrorResponse);
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

                        $scope.callbacksent = 'url :' + JSON.stringify(urltosend) + '; payload:' + JSON.stringify(datatosend);
                        $scope.asyncInterval = setInterval(function () {
                            $scope.executeHttp(scallback.method, urltosend, datatosend, $scope.loadData, scallback, $scope.dispatchErrorResponse)
                        },
                            1000);
                    }
                }

                $scope.loadData = function (response, proctarget) {
                    if ($scope.currentquery.type === 'Simple') {
                        $scope.state.data.raw = response;
                        $scope.rawserviceresponse = JSON.stringify(response);
                    }
                    if ($scope.currentquery.type === 'Async') {
                        if ($scope.asyncInterval) {
                            try {
                                if ($scope.runResponseProc($scope.currentquery.datasource.callback.postproc.asyncEnd.function, response)) {
                                    clearInterval($scope.asyncInterval);
                                }
                            } catch{
                                clearInterval($scope.asyncInterval);
                            }
                        }
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
            restrict: 'E',
            scope: {
                options: '=',
                state: '='
            },
            templateUrl: vizQuerycurrentScriptPath.replace('/js/', '/templates/').replace('viz-query.js', 'viz-view.html') + '?who=viz-view&anticache=' + getUniqueId(),
            controller: function ($scope) {

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
            templateUrl: vizQuerycurrentScriptPath.replace('/js/', '/templates/').replace('viz-query.js', 'viz-config.html') + '?who=viz-config&anticache=' + getUniqueId(),
            controller: function ($scope, $http) {

                $scope.currentconfig = $scope.state.shared.config;

                $scope.loadConfigPreset = function (preset) {
                    $scope.currentconfig = preset;
                    $scope.state.shared.config = $scurrentconfig;
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
    })
    .directive('vizQService', function () {
        return {
            restrict: 'E',
            scope: {
                options: '=',
                state: '=',
                passedquery: '='
            },
            templateUrl: vizQuerycurrentScriptPath.replace('/js/', '/templates/').replace('viz-query.js', 'viz-q-service.html') + '?who=viz-q-service&anticache=' + getUniqueId(),
            controller: function ($scope) {
            }
        };
    })
    .directive('vizQInput', function () {
        return {
            restrict: 'E',
            scope: {
                options: '=',
                state: '=',
                passedquery: '='
            },
            templateUrl: vizQuerycurrentScriptPath.replace('/js/', '/templates/').replace('viz-query.js', 'viz-q-input.html') + '?who=viz-q-input&anticache=' + getUniqueId(),
            controller: function ($scope) {
                $scope.initTemplateControls = function () {
                    $scope.state.query.datasource.service.controls = { template: '', placeholders: {} };
                    $scope.getNumber = function (num) {
                        return new Array(num);
                    }
                };

                $scope.addPlaceholder = function () {
                    $scope.state.query.datasource.service.controls.placeholders.push({ placeholder: '__?__', value: '?' });
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
                state: '=',
                passedquery: '='
            },
            templateUrl: vizQuerycurrentScriptPath.replace('/js/', '/templates/').replace('viz-query.js', 'viz-q-preproc.html') + '?who=viz-q-preproc&anticache=' + getUniqueId(),
            controller: function ($scope) {
            }
        };
    })
    .directive('vizQPostproc', function () {
        return {
            restrict: 'E',
            scope: {
                options: '=',
                state: '=',
                passedquery: '='
            },
            templateUrl: vizQuerycurrentScriptPath.replace('/js/', '/templates/').replace('viz-query.js', 'viz-q-postproc.html') + '?who=viz-q-postproc&anticache=' + getUniqueId(),
            controller: function ($scope) {
            }
        };
    })