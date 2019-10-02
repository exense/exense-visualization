registerScript();

angular.module('viz-dashlet', ['viz-query', 'dashletcomssrv'])
    .directive('vizDashlet', function ($rootScope) {
        return {
            restrict: 'E',
            scope: {
                widgetid: '=',
                state: '=',
                displaymode: '=',
                presets: '='
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
                    $scope.state.viewtoggle = !$scope.state.viewtoggle;
                }

                $scope.toggleBarchevronToViz = function () {
                    $scope.fireQueryDependingOnContext();
                    $scope.state.viewtoggle = !$scope.state.viewtoggle;
                }

                $scope.fireQueryDependingOnContext = function(){
                    //Not firing our own query if slave, just listening to data
                    //Also not firing if autorefresh is on
                    if (!$scope.state.config.slave && ($scope.state.config.autorefresh !== 'On')) {
                        $scope.fireQuery();
                    }
                }

                // init
                $scope.isOngoingQuery = false;
                $scope.autorefreshInterval = undefined;

                $scope.fireQuery = function () {
                    console.log('['+$scope.widgetid+']Firing query.');
                    try {
                        $scope.isOngoingQuery = true;
                        var srv = $scope.state.query.datasource.service;
                        if (!srv.params) {
                            srv.params = ""; // prevent "undefined" string from being concatenated
                        }
                        $scope.state.http.servicesent = 'url :' + JSON.stringify(srv.url + srv.params) + '; payload:' + JSON.stringify(srv.data);
                        $scope.executeHttp(srv.method, srv.url + srv.params, srv.data, $scope.dispatchSuccessResponse, srv, $scope.dispatchErrorResponse);
                    } catch (e) {
                        console.log('exception thrown while firing query: ' + e);
                    }
                };

                $scope.dispatchErrorResponse = function (response) {
                    console.log('error:' + JSON.stringify(response) + "; Resetting Query refresh.");
                    $scope.clearAsync();
                    $scope.isOngoingQuery = false;
                };

                $scope.executeHttp = function (method, url, payload, successcallback, successTarget, errorcallback) {
                    if (method === 'Get') { $http.get(url).then(function (response) { successcallback(response, successTarget); }, function (response) { errorcallback(response); }); }
                    if (method === 'Post') { $http.post(url, payload).then(function (response) { successcallback(response, successTarget); }, function (response) { errorcallback(response); }); }
                };

                $scope.dispatchSuccessResponse = function (response, successTarget) {
                    try {
                        if ($scope.state.query.type === 'Simple') {
                            $scope.loadData(response, successTarget);
                        }
                        if ($scope.state.query.type === 'Async') {
                            var scallback = $scope.state.query.datasource.callback;
                            //$scope.state.data.serviceraw = response;
                            $scope.state.http.rawserviceresponse = JSON.stringify(response);
                            if ($scope.state.query.datasource.service.postproc.save) {
                                $scope.state.data.state = runResponseProc($scope.state.query.datasource.service.postproc.save.function, null, response);
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

                            $scope.state.http.callbacksent = 'url :' + JSON.stringify(urltosend) + '; payload:' + JSON.stringify(datatosend);
                            var executionFunction = function () {
                                $scope.executeHttp(scallback.method, urltosend, datatosend, $scope.loadData, scallback, $scope.dispatchErrorResponse)
                            };
                            $scope.asyncInterval = setInterval(executionFunction, 500);
                        }
                    } catch (e) {
                        console.log(e);
                        $scope.clearAsync();
                        $scope.isOngoingQuery = false;
                    }
                };

                $scope.clearAsync = function () {
                    if ($scope.asyncInterval) {
                        clearInterval($scope.asyncInterval);
                    }else{
                    	console.log('Could not clear async (null or undefined).');
                    }
                };

                $scope.loadData = function (response, proctarget) {
                    if ($scope.state.query.type === 'Simple') {
                        $scope.state.http.rawserviceresponse = response;
                        $scope.isOngoingQuery = false;
                    }
                    if ($scope.state.query.type === 'Async') {
                        if ($scope.asyncInterval) {
                            try {
                                // stream consumed
                                if (runResponseProc($scope.state.query.datasource.callback.postproc.asyncEnd.function, null, response)) {
                                    //console.log('consumed. Clearing Async and resetting query fire.')
                                    $scope.clearAsync();
                                    $scope.isOngoingQuery = false;
                                }else{
                                    //console.log('Stream incomplete -> ' + JSON.stringify(response));
                                }
                            } catch (e) {
                                console.log(e);
                                $scope.clearAsync();
                            }
                        }
                        $scope.state.http.rawcallbackresponse = response;
                    }
                    $scope.state.data.rawresponse = { dashdata: response };
                };

                $scope.$watch('state.data.rawresponse', function (newValue) {
                    var proctarget = undefined;
                    if ($scope.state.query.type === 'Simple') {
                        proctarget = $scope.state.query.datasource.service;
                    }
                    if ($scope.state.query.type === 'Async') {
                        proctarget = $scope.state.query.datasource.callback;
                    }
                    if (proctarget && proctarget.postproc && newValue && newValue.dashdata) { // due to watch init
                        if (proctarget.postproc.transform.function && proctarget.postproc.transform.function.length > 0) {
                            $scope.state.data.transformed = { dashdata: runResponseProc(proctarget.postproc.transform.function, keyvalarrayToIndex(evalDynamic(proctarget.postproc.transform.args), 'key', 'value'), newValue.dashdata) };
                        } else {
                            console.log('Warning: a new raw value was read by widget with id : ' + $scope.widgetid + ' but no transform function was provided');
                        }
                    }
                });

                $scope.$watch('state.config.autorefresh', function (newValue) {
                    if (newValue === 'On') {
                        $scope.autorefreshInterval = setInterval(function () {
                            if (!$scope.isOngoingQuery) {
                                try {
                                    //console.log('$scope.isOngoingQuery=' + $scope.isOngoingQuery + "; Firing.");
                                    $scope.fireQuery();
                                } catch (e) {
                                    console.log('[Autorefresh] unable to refresh due to error: ' + e + "; Starting new query.");
                                    // agressive
                                    $scope.isOngoingQuery = false;
                                }
                            }else{
                                //console.log('$scope.isOngoingQuery=' + $scope.isOngoingQuery + "; Skipping interval.");
                            }
                        }, setIntervalDefault);
                    } else {
                        if ($scope.autorefreshInterval) {
                            clearInterval($scope.autorefreshInterval);
                        }
                    }
                });

                // Paging

                // also initPaging() on viewtoggle (back to config)?
                $scope.$on('templateph-loaded', function () {
                    if ($scope.state.query.controls
                        && $scope.state.query.controls.template
                        && $scope.state.query.paged.ispaged) {
                        $scope.initPaging();
                    }
                });

                $scope.$on('firenext', function () {
                    $scope.nextPaging();
                });

                $scope.$on('fireprevious', function () {
                    $scope.previousPaging();
                });

                $scope.$on('template-updated', function () {
                    $scope.fireQuery();
                });

                $scope.initPaging = function () {
                    var paged = $scope.state.query.paged;
                    if (paged && paged.offsets && paged.offsets.first) {
                        paged.offsets.first.state = runValueFunction(paged.offsets.first.start);
                        if (paged.offsets.second) {
                            paged.offsets.second.state = runValueFunction(paged.offsets.second.start);
                        }
                    }
                    $scope.$broadcast('update-template-nofire');
                }

                $scope.nextPaging = function () {
                    var paged = $scope.state.query.paged;
                    paged.offsets.first.state = runValueFunction(paged.offsets.first.next, paged.offsets.first.state);
                    paged.offsets.second.state = runValueFunction(paged.offsets.second.next, paged.offsets.second.state);
                    $scope.$broadcast('update-template');
                }

                $scope.previousPaging = function () {
                    var paged = $scope.state.query.paged;
                    paged.offsets.first.state = runValueFunction(paged.offsets.first.previous, paged.offsets.first.state);
                    paged.offsets.second.state = runValueFunction(paged.offsets.second.previous, paged.offsets.second.state);
                    $scope.$broadcast('update-template');
                }

                if(!$scope.state.viewtoggle){
                    $scope.$on('dashletinput-initialized', function () {
                        $scope.fireQueryDependingOnContext();
                    });
                }
            }
        };
    });