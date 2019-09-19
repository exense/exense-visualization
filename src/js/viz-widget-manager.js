registerScript();

angular.module('viz-widget-manager', ['wmservice', 'viz-mgd-widget', 'ui.bootstrap'])
    .directive('vizDashboardManager', function (wmservice) {
        return {
            restrict: 'E',
            scope: {
                presets: '=',
            },
            templateUrl: resolveTemplateURL('viz-widget-manager.js', 'viz-dashboard-manager.html'),
            controller: function ($scope, wmservice) {

                $scope.dashboards = wmservice.dashboards;

                $scope.$on('dashboard-reload', function () {
                    $scope.dashboards = wmservice.dashboards;
                });

                // default tab (1st)
                if (wmservice.dashboards.length > 0) {
                    $scope.mgrtabstate = wmservice.dashboards[0].dashboardid;
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
                        if (wmservice.getDashboardIndex($scope.mgrtabstate) > 0) {
                            var previous = wmservice.dashboards[wmservice.getDashboardIndex($scope.mgrtabstate) - 1].dashboardid;
                            $scope.mgrtabstate = previous;
                            $scope.savedState = $scope.mgrtabstate;
                        } else {// if has next, open next
                            if (wmservice.getDashboardIndex($scope.mgrtabstate) < wmservice.dashboards.length - 1) {
                                var next = wmservice.dashboards[wmservice.getDashboardIndex($scope.mgrtabstate) + 1].dashboardid;
                                $scope.mgrtabstate = next;
                                $scope.savedState = $scope.mgrtabstate;
                            }
                        }
                    }
                    wmservice.removetDashboardById(arg);
                });

                // todo: bind to config
                $scope.saveState = function () {
                    $scope.savedState = $scope.mgrtabstate;
                };

                $scope.$on('single-resize', function (event, arg) {
                    $(document).ready(function () {
                        wmservice.updateSingleChartSize(arg.did, arg.wid, arg.newsize);
                    });

                });

                $scope.$on('dashboard-new', function (event, arg) {
                    wmservice.addDashboard();
                    //Not needed anymore since reimplemented uib-tab
                    //$(document).ready(function () {
                    $scope.mgrtabstate = $scope.dashboards[$scope.dashboards.length - 1].dashboardid;
                    //});
                });

                $scope.$on('dashboard-clear', function () {
                    wmservice.clearDashboards();
                });
                $scope.$on('dashboard-current-addWidget', function () {
                    wmservice.addWidget($scope.mgrtabstate, $scope.presets);
                });
                $scope.$on('dashboard-current-clearWidgets', function () {
                    wmservice.clearWidgets($scope.mgrtabstate);
                });

                $scope.$emit('dashboard-ready');
            }
        };
    })
    .directive('vizWidgetManager', function () {
        return {
            restrict: 'E',
            scope: {
                dashboard: '=',
                presets: '=',
                mgrstate: '='
            },
            templateUrl: resolveTemplateURL('viz-widget-manager.js', 'viz-widget-manager.html'),
            controller: function ($scope, wmservice) {

                $scope.widgets = $scope.dashboard.widgets;

                $scope.$on('key-val-collection-change-Global Settings', function(event, arg){
                    $scope.$broadcast('globalsettings-change', arg);
                });

                $scope.$on('templatePhChange', function(event, arg){
                    $scope.$broadcast('globalsettings-change', { 'collection' : $scope.mgrstate.globalsettings});
                });

                $scope.toggleChevron = function () {
                    $scope.mgrstate.globalsettingschevron = !$scope.mgrstate.globalsettingschevron;
                };

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

                //wmservice.addWidget($scope.dashboard.dashboardid, $scope.presets);
            }
        };
    })

