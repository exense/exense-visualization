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
            controller: function ($scope) {
                $scope.dwrap = new IdIndexArray($scope.dashboards);

                // default tab (1st)
                if ($scope.dashboards.length > 0 && $scope.dashboards[0] && $scope.dashboards[0].oid) {
                    $scope.mgrtabstate = $scope.dashboards[0].oid;
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
                        } else {// if has next, open next
                            if ($scope.dwrap.getIndexById($scope.mgrtabstate) < $scope.dwrap.count() - 1) {
                                $scope.mgrtabstate = $scope.dwrap.getNextId($scope.mgrtabstate);
                            } else {
                                // Empty session
                                $scope.mgrtabstate = null;
                            }
                        }
                    }
                    $scope.dwrap.removeById(arg);
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
                    $scope.mgrtabstate = $scope.dwrap.getId($scope.dwrap.getByIndex($scope.dwrap.count() - 1));
                });

                $scope.$on('dashboard-clear', function () {
                    $scope.dwrap.clear();
                });

                $scope.$on('dashboard-current-addWidget', function () {
                    $scope.$broadcast('addwidget', { dashboardid: $scope.mgrtabstate });
                });
                $scope.$on('dashboard-current-clearWidgets', function () {
                    $scope.$broadcast('clearwidgets', { dashboardid: $scope.mgrtabstate });
                });


                $scope.$emit('manager-ready');
            }
        };
    })
    .directive('vizDashboard', function () {
        return {
            restrict: 'E',
            scope: {
                dashboard: '=',
                dashboardid: '=',
                presets: '=',
                mgrstate: '='
            },
            templateUrl: resolveTemplateURL('viz-dashboard.js', 'viz-dashboard.html'),
            controller: function ($scope) {

                $scope.wwrap = new IdIndexArray($scope.dashboard.widgets);

                // load time case
                if ($scope.mgrstate.globalsettingsautorefresh) {
                    $scope.toggleAutorefresh();
                }

                $scope.toggleAutorefresh = function () {
                    $scope.mgrstate.globalsettingsautorefresh = !$scope.mgrstate.globalsettingsautorefresh;
                    if ($scope.mgrstate.globalsettingsautorefresh) {
                        $scope.addInterval();
                    } else {
                        $scope.removeInterval();
                    }
                    $scope.$broadcast('globalsettings-refreshToggle', { 'new': $scope.mgrstate.globalsettingsautorefresh })
                };

                $scope.addInterval = function () {
                    $scope.mgrstate.gsautorefreshInterval = setInterval(function () {
                        $scope.$broadcast('globalsettings-change', { 'collection': $scope.mgrstate.globalsettings, async: true });
                    }, setIntervalDefault);
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
                    var widget = $scope.wwrap.getById(arg.wid);
                    widget.widgetWidth = 'col-md-6';
                    var options = widget.state.shared.options;
                    options.chart.height = $scope.chartHeightSmall;
                    options.chart.width = $scope.chartWidthSmall;
                    options.innercontainer.height = $scope.innerContainerHeightSmall;
                    options.innercontainer.width = $scope.innerContainerWidthSmall;
                });
                $scope.$on('mgdwidget-extend', function (event, arg) {
                    var widget = $scope.wwrap.getById(arg.wid);
                    widget.widgetWidth = 'col-md-12';
                    var options = widget.state.shared.options;
                    options.chart.height = $scope.chartHeightBig;
                    options.chart.width = $scope.chartWidthBig;
                    options.innercontainer.height = $scope.innerContainerHeightBig;
                    options.innercontainer.width = $scope.innerContainerWidthBig;
                });
                $scope.$on('mgdwidget-remove', function (event, arg) {
                    $scope.wwrap.removeById(arg.wid);
                });
                $scope.$on('mgdwidget-moveLeft', function (event, arg) {
                    var widgetIndex = $scope.wwrap.getIndexById(arg.wid);
                    if (widgetIndex > 0) {
                        $scope.wwrap.moveFromToIndex(widgetIndex, widgetIndex - 1);
                    }
                });
                $scope.$on('mgdwidget-moveRight', function (event, arg) {
                    var widgetIndex = $scope.wwrap.getIndexById(arg.wid);
                    if (widgetIndex < $scope.wwrap.count() - 1) {
                        $scope.wwrap.moveFromToIndex(widgetIndex, widgetIndex + 1);
                    }
                });
                $scope.$on('mgdwidget-duplicate', function (event, arg) {
                    $scope.wwrap.dupplicateById(arg.wid);
                });

                $scope.$on('clearwidgets', function (event, arg) {
                    if ($scope.dashboardid === arg.dashboardid) {
                        $scope.wwrap.clear();
                    }
                });

                $scope.$on('addwidget', function (event, arg) {
                    if ($scope.dashboardid === arg.dashboardid) {
                        $scope.wwrap.addNew({
                            widgetWidth: 'col-md-6',
                            title: 'Dashlet title',
                            state: {
                                tabindex: 0,
                                data: {
                                    transformed: [],
                                    state: {}
                                },
                                shared: {
                                    presets: $scope.presets,
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
                        });
                    }
                });

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

                $scope.$on('single-resize', function (event, arg) {
                    $(document).ready(function () {
                        $scope.updateSingleChartSize(arg.wid, arg.newsize);
                    });

                });

                $scope.updateSingleChartSize = function (wId, newWidth) {

                    //should only be done once at manager level
                    $scope.computeHeights();
                    var widget = $scope.wwrap.getById(wId);
                    var options = widget.state.shared.options;
                    options.chart.width = newWidth;
                    options.innercontainer.width = newWidth - 50;

                    if (widget.widgetWidth === 'col-md-6') {
                        options.chart.height = $scope.chartHeightSmall;
                        options.innercontainer.height = $scope.innerContainerHeightSmall;
                    }
                    else {
                        options.chart.height = $scope.chartHeightBig;
                        options.innercontainer.height = $scope.innerContainerHeightBig;
                    }
                    $scope.forceRedraw();
                };

                $scope.forceRedraw = function () {
                    //force new angular digest
                    $scope.$apply(function () {
                        self.value = 0;
                    });
                };

                $scope.$emit('dashboard-ready');
            }
        };
    })

