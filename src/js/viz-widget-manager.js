var vizWidgetManagerscripts = document.getElementsByTagName("script")
var vizWidgetManagercurrentScriptPath = vizWidgetManagerscripts[vizWidgetManagerscripts.length - 1].src;

angular.module('viz-widget-manager', ['viz-mgd-widget', 'ui.bootstrap'])
    .factory('wmservice', function ($rootScope) {

        var wmservice = { shared: {} };
        wmservice.dashboards = [];

        // parameterize via arguments or server-originating conf & promise?
        wmservice.chartHeightSmall = 210;
        wmservice.chartHeightBig = 460;
        wmservice.chartWidthSmall = 0;
        wmservice.chartWidthBig = 0;
        wmservice.innerContainerHeightSmall = 240;
        wmservice.innerContainerHeightBig = 490;
        wmservice.innerContainerWidthSmall = 0;
        wmservice.innerContainerWidthBig = 0;

        wmservice.forceRedraw = function () {
            //force new angular digest
            $rootScope.$apply(function () {
                self.value = 0;
            });
        };

        wmservice.getNewId = function () {
            return Math.random().toString(36).substr(2, 9);
        };

        wmservice.addDashboard = function () {
            var dId = wmservice.getNewId();
            wmservice.dashboards.push({
                title: 'New dashboard',
                widgets: [],
                dashboardid: dId
            });
            return dId;
        };

        wmservice.clearDashboards = function () {
            wmservice.dashboards.length = 0;
        };

        wmservice.clearWidgets = function (dId) {
            wmservice.getDashboardById(dId).widgets.length = 0;
        };

        wmservice.getWidget = function (dId, wId) {
            var dWidgets = wmservice.getDashboardById(dId).widgets;

            for (i = 0; i < dWidgets.length; i++) {
                if (dWidgets[i].widgetId === wId) {
                    return dWidgets[i];
                }
            }
            return null;
        };

        wmservice.updateChartsSize = function (newWidth) {
            for (i = 0; i < wmservice.dashboards.length; i++) {
                var curDashboard = wmservice.dashboards[i];
                for (j = 0; j < curDashboard.widgets.length; j++) {
                    var curWidget = curDashboard.widgets[j];
                    var old = curWidget.options.chart.width;
                    curWidget.options.chart.width = newWidth;
                    curWidget.options.innercontainer.width = newWidth - 50;
                    //console.log('['+curDashboard.dashboardid+':'+curWidget.widgetId +'] : changed from ' + old + ' to '+curWidget.options.chart.width);
                }
            }

            wmservice.forceRedraw();
        };

        wmservice.updateSingleChartSize = function (dId, wId, newWidth) {
            var widget = wmservice.getWidget(dId, wId);
            widget.options.chart.width = newWidth;
            widget.options.innercontainer.width = newWidth - 50;
            wmservice.forceRedraw();
        };

        wmservice.extendWidget = function (dId, wId) {
            var widget = wmservice.getWidget(dId, wId);
            widget.widgetWidth = 'col-md-12';
            widget.options.chart.height = wmservice.chartHeightBig;
            widget.options.chart.width = wmservice.chartWidthBig;
            widget.options.innercontainer.height = wmservice.innerContainerHeightBig;
            widget.options.innercontainer.width = wmservice.innerContainerWidthBig;
        };

        wmservice.reduceWidget = function (dId, wId) {
            var widget = wmservice.getWidget(dId, wId);
            widget.widgetWidth = 'col-md-6';
            widget.options.chart.height = wmservice.chartHeightSmall;
            widget.options.chart.width = wmservice.chartWidthSmall;
            widget.options.innercontainer.height = wmservice.innerContainerHeightSmall;
            widget.options.innercontainer.width = wmservice.innerContainerWidthSmall;
        };

        wmservice.addWidget = function (dId, initPresets) {
            wId = wmservice.getNewId();

            wmservice.shared.options = new DefaultChartOptions(wmservice.chartHeightSmall, wmservice.chartWidthSmall, wmservice.innerContainerHeightSmall, wmservice.innerContainerWidthSmall, 'lineChart');

            widget = {
                widgetId: wId,
                widgetWidth: 'col-md-6',
                options: wmservice.shared.options,
                title: {
                    enable: true,
                    text: 'Title for Line Chart'
                },
                defstate: {
                    tabindex: 0,
                    data: {
                        asyncraw: {},
                        raw: {},
                        chartData: [],
                        tableData: [],
                        savedData: {}
                    },
                    shared: wmservice.shared,
                    init: {
                        config: {
                            autorefresh: 'Off'
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
                        },
                        view: {}
                    },
                    presets: initPresets
                }
            };

            // initialize every new dashboard with a first basic widget
            wmservice.getDashboardById(dId).widgets.push(widget);
        };

        wmservice.removeWidget = function (dId, wId) {
            var dWidgets = wmservice.getDashboardById(dId).widgets;

            for (i = 0; i < dWidgets.length; i++) {
                if (dWidgets[i].widgetId === wId) {
                    dWidgets.splice(i, 1);
                }
            }
        };

        wmservice.getWidgetIndex = function (dId, wId) {
            return wmservice.getObjectIndexFromArray(wmservice.getDashboardById(dId).widgets, 'widgetId', wId);
        }

        wmservice.getDashboardIndex = function (dId) {
            return wmservice.getObjectIndexFromArray(wmservice.dashboards, 'dashboardid', dId);
        }

        wmservice.getDashboardById = function (dId) {
            return wmservice.dashboards[wmservice.getDashboardIndex(dId)];
        }

        wmservice.getObjectIndexFromArray = function (array, oIdKey, oId) {
            for (i = 0; i < array.length; i++) {
                if (array[i][oIdKey] === oId) {
                    return i;
                }
            }
        }

        wmservice.moveWidget = function (dId, old_index, new_index) {
            var dWidgets = wmservice.getDashboardById(dId).widgets;

            if (new_index >= dWidgets.length) {
                var k = new_index - dWidgets.length + 1;
                while (k--) {
                    arr.push(undefined);
                }
            }
            dWidgets.splice(new_index, 0, dWidgets.splice(old_index, 1)[0]);
        };

        wmservice.moveWidgetLeft = function (dId, wId) {
            var widgetIndex = wmservice.getWidgetIndex(dId, wId);

            if (widgetIndex > 0) {
                wmservice.moveWidget(dId, widgetIndex, widgetIndex - 1);
            }
        };

        wmservice.moveWidgetRight = function (dId, wId) {
            var widgetIndex = wmservice.getWidgetIndex(dId, wId);
            wmservice.moveWidget(dId, widgetIndex, widgetIndex + 1);

        };

        wmservice.duplicateWidget = function (dId, wId) {
            var copy = wmservice.getWidgetCopy(dId, wId);
            wmservice.getDashboardById(dId).widgets.push(copy);
            wmservice.moveWidget(dId, wmservice.getWidgetIndex(dId, copy.widgetId), wmservice.getWidgetIndex(dId, wId) + 1);
        };

        wmservice.getWidgetCopy = function (dId, wId) {
            var copy = JSON.parse(JSON.stringify(wmservice.getWidget(dId, wId)));
            copy.widgetId = wmservice.getNewId();
            return copy;
        };

        // initializing with one dashboard
        wmservice.addDashboard();

        return wmservice;
    })
    .directive('vizDashboardManager', function () {
        return {
            restrict: 'E',
            scope: {
                presets: '=',
            },
            templateUrl: vizWidgetManagercurrentScriptPath.replace('/js/', '/templates/').replace('viz-widget-manager.js', 'viz-dashboard-manager.html'),
            controller: function ($scope, wmservice) {

                $scope.dashboards = wmservice.dashboards;

                // todo: bind to config
                $scope.saveState = function () {
                    $scope.savedState = $scope.mgrtabstate;
                };

                $scope.$on('global-resize', function (event, arg) {
                    $(document).ready(function () {
                        wmservice.updateChartsSize(arg.newsize);
                    });

                });

                $scope.$on('single-resize', function (event, arg) {
                    $(document).ready(function () {
                        wmservice.updateSingleChartSize(arg.did, arg.wid, arg.newsize);
                    });

                });

                $scope.$on('dashboard-new', function (event, arg) {
                    wmservice.addDashboard();
                    $(document).ready(function () {
                        $scope.mgrtabstate = $scope.dashboards[$scope.dashboards.length - 1].dashboardid;
                    });
                });

                $scope.$on('dashboard-clear', function (event, arg) {
                    wmservice.clearDashboards();
                });
                $scope.$on('dashboard-current-addWidget', function (event, arg) {
                    wmservice.addWidget($scope.mgrtabstate, $scope.presets);
                });
                $scope.$on('dashboard-current-clearWidgets', function (event, arg) {
                    wmservice.clearWidgets($scope.mgrtabstate);
                });
                $scope.$on('dashboard-save', function (event, arg) {
                    //not yet implemented
                });
                $scope.$on('dashboard-load', function (event, arg) {
                    //not yet implemented
                });
                $scope.$on('dashboard-configure', function (event, arg) {
                    //not yet implemented
                });
                $scope.$on('docs', function (event, arg) {
                    //not yet implemented
                });
            }
        };
    })
    .directive('vizWidgetManager', function () {
        return {
            restrict: 'E',
            scope: {
                dashboard: '='
            },
            templateUrl: vizWidgetManagercurrentScriptPath.replace('/js/', '/templates/').replace('viz-widget-manager.js', 'viz-widget-manager.html'),
            controller: function ($scope, wmservice) {

                $scope.widgets = $scope.dashboard.widgets;

                $scope.$on('mgdwidget-reduce', function (event, arg) {
                    wmservice.reduceWidget($scope.dashboard.dashboardid, arg.wid);
                });
                $scope.$on('mgdwidget-extend', function (event, arg) {
                    wmservice.extendWidget($scope.dashboard.dashboardid, arg.wid);
                });
                $scope.$on('mgdwidget-remove', function (event, arg) {
                    wmservice.removeWidget($scope.dashboard.dashboardid, arg.wid);
                });
                $scope.$on('mgdwidget-moveLeft', function (event, arg) {
                    wmservice.moveWidgetLeft($scope.dashboard.dashboardid, arg.wid);
                });
                $scope.$on('mgdwidget-moveRight', function (event, arg) {
                    wmservice.moveWidgetRight($scope.dashboard.dashboardid, arg.wid);
                });
                $scope.$on('mgdwidget-duplicate', function (event, arg) {
                    wmservice.duplicateWidget($scope.dashboard.dashboardid, arg.wid);
                });
                $scope.$on('mgdwidget-refresh', function (event, arg) {
                    //not implemented yet
                });

                wmservice.addWidget($scope.dashboard.dashboardid, $scope.presets);
            }
        };
    })

