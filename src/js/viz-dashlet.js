registerScript();

angular.module('viz-dashlet', ['viz-query', 'dashletcomssrv'])
    .directive('vizDashlet', function () {

        var controllerScript = 'viz-dashlet.js';
        var aggTemplateUrl = resolveTemplateURL(controllerScript, 'viz-dashlet-aggregated.html');
        var expTemplateUrl = resolveTemplateURL(controllerScript, 'viz-dashlet-exploded.html');
        var errorTemplateUrl = resolveTemplateURL(controllerScript, 'error-template.html');

        return {
            restrict: 'E',
            scope: {
                widgetid: '=',
                state: '=',
                displaytype: '=',
                displaymode: '=',
                presets: '=',
                restprefix: '=',
                inputsettingscol: '='
            },
            template: '<div ng-include="resolveDynamicTemplate()"></div>',
            controller: function ($scope, $http, dashletcomssrv, $timeout) {
                if ($scope.state) {
                    $scope.state.unwatchers = [];
                }
                $scope.loaded = false;
                $scope.resolveDynamicTemplate = function () {
                    if ($scope.displaytype === 'aggregated') {
                        return aggTemplateUrl;
                    }
                    else {
                        if ($scope.displaytype === 'exploded') {
                            return expTemplateUrl;
                        } else {
                            return errorTemplateUrl;
                        }
                    }
                };

                $scope.selectTab = function (tabIndex) {
                    $scope.state.tabindex = tabIndex;
                };

                $scope.isTabActive = function (tabIndex) {
                    return tabIndex === $scope.state.tabindex;
                };

                $scope.messageBoxClick = function () {
                    $scope.toggleBarchevronToConf();
                    $scope.selectTab(3);
                    $scope.state.gui.status.open.info = true;
                };

                $scope.toggleBarchevronToConf = function () {
                    $scope.state.viewtoggle = !$scope.state.viewtoggle;
                }

                $scope.toggleBarchevronToViz = function () {
                    if ($scope.state.config.toggleaction === 'Fire') {
                        $scope.fireQueryDependingOnContext();
                    }
                    if ($scope.state.config.toggleaction === 'Draw') {
                        $scope.state.data.rawresponse = jsoncopy($scope.state.data.rawresponse);
                    }
                    if ($scope.state.config.toggleaction === 'None') {
                        console.log('toggle view action is set to none: doing nothing.');
                    }
                    $scope.state.viewtoggle = !$scope.state.viewtoggle;
                }

                $scope.fireQueryDependingOnContext = function () {
                    //Not firing our own query if slave, just listening to data
                    //Also not firing if autorefresh is on
                    if (!$scope.state.config.slave && ($scope.state.config.autorefresh !== 'On')) {
                        $scope.fireQuery();
                    } else {
                        if ($scope.state.data.rawresponse) {
                            var saved = JSON.parse(angular.toJson($scope.state.data.rawresponse));
                            $scope.state.data.rawresponse = saved;
                        }
                    }
                }

                $scope.cleanupState = function () {
                    $scope.state.info.http.asynccheckpoint = false;
                    $scope.clearAsync();
                    $scope.$broadcast('cleanup-info');
                    //$scope.$broadcast('cleanup-view');
                    $scope.isRawDisplay = $scope.state.info.showraw === 'On';
                };

                // init
                $scope.isOngoingQuery = false;
                $scope.autorefreshInterval = undefined;

                $scope.fireQuery = function () {

                    if (!$scope.isOngoingQuery) {
                        $scope.cleanupState();
                        if ($scope.state.query && $scope.state.query.controls) {
                            try {
                                $scope.isOngoingQuery = true;
                                var srv = $scope.state.query.datasource.service;
                                if (!srv.params) {
                                    srv.params = ""; // prevent "undefined" string from being concatenated
                                }

                                //Done out of the box via templace
                                //$scope.executeReplace(srv);
                                if ($scope.isRawDisplay) {
                                    $scope.state.info.http.servicesent = 'url :' + JSON.stringify(srv.url + srv.params) + '; payload:' + JSON.stringify(srv.data);
                                }
                                $scope.executeHttp(srv.method, srv.url + srv.params, srv.data, $scope.dispatchSuccessResponse, srv, $scope.dispatchErrorResponse);
                            } catch (e) {
                                $scope.isOngoingQuery = false;
                                $scope.sendErrorMessage('exception thrown while firing query: ' + e);
                            }
                        }
                    }
                };

                $scope.dispatchErrorResponse = function (response) {
                    if ($scope.state.query.type === 'Simple') {
                        $scope.state.info.http.rawserviceresponse = JSON.stringify(response);
                    }
                    if ($scope.state.query.type === 'Async') {
                        $scope.state.info.http.rawcallbackresponse = JSON.stringify(response);
                    }
                    $scope.clearAsync();
                    $scope.isOngoingQuery = false;
                    $scope.sendErrorMessage('Query execution failed. Check error in service response for more details.');
                };

                $scope.sendErrorMessage = function (msg) {
                    $scope.$broadcast('errormessage', msg);
                    throw new Error(msg);
                }

                $scope.executeHttp = function (method, url, payload, successcallback, successTarget, errorcallback) {
                    var effectiveUrl = url;
                    var effectivePayload = payload;
                    var effectiveMethod = method;
                    if (url) {
                        if (url.startsWith('http')) { // Proxified case
                            effectiveUrl = $scope.restprefix + '/viz/proxy';
                            effectivePayload = $scope.proxify(url, method, payload);
                            effectiveMethod = 'Post';
                        }
                        $scope.doExecuteHttp(effectiveMethod, effectiveUrl, effectivePayload, successcallback, successTarget, errorcallback);
                    } else {
                        throw new Error("service url is null.");
                    }
                };

                $scope.proxify = function (url, method, payload) {
                    return {
                        url: url,
                        method: method,
                        data: payload
                    }
                };

                $scope.doExecuteHttp = function (method, url, payload, successcallback, successTarget, errorcallback) {
                    if (method === 'Get') { $http.get(url).then(function (response) { successcallback(response, successTarget); }, function (response) { errorcallback(response); }); }
                    if (method === 'Post') { $http.post(url, payload).then(function (response) { successcallback(response, successTarget); }, function (response) { errorcallback(response); }); }
                    if (method === 'Delete') { $http.delete(url, payload).then(function (response) { successcallback(response, successTarget); }, function (response) { errorcallback(response); }); }
                    if (method === 'Put') { $http.put(url, payload).then(function (response) { successcallback(response, successTarget); }, function (response) { errorcallback(response); }); }
                    if (method === 'Patch') { $http.patch(url, payload).then(function (response) { successcallback(response, successTarget); }, function (response) { errorcallback(response); }); }
                }

                $scope.dispatchSuccessResponse = function (response, successTarget) {
                    try {
                        if ($scope.state.query.type === 'Simple') {
                            $scope.loadData(response, successTarget);
                        }
                        if ($scope.state.query.type === 'Async') {
                            $scope.state.info.http.asynccheckpoint = true;
                            var srv = $scope.state.query.datasource.service;
                            var scallback = $scope.state.query.datasource.callback;
                            //$scope.state.data.serviceraw = response;
                            if ($scope.isRawDisplay) {
                                $scope.state.info.http.rawserviceresponse = JSON.stringify(response);
                            }
                            if ($scope.state.query.datasource.service.postproc.save) {
                                $scope.state.data.state = runResponseProc(srv.postproc.save.function, null, response);
                            }

                            var input = $scope.executeReplace(scallback, $scope.state.data.placeholdersstate);

                            if ($scope.isRawDisplay) {
                                $scope.state.info.http.callbacksent = 'url :' + JSON.stringify(input.url) + '; payload:' + JSON.stringify(input.data);
                            }
                            var executionFunction = function () {
                                $scope.executeHttp(scallback.method, input.url, input.data, $scope.loadData, scallback, $scope.dispatchErrorResponse)
                            };
                            $scope.setAsyncInterval(executionFunction);
                        }
                    } catch (e) {
                        $scope.clearAsync();
                        $scope.isOngoingQuery = false;
                        $scope.sendErrorMessage('An error occured while processing response:' + e);
                    }
                };

                //TODO: this should be scoped inside viz-query (inputs) and triggered via events
                $scope.executeReplace = function (service, mergedplaceholders) {
                    var mergedstate;

                    if (mergedplaceholders && $scope.state.data.state) {
                        mergedstate = mergedplaceholders.concat($scope.state.data.state);
                    } else {
                        if (mergedplaceholders) {
                            mergedstate = mergedplaceholders;
                        }
                        if ($scope.state.data.state) {
                            mergedstate = $scope.state.data.state;
                        }
                    }

                    var datatosend = service.data;
                    var urltosend = service.url;
                    if (service.preproc.replace && service.preproc.replace.function) {
                        var replaced;
                        if (datatosend) {
                            try {
                                replaced = runRequestProc(service.preproc.replace.function, datatosend, mergedstate);
                                datatosend = JSON.parse(replaced);
                            } catch (e) {
                                $scope.sendErrorMessage('An issue occured while replacing payload data: ' + e);
                            }
                        }
                        if (urltosend) {
                            try {
                                replaced = runRequestProc(service.preproc.replace.function, urltosend, mergedstate);
                                urltosend = replaced;
                            } catch (e) {
                                $scope.sendErrorMessage('An issue occured while replacing url params: ' + e);
                            }
                        }
                    }

                    return { data: datatosend, url: urltosend };
                }

                $scope.setAsyncInterval = function (callback) {
                    $scope.clearAsync();

                    var duration = setIntervalAsyncDefault;
                    if ($scope.state.config.asyncrefreshduration) {
                        duration = $scope.state.config.asyncrefreshduration;
                    }

                    $scope.asyncInterval = setInterval(callback, duration);
                };

                $scope.clearAsync = function () {
                    if ($scope.asyncInterval) {
                        clearInterval($scope.asyncInterval);
                        if ($scope.state && $scope.state.title) {
                            $scope.$emit('async-query-cycle-complete', $scope.state.title);
                        } else {
                            console.log('Warning: clearAsync was called while state or state.title was null or undefined.')
                        }
                    }
                };

                $scope.loadData = function (response, proctarget) {
                    if ($scope.state.query.type === 'Simple') {
                        if ($scope.isRawDisplay) {
                            $scope.state.info.http.rawserviceresponse = JSON.stringify(response);
                        }
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
                                } else {
                                    //console.log('Stream incomplete -> ' + JSON.stringify(response));
                                }
                            } catch (e) {
                                $scope.clearAsync();
                                $scope.sendErrorMessage('An error occured while checking async response completeness' + e);
                            }
                        }
                        if ($scope.isRawDisplay) {
                            $scope.state.info.http.rawcallbackresponse = JSON.stringify(response);
                        }
                    }
                    $scope.state.data.rawresponse = { dashdata: response };
                };

                $scope.state.unwatchers.push($scope.$watch('state.data.rawresponse', function (newValue) {
                    var proctarget = undefined;
                    if ($scope.state.query.type === 'Simple') {
                        proctarget = $scope.state.query.datasource.service;
                    }
                    if ($scope.state.query.type === 'Async') {
                        proctarget = $scope.state.query.datasource.callback;
                    }
                    // due to watch init
                    if (proctarget && proctarget.postproc && newValue && newValue.dashdata) {
                        //$scope.loaded: do not append at load time (the value has most likely already been added 
                        if (proctarget.postproc.transform.function && proctarget.postproc.transform.function.length > 0 && $scope.loaded) {
                            try {
                                var newTransformed = {
                                    dashdata: runResponseProc(
                                        proctarget.postproc.transform.function,
                                        keyvalarrayToIndex(
                                            evalDynamic(proctarget.postproc.transform.args),
                                            'key',
                                            'value'),
                                        newValue.dashdata
                                    )
                                };
                                //incremental refresh mode
                                if ($scope.state.data.transformed && $scope.state.data.transformed.dashdata && newTransformed && newTransformed.dashdata && $scope.state.config.incremental === 'On') {
                                    // new dots don't fit, trim existing array
                                    if ($scope.state.data.transformed.dashdata.length + newTransformed.dashdata.length > $scope.state.config.incmaxdots) {
                                        var overflow = $scope.state.data.transformed.dashdata.length + newTransformed.dashdata.length - $scope.state.config.incmaxdots;
                                        $scope.state.data.transformed.dashdata = $scope.state.data.transformed.dashdata.splice(overflow, $scope.state.data.transformed.dashdata.length - 1);
                                    }
                                    $scope.state.data.transformed = { dashdata: $scope.state.data.transformed.dashdata.concat(newTransformed.dashdata) };
                                } else {
                                    $scope.state.data.transformed = newTransformed;
                                }
                            } catch (e) {
                                $scope.sendErrorMessage('An error occured while performing transformation:' + e);
                            }
                        } else {
                            $scope.sendErrorMessage('Warning: a new raw value was read by widget with id : ' + $scope.widgetid + ' but no transform function was provided');
                        }
                    }
                }));

                $scope.clearAutorefreshInterval = function () {
                    if ($scope.autorefreshInterval) {
                        clearInterval($scope.autorefreshInterval);
                    }
                }

                $scope.restartInterval = function (refreshToggle) {
                    $scope.clearAutorefreshInterval();
                    if (refreshToggle === 'On') {
                        $scope.setAutorefreshInterval();
                    }
                }

                $scope.state.unwatchers.push($scope.$watch('state.config.autorefresh', function (newValue) {
                    $scope.restartInterval(newValue);
                }));

                var autoRefreshFunction = function() {
                    if (!$scope.isOngoingQuery) {
                        try {
                            //console.log('$scope.isOngoingQuery=' + $scope.isOngoingQuery + "; Firing.");
                            $scope.fireQuery();
                        } catch (e) {
                            $scope.sendErrorMessage('[Autorefresh] unable to refresh due to error: ' + e + "; Starting new query.");
                            // agressive
                            $scope.clearAutorefreshInterval();
                            $scope.isOngoingQuery = false;
                        }
                    } else {
                        //console.log('$scope.isOngoingQuery=' + $scope.isOngoingQuery + "; Skipping interval.");
                    }
                }

                $scope.setAutorefreshInterval = function () {
                    var duration = setIntervalDefault;
                    if ($scope.state.config.autorefreshduration) {
                        duration = $scope.state.config.autorefreshduration;
                    }
                    $timeout(function() { autoRefreshFunction();});
                    $scope.autorefreshInterval = setInterval(function () {
                        autoRefreshFunction();
                    }, duration);
                }

                // info pane trigger
                $scope.$on('firequery', function () {
                    $scope.fireQuery();
                });

                $scope.$on('fireQueryDependingOnContext', function () {
                    $scope.fireQueryDependingOnContext();
                });

                // Paging

                // On Template Preset loaded - also initPaging() on viewtoggle (back to config)?
                $scope.$on('templateph-loaded', function () {
                    if ($scope.state.query.controls
                        && $scope.state.query.controls.template
                        && $scope.state.query.paged.ispaged) {
                        $scope.initPaging();
                    }
                });

                $scope.$watch('state.query.paged.ispaged', function (newValue) {
                    if (newValue === 'On') {
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

                $scope.$on('dashboard-data-clear', function () {
                    console.log('clearing data.');
                    $scope.clearData();
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
                    if (paged.offsets.second) {
                        paged.offsets.second.state = runValueFunction(paged.offsets.second.next, paged.offsets.second.state);
                    }
                    $scope.$broadcast('update-template');
                }

                $scope.previousPaging = function () {
                    var paged = $scope.state.query.paged;
                    paged.offsets.first.state = runValueFunction(paged.offsets.first.previous, paged.offsets.first.state);
                    if (paged.offsets.second) {
                        paged.offsets.second.state = runValueFunction(paged.offsets.second.previous, paged.offsets.second.state);
                    }
                    $scope.$broadcast('update-template');
                };

                $scope.terminate = function () {
                    console.log('[' + $scope.widgetid + '] terminating...');
                    dashletcomssrv.unregisterWidget($scope.widgetid);
                    $scope.clearAsync();
                    $scope.clearAutorefreshInterval();
                    $scope.state.config.autorefresh = 'Off';
                    $scope.state.data = {};
                    $scope.state = null;
                    console.log('[' + $scope.widgetid + '] termination complete.');
                };

                $scope.unwatchAll = function () {
                    $.each($scope.state.unwatchers, function (idx, unwatcher) {
                        unwatcher();
                    });
                };

                $scope.$on('dashletinput-ready', function () {
                    if (!$scope.isAlreadyData()) {
                        $scope.fireQueryDependingOnContext();
                    }
                    $scope.loaded = true;
                });

                $scope.isAlreadyData = function () {
                    return $scope.state.data.rawresponse
                        || $scope.state.data.transformed
                        || ($scope.state.gui.chartdata && $scope.state.gui.chartdata.length > 0)
                        || $scope.state.gui.tabledata;
                };

                $scope.clearData = function () {
                    $scope.state.data.rawresponse = null;
                    $scope.state.data.transformed = null;
                    $scope.state.gui.chartdata = [];
                    $scope.state.gui.tabledata = null;
                };

                $scope.$on('globalsettings-refreshToggle', function (event, arg) {
                    if (arg.new === true) {
                        if (!$scope.state.config.slave) {
                            $scope.state.config.autorefresh = 'On';
                        }
                    } else {
                        $scope.state.config.autorefresh = 'Off';
                    }
                });

                $scope.$on('globalsettings-refreshInterval', function (event, arg) {
                    if (arg.new > 0) {
                        if (!$scope.state.config.slave) {
                            $scope.state.config.autorefreshduration = arg.new;
                            $scope.restartInterval($scope.state.config.autorefresh);
                        }
                    }
                });

                $scope.$on('$destroy', function () {
                    $scope.terminate();
                });
            }
        };
    });