registerScript();
angular.module('viz-query', ['viz-view', 'ui.bootstrap', 'key-val-collection', 'rtm-controls'])
    .directive('vizQuery', function () {
        return {
            restrict: 'E',
            scope: {
                state: '=',
                presets: '=',
                inputsettingscol: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-query.html'),
            controller: function ($scope) {
            }
        }
    })
    .directive('vizTransform', function () {
        return {
            restrict: 'E',
            scope: {
                state: '=',
                presets: '=',
                inputsettingscol: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-transform.html'),
            controller: function ($scope) {
                $scope.loadTicks = function () {
                    if ($scope.state.options.chart.xAxis) {
                        $scope.state.options.chart.xAxis.tickFormat = eval('(' + $scope.state.options.chart.xAxis.strTickFormat + ')');
                    }
                    if ($scope.state.options.chart.yAxis) {
                        $scope.state.options.chart.yAxis.tickFormat = eval('(' + $scope.state.options.chart.yAxis.strTickFormat + ')');
                    }
                };

                $scope.loadScales = function () {
                    $scope.state.options.chart.xAxis.scale = eval('(' + $scope.state.options.chart.xAxis.strScale + ')');
                    $scope.state.options.chart.yAxis.scale = eval('(' + $scope.state.options.chart.yAxis.strScale + ')');
                }
                
                $scope.$on('reload-scales', function(event, arg){
                	if(arg){
                		if(arg.xAxis || arg.xAxis === ''){
                			$scope.state.options.chart.xAxis.strScale = arg.xAxis;
                		}
                		if(arg.yAxis || arg.yAxis === ''){
                			$scope.state.options.chart.yAxis.strScale = arg.yAxis;
                		}
                	}
                	
                	$scope.loadScales();
                	$scope.loadTicks();
                });

                $scope.startup = function () {
                    $scope.loadTicks();
                };

                $scope.startup();
            }
        };
    })
    .directive('vizConfig', function (dashletcomssrv) {
        return {
            restrict: 'E',
            scope: {
                widgetid: '=',
                state: '=',
                presets: '=',
                inputsettingscol: '=',
                showcoms: '=?'
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-config.html'),
            controller: function ($scope) {

                $scope.viztypes = ['seriesTable', 'dualTable', 'singleValueTable', 'singleValueFullText', 'lineChart', 'multiBarChart', 'scatterChart', 'discreteBarChart', 'stackedAreaChart'];

                $scope.loadConfigPreset = function (preset) {
                    $scope.state.config = jsoncopy(preset);
                };

                $scope.loadMaster = function (m) {
                    $scope.$emit('master-loaded', m);
                };

                $scope.titleChange = function () {
                    $scope.$emit('dashlettitle-change', { newValue: $scope.state.title })
                };

                $scope.titleChange();



                //Master-slave

                $scope.undoMaster = function () {
                    // we shouldn't be registered if we don't have an unwatcher
                    dashletcomssrv.unregisterWidget($scope.widgetid);
                    if ($scope.unwatchMaster) {
                        //dashletcomssrv.unregisterWidget($scope.widgetid);
                        $scope.unwatchMaster();
                    }
                }

                $scope.undoSlave = function () {
                    if ($scope.unwatchSlave) {
                        $scope.unwatchSlave();
                    }
                }

                $scope.$on('coms-reset', function () {
                    if ($scope.state.config.master) {
                        $scope.state.config.master = !$scope.state.config.master;
                    }
                    $scope.undoMaster();

                    if ($scope.state.config.slave) {
                        $scope.state.config.slave = !$scope.state.config.slave;
                    }
                    $scope.undoSlave();
                });

                $scope.makeMaster = function (newValue) {
                    if (!newValue) {
                        dashletcomssrv.registerWidget($scope.widgetid, $scope.state.title);
                        //updating both values upon change on transformed for optimization/simplicity
                        // could be two distinct updates via service
                        $scope.unwatchMaster = $scope.$watchCollection('state.data.transformed', function (newvalue) {
                            if (newvalue) {
                                dashletcomssrv.updateMasterValue($scope.widgetid, { transformed: angular.toJson(newvalue.dashdata), raw: angular.toJson($scope.state.data.rawresponse.dashdata) });
                            } else {
                                console.log('Warning: a failed transformation occured, we are not broadcasting new value to slaves.')
                            }
                        });
                    }
                    else {
                        $scope.undoMaster();
                    }
                }

                $scope.$on('isMaster-changed', function (event, newValue) {
                    $scope.makeMaster(newValue);
                });


                !$scope.state.unwatchers ? $scope.state.unwatchers = [] :
                    $scope.state.unwatchers.push($scope.$watch('state.title', function (newValue) {
                        if ($scope.state.config.master) {
                            dashletcomssrv.udpdateTitle($scope.widgetid, newValue);
                        }
                    }));

                $scope.unwatchSlave = '';

                $scope.startWatchingMaster = function (masterid) {
                    if ($scope.state.config.slave) {
                        var unwatcher = $scope.$watch(function () {
                            return dashletcomssrv.buffer[masterid];
                        }, function (newvalue) {
                            if (newvalue) {
                                try {
                                    if ($scope.state.config.target) {
                                        // watcher not firing if using bracket syntax...
                                        var target = $scope.state.config.target;
                                        if (target === 'state.data.transformed') {
                                            $scope.state.data.transformed = { dashdata: JSON.parse(newvalue.transformed) };
                                        }
                                        if (target === 'state.data.rawresponse') {
                                            $scope.state.data.rawresponse = { dashdata: JSON.parse(newvalue.raw) };
                                        }
                                    } else {
                                        console.log('slave target is undefined.')
                                    }
                                } catch (e) {
                                    console.log(e);
                                }
                            } else {
                                console.log('Warning: an undefined newvalue has been read by slave with id:' + $scope.widgetid);
                            }
                        });
                        $scope.unwatchSlave = unwatcher;
                    }
                };

                $scope.state.unwatchers.push($scope.$watch('state.config.slave', function (newValue) {
                    if (!newValue) {
                        $scope.undoSlave();
                    }
                }));

                // no watching directly on the checkbox, only doing something once a master is picked
                $scope.$on('master-loaded', function (event, master) {
                    //if master already previously selected, stop watching him
                    $scope.undoSlave();
                    $scope.state.config.currentmaster = master;
                    $scope.startWatchingMaster(master.oid);
                });

                // bind service masters to config master selection list
                $scope.state.unwatchers.push($scope.$watch(function () {
                    return dashletcomssrv.masters;
                }, function (newValue) {
                    $scope.state.config.masters = newValue;
                }));

                $scope.$on('single-remove', function (event, arg) {
                    if (arg === $scope.widgetid) {
                        $scope.prepareRemove();
                    }
                });

                $scope.$on('global-remove', function (event, arg) {
                    $scope.prepareRemove();
                });

                $scope.prepareRemove = function () {
                    if ($scope.state.config.master) {
                        dashletcomssrv.unregisterWidget($scope.widgetid);
                    }
                }

                // after dashlet loaded or duplicated
                if ($scope.state.config.currentmaster) { //slave
                    // let masters register first
                    $(document).ready(function () {
                        $scope.startWatchingMaster($scope.state.config.currentmaster.oid);
                    });

                } if ($scope.state.config.master) { //master
                    $scope.makeMaster(false);
                }
            }
        }
    })
    .directive('vizInfo', function () {
        return {
            restrict: 'E',
            scope: {
                widgetid: '=',
                state: '=',
                presets: '=',
                inputsettingscol: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-info.html'),
            controller: function ($scope) {

                $scope.errorboxcolor = 'gray';

                $scope.$on('cleanup-info', function () {
                    $scope.state.info.http.rawserviceresponse = "";
                    $scope.state.info.http.rawcallbackresponse = "";
                    $scope.state.info.http.callbacksent = "";
                    $scope.state.info.http.servicesent = "";
                });

                $scope.sendSaveEvent = function () {
                    $scope.$emit('dashlet-save', jsoncopy({ oid: $scope.widgetid, state: $scope.state }));
                };

                $scope.sendCopyEvent = function () {
                    $scope.$emit('dashlet-copy', jsoncopy({ oid: $scope.widgetid, state: $scope.state }));
                };

                $scope.clearMessages = function () {
                    $scope.state.info.alert.message = "";
                    $scope.state.info.alert.counter = 0;
                };

                $scope.$on('errormessage', function (event, arg) {
                    $scope.state.info.alert.message = arg + "\n\n" + $scope.state.info.alert.message;
                    $scope.state.info.alert.counter++;
                });

                $scope.$on('clearmessages', function () {
                    $scope.clearMessages();
                });

                $scope.$watch('state.info.alert.counter', function (newvalue) {
                    if (newvalue > 0) {
                        $scope.errorboxcolor = '#ff7a00';
                    } else {
                        $scope.errorboxcolor = 'gray';
                    }
                });
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
    .directive('evalString', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attr, ngModel) {
                console.log('evalString!!')
                function into(input) {
                    return (function (d) { return 1; });
                }
                function out(data) {
                    return data.toString();
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
                state: '=',
                presets: '=',
                inputsettingscol: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-q-service.html'),
            controller: function ($scope) {
                $scope.initAsync = function () {
                    var savedservice = JSON.parse(angular.toJson($scope.state.query.datasource.service));
                    $scope.state.query = new DefaultAsyncQuery();
                    $scope.state.query.datasource.service = savedservice;
                }
            }
        };
    })
    .directive('vizQInput', function () {
        return {
            restrict: 'E',
            scope: {
                state: '=',
                presets: '=',
                inputsettingscol: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-q-input.html'),
            controller: function ($scope) {

                $scope.initControls = function () {
                    $scope.state.query.controls = new DefaultControls();
                    $scope.state.query.paged = new DefaultPaging();

                    //watch state.query.controltype, cleanup existing watchers, invoke proper control init
                }

                $scope.initTemplate = function () {
                    $scope.state.query.controls.template = new DefaultTemplate();
                }

                $scope.loadQueryPreset = function (querypresetArg) {
                    var querypreset = jsoncopy(querypresetArg);
                    $scope.state.query = querypreset.query;
                }

                $scope.$watch('inputsettingscol', function (newValue) {
                    $scope.templateChange();
                }, true);

                $scope.processTemplate = function () {
                    if ($scope.state.query && $scope.state.query.controls && $scope.state.query.controls.template) {
                        var data = "", params = "";
                        //TODO:replace doesn't really need to be exposed if it's only used as part of the Template control

                        $scope.state.data.placeholdersstate = evalDynamic($scope.mergePlaceholders());
                        if ($scope.state.query.datasource.service.preproc.replace.function) {
                            if ($scope.state.query.controls.template.templatedPayload) {
                                data = runRequestProc(
                                    $scope.state.query.datasource.service.preproc.replace.function,
                                    $scope.state.query.controls.template.templatedPayload,
                                    $scope.state.data.placeholdersstate);
                            }

                            if ($scope.state.query.controls.template.templatedParams) {
                                params = runRequestProc(
                                    $scope.state.query.datasource.service.preproc.replace.function,
                                    $scope.state.query.controls.template.templatedParams,
                                    $scope.state.data.placeholdersstate);
                            }
                        }
                        return {
                            data: data,
                            params: params
                        };
                    } else {
                        return null;
                    }
                }

                $scope.mergePlaceholders = function (placeholders) {
                    var phcopy = "";
                    var gscopy = "";
                    var pagingph = [];

                    if ($scope.state.query.controls.template && $scope.state.query.controls.template.placeholders) {
                        phcopy = JSON.parse(JSON.stringify($scope.state.query.controls.template.placeholders));
                    }
                    if ($scope.inputsettingscol) {
                        gscopy = JSON.parse(JSON.stringify($scope.inputsettingscol));
                    }

                    if ($scope.state.query.controls.template && $scope.state.query.paged.ispaged === 'On') {
                        pagingph.push({ key: $scope.state.query.paged.offsets.first.vid, value: $scope.state.query.paged.offsets.first.state });
                        if ($scope.state.query.paged.offsets.second) {
                            pagingph.push({ key: $scope.state.query.paged.offsets.second.vid, value: $scope.state.query.paged.offsets.second.state });
                        }
                    }
                    return gscopy.concat(phcopy).concat(pagingph); // global settings dominate local placeholders
                };

                $scope.loadTemplatePreset = function (templateArg) {
                    var template = jsoncopy(templateArg);
                    $scope.state.query = template.queryTemplate;
                    if (!$scope.state.query.controls) {
                        $scope.state.query.controls = { template: {} };
                    }
                    $scope.state.query.controls.template.templatedPayload = template.templatedPayload;
                    $scope.state.query.controls.template.templatedParams = template.templatedParams;
                    $scope.state.query.controls.template.placeholders = template.placeholders;

                    // already updated due to paging event/callback
                    //$scope.change();

                    $scope.$emit('templateph-loaded');
                };

                $scope.$on('update-template-nofire', function () {
                    $scope.templateChange();
                });

                $scope.$on('update-template', function () {
                    $scope.templateChange();
                    $scope.$emit('template-updated');
                });

                // query about to fire
                $scope.$on('cleanup-info', function () {
                    $scope.templateChange();
                });

                $scope.templateChange = function () {
                    var appliedTemplate = $scope.processTemplate();
                    if (appliedTemplate) {
                        $scope.state.query.datasource.service.data = appliedTemplate.data;
                        $scope.state.query.datasource.service.params = appliedTemplate.params;
                    }
                }

                $scope.$emit('dashletinput-ready');
            }
        };
    })
    .directive('vizQPreproc', function () {
        return {
            restrict: 'E',
            scope: {
                state: '=',
                presets: '=',
                inputsettingscol: '='
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
                state: '=',
                presets: '=',
                inputsettingscol: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-q-postproc.html'),
            controller: function ($scope) {
            }
        };
    })