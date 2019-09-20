registerScript();

angular.module('viz-dashboard', ['viz-mgd-widget', 'ui.bootstrap'])
    .directive('vizDashboardManager', function () {
        return {
            restrict: 'E',
            scope: {
                presets: '=',
                dashboards: '='
            },
            templateUrl: resolveTemplateURL('viz-dashboard.js', 'viz-dashboard-manager.html'),
            controller: function ($scope, $rootScope) {

                $scope.dashboardidkey = 'dashboardid';
                $scope.dwrap = new IdIndexArray($scope.dashboards, $scope.dashboardidkey);

                // use to be wmservice    
                $scope.computeHeights = function () {
                    var sHeight = window.innerHeight;

                    // parameterize via arguments or server-originating conf & promise?
                    $scope.headersHeight = 250;
                    $scope.chartToContainer = 15;
                    // $scope.chartHeightSmall = 250;

                    $scope.chartHeightSmall = (sHeight - $scope.headersHeight) / 2 - $scope.chartToContainer;
                    $scope.chartHeightBig = sHeight - ($scope.headersHeight - 80) - $scope.chartToContainer;
                    $scope.chartWidthSmall = 0;
                    $scope.chartWidthBig = 0;
                    $scope.innerContainerHeightSmall = (sHeight - $scope.headersHeight) / 2;
                    $scope.innerContainerHeightBig = sHeight - ($scope.headersHeight - 80);
                    $scope.innerContainerWidthSmall = 0;
                    $scope.innerContainerWidthBig = 0;
                };

                $scope.computeHeights();

                $scope.forceRedraw = function () {
                    //force new angular digest
                    $rootScope.$apply(function () {
                        self.value = 0;
                    });
                };

                $scope.clearDashboards = function () {
                    $scope.dashboards.length = 0;
                };

                $scope.clearWidgets = function (dId) {
                    $scope.dwrap.getById(dId).widgets.length = 0;
                };

                $scope.getWidget = function (dId, wId) {
                    var dWidgets = $scope.dwrap.getById(dId).widgets;

                    for (i = 0; i < dWidgets.length; i++) {
                        if (dWidgets[i].widgetId === wId) {
                            return dWidgets[i];
                        }
                    }
                    return null;
                };

                $scope.updateSingleChartSize = function (dId, wId, newWidth) {

                    //should only be done once at manager level
                    $scope.computeHeights();

                    var widget = $scope.getWidget(dId, wId);
                    widget.state.shared.options.chart.width = newWidth;
                    widget.state.shared.options.innercontainer.width = newWidth - 50;

                    if (widget.widgetWidth === 'col-md-6') {
                        widget.state.shared.options.chart.height = $scope.chartHeightSmall;
                        widget.state.shared.options.innercontainer.height = $scope.innerContainerHeightSmall;
                    }
                    else {
                        widget.state.shared.options.chart.height = $scope.chartHeightBig;
                        widget.state.shared.options.innercontainer.height = $scope.innerContainerHeightBig;
                    }
                    $scope.forceRedraw();
                };

                $scope.extendWidget = function (dId, wId) {
                    var widget = $scope.getWidget(dId, wId);
                    widget.widgetWidth = 'col-md-12';
                    widget.state.shared.options.chart.height = $scope.chartHeightBig;
                    widget.state.shared.options.chart.width = $scope.chartWidthBig;
                    widget.state.shared.options.innercontainer.height = $scope.innerContainerHeightBig;
                    widget.state.shared.options.innercontainer.width = $scope.innerContainerWidthBig;
                };

                $scope.reduceWidget = function (dId, wId) {
                    var widget = $scope.getWidget(dId, wId);
                    widget.widgetWidth = 'col-md-6';
                    widget.state.shared.options.chart.height = $scope.chartHeightSmall;
                    widget.state.shared.options.chart.width = $scope.chartWidthSmall;
                    widget.state.shared.options.innercontainer.height = $scope.innerContainerHeightSmall;
                    widget.state.shared.options.innercontainer.width = $scope.innerContainerWidthSmall;
                };

                $scope.addWidget = function (dId, presets) {

                    wId = getUniqueId();

                    widget = {
                        widgetId: wId,
                        widgetWidth: 'col-md-6',
                        title: 'Dashlet title',
                        state: {
                            tabindex: 0,
                            data: {
                                transformed: [],
                                state: {}
                            },
                            shared: {
                                presets: presets,
                                options: new DefaultChartOptions($scope.chartHeightSmall, $scope.chartWidthSmall, $scope.innerContainerHeightSmall, $scope.innerContainerWidthSmall,
                                    'lineChart'),
                                config: {
                                    autorefresh: 'Off',
                                    barchevron: true
                                },
                                global: {},
                                http: {}
                            },
                            query: {
                                inputtype: "Raw",
                                type: "Simple",
                                datasource: {
                                    service: {
                                        method: "Get",
                                        controls: {}
                                    }
                                }
                            }
                        }
                    };

                    // initialize every new dashboard with a first basic widget
                    $scope.dwrap.getById(dId).widgets.push(widget);
                };

                $scope.removeWidget = function (dId, wId) {
                    var dWidgets = $scope.dwrap.getById(dId).widgets;

                    for (i = 0; i < dWidgets.length; i++) {
                        if (dWidgets[i].widgetId === wId) {
                            dWidgets.splice(i, 1);
                        }
                    }
                };

                $scope.getWidgetIndex = function (dId, wId) {
                    return $scope.getObjectIndexFromArray($scope.dwrap.getById(dId).widgets, 'widgetId', wId);
                }

                $scope.getObjectIndexFromArray = function (array, oIdKey, oId) {
                    for (i = 0; i < array.length; i++) {
                        if (array[i][oIdKey] === oId) {
                            return i;
                        }
                    }
                }

                $scope.moveWidget = function (dId, old_index, new_index) {
                    var dWidgets = $scope.dwrap.getById(dId).widgets;

                    if (new_index >= dWidgets.length) {
                        var k = new_index - dWidgets.length + 1;
                        while (k--) {
                            arr.push(undefined);
                        }
                    }
                    dWidgets.splice(new_index, 0, dWidgets.splice(old_index, 1)[0]);
                };

                $scope.moveWidgetLeft = function (dId, wId) {
                    var widgetIndex = $scope.getWidgetIndex(dId, wId);

                    if (widgetIndex > 0) {
                        $scope.moveWidget(dId, widgetIndex, widgetIndex - 1);
                    }
                };

                $scope.moveWidgetRight = function (dId, wId) {
                    var widgetIndex = $scope.getWidgetIndex(dId, wId);
                    $scope.moveWidget(dId, widgetIndex, widgetIndex + 1);

                };

                $scope.duplicateWidget = function (dId, wId) {
                    var copy = $scope.getWidgetCopy(dId, wId);
                    $scope.dwrap.getById(dId).widgets.push(copy);
                    $scope.moveWidget(dId, $scope.getWidgetIndex(dId, copy.widgetId), $scope.getWidgetIndex(dId, wId) + 1);
                };

                $scope.getWidgetCopy = function (dId, wId) {
                    var copy = JSON.parse(JSON.stringify($scope.getWidget(dId, wId)));
                    copy.widgetId = getUniqueId();
                    return copy;
                };


                // dashboard manager specific part

                // default tab (1st)
                if ($scope.dashboards.length > 0 && $scope.dashboards[0] && $scope.dashboards[0].dashboardid) {
                    $scope.mgrtabstate = $scope.dashboards[0].dashboardid;
                }

                $scope.selectTab = function (tabIndex) {
                    $scope.mgrtabstate = tabIndex;
                };

                $scope.isTabActive = function (tabIndex) {
                    return tabIndex === $scope.mgrtabstate;
                };

                $scope.$on('removeDashboard', function (event, arg) {
                    //If the currently opened tab is killed
                    if ($scope.mgrtabstate === arg) {
                        // if has previous, open previous
                        if ($scope.dwrap.getIndexById($scope.mgrtabstate) > 0) {
                            $scope.mgrtabstate = $scope.dwrap.getPreviousId($scope.mgrtabstate);
                            $scope.savedState = $scope.mgrtabstate;
                        } else {// if has next, open next
                            if ($scope.dwrap.getIndexById($scope.mgrtabstate) < $scope.dwrap.count() - 1) {
                                $scope.mgrtabstate = $scope.dwrap.getNextId($scope.mgrtabstate);
                                $scope.savedState = $scope.mgrtabstate;
                            }else{
                                // Empty session
                                $scope.mgrtabstate = null;
                            }
                        }
                    }
                    $scope.dwrap.removeById(arg);
                });

                // todo: bind to config
                $scope.saveState = function () {
                    $scope.savedState = $scope.mgrtabstate;
                };

                $scope.$on('single-resize', function (event, arg) {
                    $(document).ready(function () {
                        $scope.updateSingleChartSize(arg.did, arg.wid, arg.newsize);
                    });

                });

                $scope.$on('dashboard-new', function (event, arg) {
                    $scope.dwrap.addNew({
                        title: 'New dashboard',
                        widgets: [],
                        mgrstate: {
                            globalsettings: [{ "key": "__eId__", "value": "??", "isDynamic": false }],
                            globalsettingsname: 'Global Settings',
                            globalsettingschevron: false,
                            globalsettingsautorefresh: false
                        }
                    });
                    //Not needed anymore since reimplemented uib-tab
                    //$(document).ready(function () {
                    $scope.mgrtabstate = $scope.dashboards[$scope.dashboards.length - 1].dashboardid;
                    //});
                });

                $scope.$on('dashboard-clear', function () {
                    $scope.dwrap.clear();
                });
                $scope.$on('dashboard-current-addWidget', function () {
                    $scope.addWidget($scope.mgrtabstate, $scope.presets);
                });
                $scope.$on('dashboard-current-clearWidgets', function () {
                    $scope.clearWidgets($scope.mgrtabstate);
                });




                $scope.$on('mgdwidget-reduce-d', function (event, arg) {
                    $scope.reduceWidget(arg.dashboardid, arg.wid);
                });
                $scope.$on('mgdwidget-extend-d', function (event, arg) {
                    $scope.extendWidget(arg.dashboardid, arg.wid);
                });
                $scope.$on('mgdwidget-remove-d', function (event, arg) {
                    $scope.removeWidget(arg.dashboardid, arg.wid);
                });
                $scope.$on('mgdwidget-moveLeft-d', function (event, arg) {
                    $scope.moveWidgetLeft(arg.dashboardid, arg.wid);
                });
                $scope.$on('mgdwidget-moveRight-d', function (event, arg) {
                    $scope.moveWidgetRight(arg.dashboardid, arg.wid);
                });
                $scope.$on('mgdwidget-duplicate-d', function (event, arg) {
                    $scope.duplicateWidget(arg.dashboardid, arg.wid);
                });
                $scope.$on('mgdwidget-refresh-d', function (event, arg) {
                    //not implemented yet
                });



                $scope.$emit('dashboard-ready');
            }
        };
    })
    .directive('vizDashboard', function () {
        return {
            restrict: 'E',
            scope: {
                dashboard: '=',
                presets: '=',
                mgrstate: '='
            },
            templateUrl: resolveTemplateURL('viz-dashboard.js', 'viz-dashboard.html'),
            controller: function ($scope) {

                // load time case
                if($scope.mgrstate.globalsettingsautorefresh){
                    $scope.toggleAutorefresh();
                }

                $scope.toggleAutorefresh = function () {
                    $scope.mgrstate.globalsettingsautorefresh = !$scope.mgrstate.globalsettingsautorefresh;
                    if($scope.mgrstate.globalsettingsautorefresh){
                        $scope.addInterval();
                    }else{
                        $scope.removeInterval();
                    }
                    $scope.$broadcast('globalsettings-refreshToggle', { 'new': $scope.mgrstate.globalsettingsautorefresh })
                };

                $scope.addInterval = function () {
                    $scope.mgrstate.gsautorefreshInterval = setInterval(function () {
                        $scope.$broadcast('globalsettings-change', { 'collection': $scope.mgrstate.globalsettings, async: true});
                    },setIntervalDefault);
                }

                $scope.removeInterval = function () {
                    clearInterval($scope.mgrstate.gsautorefreshInterval);
                }

                $scope.$on('key-val-collection-change-Global Settings', function (event, arg) {
                    arg.async = false;
                    $scope.$broadcast('globalsettings-change', arg);
                });

                $scope.$on('templateph-loaded', function () {
                    $scope.$broadcast('globalsettings-change', { 'collection': $scope.mgrstate.globalsettings });
                });

                $scope.toggleChevron = function () {
                    $scope.mgrstate.globalsettingschevron = !$scope.mgrstate.globalsettingschevron;
                };

                $scope.$on('mgdwidget-reduce', function (event, arg) {
                    $scope.$emit('mgdwidget-reduce-d', { 'dashboardid': $scope.dashboard.dashboardid, 'wid': arg.wid });
                });
                $scope.$on('mgdwidget-extend', function (event, arg) {
                    $scope.$emit('mgdwidget-extend-d', { 'dashboardid': $scope.dashboard.dashboardid, 'wid': arg.wid });
                });
                $scope.$on('mgdwidget-remove', function (event, arg) {
                    $scope.$emit('mgdwidget-remove-d', { 'dashboardid': $scope.dashboard.dashboardid, 'wid': arg.wid });
                });
                $scope.$on('mgdwidget-moveLeft', function (event, arg) {
                    $scope.$emit('mgdwidget-moveLeft-d', { 'dashboardid': $scope.dashboard.dashboardid, 'wid': arg.wid });
                });
                $scope.$on('mgdwidget-moveRight', function (event, arg) {
                    $scope.$emit('mgdwidget-moveRight-d', { 'dashboardid': $scope.dashboard.dashboardid, 'wid': arg.wid });
                });
                $scope.$on('mgdwidget-duplicate', function (event, arg) {
                    $scope.$emit('mgdwidget-duplicate-d', { 'dashboardid': $scope.dashboard.dashboardid, 'wid': arg.wid });
                });
                $scope.$on('mgdwidget-refresh', function (event, arg) {
                    //not implemented yet
                });

                //$scope.addWidget($scope.dashboard.dashboardid, $scope.presets);
            }
        };
    })
