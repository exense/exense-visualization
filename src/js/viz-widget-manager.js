var vizWidgetManagerscripts = document.getElementsByTagName("script")
var vizWidgetManagercurrentScriptPath = vizWidgetManagerscripts[vizWidgetManagerscripts.length - 1].src;

angular.module('viz-widget-manager', ['viz-mgd-widget'])
    .factory('wmservice', function () {

        var wmservice = {};
        wmservice.dashboards = [];

        // parameterize via arguments or server-originating conf & promise?
        wmservice.chartHeightSmall = 235;
        wmservice.chartHeightBig = 485;
        wmservice.chartWidthSmall = 490;
        wmservice.chartWidthBig = 990;
        wmservice.innerContainerHeightSmall = 240;
        wmservice.innerContainerHeightBig = 490;
        wmservice.innerContainerWidthSmall = 495;
        wmservice.innerContainerWidthBig = 995;

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
            wmservice.dashboards = [];
        };

        wmservice.clearWidgets = function (dId) {
            wmservice.getDashboardById(dId).widgets = [];
        };

        wmservice.getWidget = function (dId, wId) {
            var dWidgets = wmservice.getDashboardById(dId).widgets;
            console.log(dId)
            console.log(dWidgets)
            for (i = 0; i < dWidgets.length; i++) {
                if (dWidgets[i].widgetId === wId) {
                    return dWidgets[i];
                }
            }
            return null;
        };

        wmservice.extendWidget = function (dId, wId) {
            var widget = wmservice.getWidget(dId, wId);
            widget.widgetWidth = 'col-md-12';
            widget.options.chart.height = wmservice.chartHeightBig;
            widget.options.chart.width = wmservice.chartWidthBig;
            widget.options.innercontainer.height = wmservice.innerContainerHeightBig;
            widget.options.innercontainer.width = wmservice.innerContainerWidthBig;
        };

        wmservice.reduceWidget = function (wId) {
            var widget = wmservice.getWidget(dId, wId);
            widget.widgetWidth = 'col-md-6';
            widget.options.chart.height = wmservice.chartHeightSmall;
            widget.options.chart.width = wmservice.chartWidthSmall;
            widget.options.innercontainer.height = wmservice.innerContainerHeightSmall;
            widget.options.innercontainer.width = wmservice.innerContainerWidthSmall;
        };

        wmservice.getNewId = function () {
            return Math.random().toString(36).substr(2, 9);
        };

        wmservice.addWidget = function (dId) {
            wId = wmservice.getNewId();

            widget = {
                widgetId: wId,
                widgetWidth: 'col-md-6',
                defstate: {
                    tabindex: 0,
                    initialquery: {
                        type: 'Simple',
                        url: '/mock_data1.json',
                        method: 'post',
                        data: 'nothing'
                        ,
                        dataaccess: 'data.payload',
                        keyaccess: 'begin',
                        valueaccess: 'value'
                    },
                    data: [],
                    presets: [
                        {
                            name: 'RTM Measurements',
                            inputtype: 'Raw',
                            query: {
                                type: 'Simple',
                                data: '{"selectors1":[{"textFilters":[{"key":"eId","value":"5d67ce7e48322f000b931026","regex":"false"}],"numericalFilters":[]}],"serviceParams":{"measurementService.nextFactor":"0","aggregateService.sessionId":"defaultSid","aggregateService.granularity":"auto","aggregateService.groupby":"name","aggregateService.cpu":"1","aggregateService.partition":"8","aggregateService.timeout":"600"}}}'
                            }
                        },
                        {
                            name: 'empty preset'
                        }
                    ]
                },
                options: new DefaultOptions(wmservice.chartHeightSmall, wmservice.chartWidthSmall, wmservice.innerContainerHeightSmall, wmservice.innerContainerWidthSmall),
                title: {
                    enable: true,
                    text: 'Title for Line Chart'
                },
            };

            // initialize every new dashboard with a first basic widget
            wmservice.getDashboardById(dId).widgets.push(widget);
        };

        wmservice.removeWidget = function (dId, wId) {
            var dWidgets = wmservice.getDashboardById(dId).widgets;

            for (i = 0; i < dWidgets.length; i++) {
                if (dWidgets[i].widgetId === wId)
                    dWidgets.splice(i, i + 1);
            }
        };

        wmservice.getWidgetIndex = function (dId, wId) {
            return wmservice.getObjectIndexFromArray(wmservice.getDashboardById(dId), 'widgetId', wId);
        }

        wmservice.getDashboardIndex = function (dId) {
            return wmservice.getObjectIndexFromArray(wmservice.dashboards, 'dashboardid', dId);
        }

        wmservice.getDashboardById = function (dId) {
            return wmservice.dashboards[wmservice.getDashboardIndex(dId)];
        }

        wmservice.getObjectIndexFromArray = function (array, oIdKey, oId) {
            for (i = 0; i < array.length; i++) {
                if (array[i][oIdKey] === oId)
                    return i;
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
            dWidgets.splice(new_index, 0, wmservice.widgets.splice(old_index, 1)[0]);
        };

        wmservice.moveWidgetLeft = function (dId, wId) {
            var widgetIndex = wmservice.getWidgetIndex(dId, wId);

            if (widgetIndex > 0) {
                wmservice.moveWidget(dId, widgetIndex, widgetIndex - 1);
            }
        };

        wmservice.moveWidgetRight = function (wId) {
            var widgetIndex = wmservice.getWidgetIndex(dId, wId);
            wmservice.moveWidget(dId, widgetIndex, widgetIndex + 1);
        };

        wmservice.duplicateWidget = function (dId, wId) {
            var copy = wmservice.getWidgetCopy(dId, wId);
            wmservice.getDashboardById(dId).widgets.push(copy);
            wmservice.moveWidget(wmservice.getWidgetIndex(dId, copy.widgetId), wmservice.getWidgetIndex(dId, wId + 1));
        };

        wmservice.getWidgetCopy = function (dId, wId) {
            var copy = JSON.parse(JSON.stringify(wmservice.getWidget(dId, wId)));
            copy.widgetId = wmservice.getNewId();
            return copy;
        };

        return wmservice;
    })
    .directive('vizDashboardManager', function () {
        return {
            restric: 'E',
            scope: {
            },
            templateUrl: vizWidgetManagercurrentScriptPath.replace('/js/', '/templates/').replace('viz-widget-manager.js', 'viz-dashboard-manager.html'),
            controller: function ($scope, wmservice) {
                $scope.dashboards = wmservice.dashboards;
                $scope.current = wmservice.addDashboard();

                $scope.$on('dashboard-new', function (event, arg) {
                    wmservice.addDashboard();
                });
                $scope.$on('dashboard-clear', function (event, arg) {
                    wmservice.clearDashboards();
                });
                $scope.$on('dashboard-current-addWidget', function (event, arg) {
                    wmservice.getDashboardById($scope.current).addWidget($scope.current);
                });
                $scope.$on('dashboard-current-clearWidgets', function (event, arg) {
                    wmservice.getDashboardById($scope.current).clearWidgets();
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
            restric: 'E',
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
                    wmservice.extendWidget($scope.dashboard.dashboardid,arg.wid);
                });
                $scope.$on('mgdwidget-remove', function (event, arg) {
                    wmservice.removeWidget($scope.dashboard.dashboardid,arg.wid);
                });
                $scope.$on('mgdwidget-moveLeft', function (event, arg) {
                    wmservice.moveWidgetLeft($scope.dashboard.dashboardid,arg.wid);
                });
                $scope.$on('mgdwidget-moveRight', function (event, arg) {
                    wmservice.moveWidgetRight($scope.dashboard.dashboardid,arg.wid);
                });
                $scope.$on('mgdwidget-duplicate', function (event, arg) {
                    wmservice.duplicateWidget($scope.dashboard.dashboardid,arg.wid);
                });
                $scope.$on('mgdwidget-refresh', function (event, arg) {
                    //not implemented yet
                });

                wmservice.addWidget($scope.dashboard.dashboardid);
            }
        };
    })

