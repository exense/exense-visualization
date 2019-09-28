registerScript();

angular.module('viz-dashlet', ['viz-query', 'dashletcomssrv'])
    .directive('vizDashlet', function ($rootScope) {
        return {
            restrict: 'E',
            scope: {
                options: '=',
                widgetid: '=',
                state: '='
            },
            templateUrl: resolveTemplateURL('viz-dashlet.js', 'viz-dashlet.html'),
            controller: function ($scope, $element, $http, dashletcomssrv) {

                $scope.selectTab = function (tabIndex) {
                    $scope.state.tabindex = tabIndex;
                };

                $scope.isTabActive = function (tabIndex) {
                    return tabIndex === $scope.state.tabindex;
                };

                $scope.toggleBarchevronToConf = function () {
                    $scope.state.shared.config.barchevron = !$scope.state.shared.config.barchevron;
                }

                $scope.toggleBarchevronToViz = function () {
                    //Not firing our own query if slave, just listening to data
                    if (!$scope.state.shared.config.slave) {
                        $scope.fireQuery();
                    }
                    $scope.state.shared.config.barchevron = !$scope.state.shared.config.barchevron;
                }

                // Query firing
                $scope.isOngoingQuery = false;
                $scope.autorefreshInterval = null;

                $scope.fireQuery = function () {
                    try {
                        $scope.isOngoingQuery = true;
                        var srv = $scope.state.query.datasource.service;
                        if(!srv.params){
                            srv.params = ""; // prevent "undefined" string from being concatenated
                        }
                        $scope.state.shared.http.servicesent = 'url :' + JSON.stringify(srv.url + srv.params) + '; payload:' + JSON.stringify(srv.data);
                        $scope.executeHttp(srv.method, srv.url+srv.params, srv.data, $scope.dispatchSuccessResponse, srv, $scope.dispatchErrorResponse);
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
                    console.log('executeHttp')
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
                            $scope.state.data.state = runResponseProc($scope.state.query.datasource.service.postproc.save.function, response);
                        }
                        var datatosend = scallback.data;
                        var urltosend = scallback.url;
                        if (scallback.preproc.replace) {
                            if (scallback.preproc.replace.target === 'data') {
                                datatosend = JSON.parse(runRequestProc(scallback.preproc.replace.function, datatosend, $scope.state.data.state));
                            } else {
                                if (scallback.preproc.replace.target === 'url') {
                                    urltosend = JSON.parse(runRequestProc(scallback.preproc.replace.function, urltosend, $scope.state.data.state));
                                }
                            }
                        }

                        $scope.state.shared.http.callbacksent = 'url :' + JSON.stringify(urltosend) + '; payload:' + JSON.stringify(datatosend);
                        $scope.asyncInterval = setInterval(function () {
                            $scope.executeHttp(scallback.method, urltosend, datatosend, $scope.loadData, scallback, $scope.dispatchErrorResponse)
                        },
                            setIntervalDefault);
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
                                if (runResponseProc($scope.state.query.datasource.callback.postproc.asyncEnd.function, response)) {
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
                    $scope.state.data.transformed = runResponseProc(proctarget.postproc.transform.function, response);
                    //console.log($scope.state.data);
                };

                $scope.loadDataAsSlave = function (transformed) {
                    $scope.state.data.transformed = transformed;
                }

                $scope.$on('autorefresh-toggle', function (event, arg) {
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
                            setIntervalDefault);
                    } else {
                        clearInterval($scope.autorefreshInterval);
                    }
                });

                $scope.$on('templateph-loaded', function () {
                    $scope.initPaging();
                });

                // Paging

                $scope.$on('firenext', function () {
                    console.log('firenext')
                    $scope.nextPaging();
                    $scope.fireQuery();
                });

                $scope.$on('fireprevious', function () {
                    console.log('fireprevious')
                    $scope.previousPaging();
                    $scope.fireQuery();
                });
                
                $scope.initPaging = function () {
                    var curtmplt = $scope.state.query.controls.template;
                    if (curtmplt.paged
                        && curtmplt.paged.offsets
                        && curtmplt.paged.offsets.first) {
                        curtmplt.paged.offsets.first.state = runValueFunction(curtmplt.paged.offsets.first.start);
                        console.log(curtmplt.paged.offsets.first.state);
                        if (curtmplt.paged.offsets.second) {
                            curtmplt.paged.offsets.second.state = runValueFunction(curtmplt.paged.offsets.second.start);
                        }
                    }
                }

                $scope.nextPaging = function () {
                    var curtmplt = $scope.state.query.controls.template;
                    console.log('firstState=' + curtmplt.paged.offsets.first.state);
                    curtmplt.paged.offsets.first.state = runValueFunction(curtmplt.paged.offsets.first.next, curtmplt.paged.offsets.first.state);
                    console.log('newfirstState=' + curtmplt.paged.offsets.first.state);
                    curtmplt.paged.offsets.second.state = runValueFunction(curtmplt.paged.offsets.second.next, curtmplt.paged.offsets.second.state);
                }

                $scope.previousPaging = function () {
                    var curtmplt = $scope.state.query.controls.template;
                    curtmplt.paged.offsets.first.state = runValueFunction(curtmplt.paged.offsets.first.previous, curtmplt.paged.offsets.first.state);
                    curtmplt.paged.offsets.second.state = runValueFunction(curtmplt.paged.offsets.second.previous, curtmplt.paged.offsets.second.state);
                }
            }
        };
    });