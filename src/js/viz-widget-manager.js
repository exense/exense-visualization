var vizWidgetManagerscripts = document.getElementsByTagName("script")
var vizWidgetManagercurrentScriptPath = vizWidgetManagerscripts[vizWidgetManagerscripts.length - 1].src;

angular.module('viz-widget-manager', ['wmservice', 'viz-mgd-widget', 'ui.bootstrap'])
    .directive('vizDashboardManager', function () {
        return {
            restrict: 'E',
            scope: {
                presets: '=',
            },
            templateUrl: vizWidgetManagercurrentScriptPath.replace('/js/', '/templates/').replace('viz-widget-manager.js', 'viz-dashboard-manager.html') + '?who=viz-dashboard-manager&anticache=' + getUniqueId(),
            controller: function ($scope, wmservice) {

                $scope.dashboards = wmservice.dashboards;

                $scope.$on('dashboard-remove', function(did){
                    wmservice.removeDashboardById(did);
                });

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
                presets: '='
            },
            templateUrl: vizWidgetManagercurrentScriptPath.replace('/js/', '/templates/').replace('viz-widget-manager.js', 'viz-widget-manager.html') + '?who=viz-widget-manager&anticache=' + getUniqueId(),
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

                // for testing
                //wmservice.addWidget($scope.dashboard.dashboardid, $scope.presets);
            }
        };
    })

