registerScript();

angular.module('viz-dashboard-manager', ['viz-dashboard', 'ui.bootstrap', 'dashletcomssrv'])   
.directive('vizDashboardManager', function () {
        return {
            restrict: 'E',
            scope: {
                presets: '=',
                dashboards: '=',
                displaymode: '='
            },
            templateUrl: resolveTemplateURL('viz-dashboard.js', 'viz-dashboard-manager.html'),
            controller: function ($scope, dashletcomssrv) {
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

                $scope.registerTermination = function(dashboardid){
                    $scope.$on('d-terminated-' + dashboardid, function () {
                        console.log('[m]received terminated event from: [d:' + dashboardid + ']. Effectively removing dashboard');
                        $scope.dwrap.removeById(dashboardid);
                    });
                };

                $scope.removeDashboard = function(dashboardid) {
                    //If the currently opened tab is killed
                    if ($scope.mgrtabstate === dashboardid) {
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
                    console.log('[m]sending termination event to: [d:'+dashboardid+']');
                    $scope.$broadcast('d-terminate-'+dashboardid);
                };

                $scope.$on('dashboard-new', function (event, arg) {
                    var newdashboardid = $scope.dwrap.addNew(new DefaultDashboard([]));
                    console.log('[m] adding dashboard: ['+newdashboardid+']');
                    $scope.registerTermination(newdashboardid);
                    $scope.mgrtabstate = $scope.dwrap.getId($scope.dwrap.getByIndex($scope.dwrap.count() - 1));
                });

                $scope.$on('dashboard-clear', function () {
                    var didList = [];
                    $.each($scope.dwrap.getAsArray(), function (idx, value) {
                        didList.push(value.oid);
                    });
                    $.each(didList, function (idx, value) {
                        console.log('[m] sending termination event to: [d:' + value + ']');
                        $scope.removeDashboard(value);
                    });

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