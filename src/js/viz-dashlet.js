registerScript();

angular.module('viz-dashlet', ['viz-query', 'dashletcomssrv'])
    .directive('vizDashlet', function ($rootScope) {
        return {
            restrict: 'E',
            scope: {
                options: '=',
                dashletid: '=',
                state: '='
            },
            templateUrl: resolveTemplateURL('viz-dashlet.js', 'viz-dashlet.html'),
            controller: function ($scope, $element, $http, dashletcomssrv) {

                $scope.redraw = 'drawn';

                $scope.$on('globalsettings-refreshToggle', function (event, arg) {
                    if (arg.new) {
                        if (!$scope.state.shared.config.slave) {
                            $scope.state.shared.config.autorefresh = 'On';
                        }
                    } else {
                        $scope.state.shared.config.autorefresh = 'Off';
                    }
                });

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
                        $scope.state.shared.http.servicesent = 'url :' + JSON.stringify(curtmplt.url + curtmplt.params) + '; payload:' + JSON.stringify(curtmplt.data);
                        $scope.executeHttp(curtmplt.method, curtmplt.url+curtmplt.params, curtmplt.data, $scope.dispatchSuccessResponse, curtmplt, $scope.dispatchErrorResponse);
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


                $scope.undoMaster = function () {
                    console.log($scope.dashletid + ': undoMaster')
                    // we shouldn't be registered if we don't have an unwatcher
                    dashletcomssrv.unregisterWidget($scope.dashletid);
                    if ($scope.unwatchMaster) {
                        //dashletcomssrv.unregisterWidget($scope.dashletid);
                        $scope.unwatchMaster();
                    }
                }

                $scope.undoSlave = function () {
                    if ($scope.unwatchSlave) {
                        $scope.unwatchSlave();
                    }
                }

                $scope.$on('coms-reset', function () {
                    if ($scope.state.shared.config.master) {
                        $scope.state.shared.config.master = !$scope.state.shared.config.master;
                    }
                    $scope.undoMaster();

                    if ($scope.state.shared.config.slave) {
                        $scope.state.shared.config.slave = !$scope.state.shared.config.slave;
                    }
                    $scope.undoSlave();
                });

                // clean up when slave unchecked
                // state.shared.config.slave

                $scope.$on('isMaster-changed', function (event, newValue) {
                    if (!newValue) {
                        dashletcomssrv.registerWidget($scope.dashletid, $scope.state.shared.config.dashlettitle);
                        $scope.unwatchMaster = $scope.$watch('state.data.transformed', function (newValue) {
                            dashletcomssrv.updateMasterValue($scope.dashletid, angular.toJson(newValue));
                        });
                    }
                    else {
                        $scope.undoMaster();
                    }
                });

                $scope.$watch('state.shared.config.dashlettitle', function (newValue) {
                    if ($scope.state.shared.config.master) {
                        dashletcomssrv.udpdateTitle($scope.dashletid, newValue);
                    }
                });

                $scope.unwatchSlave = '';

                $scope.startWatchingMaster = function (masterid) {
                    if ($scope.state.shared.config.slave) {
                        var unwatcher = $scope.$watch(function () {
                            return dashletcomssrv.buffer[masterid];
                        }, function (newValue) {
                            // Event somehow not propagating right, setting value directly for now
                            // Update: event was not propagating due to controller out of scope
                            // This is not an issue anymore with most responsibilities at dashlet level
                            //$scope.$broadcast('slavedata-received', parsed);
                            $scope.state.data.transformed = JSON.parse(newValue);
                        });
                        $scope.unwatchSlave = unwatcher;
                    }
                };

                $scope.$watch('state.shared.config.slave', function (newValue) {
                    if (!newValue) {
                        $scope.undoSlave();
                    }
                });

                // no watching directly on the checkbox, only doing something once a master is picked
                $scope.$on('master-loaded', function (event, master) {
                    //if master already previously selected, stop watching him
                    $scope.undoSlave();
                    $scope.state.shared.config.currentmaster = master;
                    $scope.startWatchingMaster(master.oid);
                });

                // bind service masters to config master selection list
                $scope.$watch(function () {
                    return dashletcomssrv.masters;
                }, function (newValue) {
                    $scope.state.shared.config.masters = newValue;
                });

                $scope.$on('single-remove', function (event, arg) {
                    if (arg === $scope.dashletid) {
                        console.log('single-remove targeting ' + arg + ' was received.');
                        $scope.prepareRemove();
                    }
                });

                $scope.$on('global-remove', function (event, arg) {
                    $scope.prepareRemove();
                });

                $scope.prepareRemove = function () {
                    console.log('prepareRemove called.')
                    if ($scope.state.shared.config.master) {
                        dashletcomssrv.unregisterWidget($scope.dashletid);
                    }
                }

                // after dashlet loaded or duplicated
                if ($scope.state.shared.config.currentmaster) { //slave
                    $scope.startWatchingMaster($scope.state.shared.config.currentmaster.oid);
                } if ($scope.state.shared.config.master) { //master
                    //this is only an attempt. reregistration is avoided at service level
                    dashletcomssrv.registerWidget($scope.dashletid, $scope.state.shared.config.dashlettitle);
                }
            }
        };
    });