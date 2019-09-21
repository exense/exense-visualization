registerScript();

angular.module('viz-dashboard-manager', ['viz-dashboard', 'ui.bootstrap'])   
.directive('vizDashboardManager', function () {
        return {
            restrict: 'E',
            scope: {
                presets: '=',
                dashboards: '='
            },
            templateUrl: resolveTemplateURL('viz-dashboard.js', 'viz-dashboard-manager.html'),
            controller: function ($scope) {
                $scope.dwrap = new IdIndexArray($scope.dashboards, function(oid){
                    //console.log('[dashboards] removing ' + oid);
                    $scope.dwrap.getById(oid).widgets.removeAll();
                });

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
                    $scope.dwrap.addNew(new DefaultDashboard([]));
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