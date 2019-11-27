registerScript();
angular.module('viz-query', ['nvd3', 'ui.bootstrap', 'key-val-collection', 'rtm-controls'])
    .directive('vizQuery', function () {
        return {
            restrict: 'E',
            scope: {
                state: '=',
                presets: '='
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
                customheight: '=',
                state: '=',
                presets: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-view.html'),
            controller: function ($scope) {

                if ($scope.customheight) {
                    $scope.state.options.chart.height = customheight - 10;
                }

                $scope.state.unwatchers.push($scope.$watch('state.data.transformed', function (newvalue) {
                    if (newvalue && newvalue.dashdata) {
                        if ($scope.state.options.chart.type.endsWith('seriesTable')) {
                            $scope.state.gui.tabledata = $scope.toTable(newvalue.dashdata);
                        }
                        if ($scope.state.options.chart.type.endsWith('Chart')) {
                            $scope.cleanupTooltips();
                            $scope.state.gui.chartdata = $scope.toChart(newvalue.dashdata);
                            //$scope.applyDynamicChartConfig();
                            $scope.reapplyScales();
                        }
                    }
                    if ($scope.state.info.showraw === 'On') {
                        $scope.state.info.transformresult = angular.toJson(newvalue.dashdata);
                    }
                }));

                $scope.cleanupTooltips = function () {
                    $("div.nvtooltip").remove();
                };

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

                $scope.reapplyScales = function(){
                    $scope.state.options.chart.xDomain = eval($scope.state.options.chart.xAxis.strScale);
                    $scope.state.options.chart.yDomain = eval($scope.state.options.chart.yAxis.strScale);
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
                                color: $scope.stringToColour(curSeries),
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
                state: '=',
                presets: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-transform.html'),
            controller: function ($scope) {
                $scope.loadTicks = function () {
                    $scope.state.options.chart.xAxis.tickFormat = eval('(' + $scope.state.options.chart.xAxis.strTickFormat + ')');
                    //$scope.state.options.chart.xAxis.tickFormat = function(d){ return 3;};
                    $scope.state.options.chart.yAxis.tickFormat = eval('(' + $scope.state.options.chart.yAxis.strTickFormat + ')');
                }

                $scope.loadScales = function () {
                    $scope.state.options.chart.xAxis.scale = eval('(' + $scope.state.options.chart.xAxis.strScale + ')');
                    $scope.state.options.chart.yAxis.scale = eval('(' + $scope.state.options.chart.yAxis.strScale + ')');
                }

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
                presets: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-config.html'),
            controller: function ($scope) {

                $scope.$on('globalsettings-refreshToggle', function (event, arg) {
                    if (arg.new) {
                        if (!$scope.state.config.slave) {
                            $scope.state.config.autorefresh = 'On';
                        }
                    } else {
                        $scope.state.config.autorefresh = 'Off';
                    }
                });

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
                        $scope.unwatchMaster = $scope.$watch('state.data.transformed', function (newvalue) {
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
                presets: '='
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
                presets: '='
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
                presets: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-q-input.html'),
            controller: function ($scope) {

                $scope.globalsettings = [];
                $scope.globalsettingschangeinit = false;

                $scope.initControls = function () {
                    $scope.state.query.controls = new DefaultControls();
                    $scope.state.query.paged = new DefaultPaging();
                }

                $scope.initTemplate = function () {
                    $scope.state.query.controls.template = new DefaultTemplate();
                }

                $scope.loadQueryPreset = function (querypresetArg) {
                    var querypreset = jsoncopy(querypresetArg);
                    $scope.state.query = querypreset.query;
                }

                $scope.$on('key-val-collection-change-Placeholders', function (event, arg) {
                    $scope.templateplaceholders = arg.collection;
                    $scope.change(false);
                });

                $scope.processTemplate = function (placeholders) {
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
                }

                $scope.updateLocalSettings = function (arg) {
                    $scope.globalsettings = arg.collection;

                    // when no template has been loaded, just save the data, no need to trigger an update
                    if ($scope.state.query.controls && $scope.state.query.controls.template) {
                        $scope.change(arg.async);
                    }
                }

                // integration with outer settings via events
                $scope.$on('globalsettings-change', function (event, arg) {
                    $scope.updateLocalSettings(arg);
                });

                $scope.$on('globalsettings-change-init', function (event, arg) {
                    if (!$scope.globalsettingschangeinit || $scope.globalsettingschangeinit === false) {
                        $scope.updateLocalSettings(arg);
                        $scope.$emit('dashletinput-initialized');
                        $scope.globalsettingschangeinit = true;
                    }
                });

                $scope.mergePlaceholders = function (placeholders) {
                    var phcopy = JSON.parse(JSON.stringify($scope.state.query.controls.template.placeholders));
                    var gscopy = JSON.parse(JSON.stringify($scope.globalsettings));
                    var pagingph = [];

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
                    $scope.change();
                });

                $scope.$on('update-template', function () {
                    $scope.change();
                    $scope.$emit('template-updated');
                });

                $scope.change = function (async) {
                    var appliedTemplate = $scope.processTemplate();
                    $scope.state.query.datasource.service.data = appliedTemplate.data;
                    $scope.state.query.datasource.service.params = appliedTemplate.params;
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
                presets: '='
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
                presets: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-q-postproc.html'),
            controller: function ($scope) {
            }
        };
    })