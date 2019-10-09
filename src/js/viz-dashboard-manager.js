registerScript();

angular.module('viz-dashboard-manager', ['viz-dashboard', 'ui.bootstrap', 'dashletcomssrv'])
    .directive('vizDashboardManager', function () {
        return {
            restrict: 'E',
            scope: {
                presets: '=',
                dashboards: '=',
                displaymode: '=',
                headermargin: '='
            },
            templateUrl: resolveTemplateURL('viz-dashboard.js', 'viz-dashboard-manager.html'),
            controller: function ($scope, $element) {
                if (!$scope.headermargin) {
                    $scope.topmargin = $element[0].getBoundingClientRect().top;
                }else{
                    $scope.topmargin = $scope.headermargin;
                }
                $scope.init = false;

                $scope.selectTab = function (tabIndex) {
                    $scope.mgrtabstate = tabIndex;
                };

                $scope.isTabActive = function (tabIndex) {
                    return tabIndex === $scope.mgrtabstate;
                };

                $scope.removeDashboard = function (dashboardid) {
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
                    $scope.dwrap.removeById(dashboardid);
                };

                $scope.$on('dashboard-new', function (event, arg) {
                    var newdashboardid;
                    if (arg.displaytype === 'exploded') {
                        newdashboardid = $scope.dwrap.addNew(new DefaultExplorationDashboard());
                    } else {
                        newdashboardid = $scope.dwrap.addNew(new DefaultDashboard());
                    }
                    $scope.mgrtabstate = newdashboardid;
                });

                $scope.$on('dashboard-clear', function () {
                    $scope.dwrap.clear();
                });

                $scope.$on('dashboard-current-addWidget', function () {
                    //$scope.$broadcast('addwidget', { dashboardid: $scope.mgrtabstate });
                    $scope.dwrap.getById($scope.mgrtabstate).widgets.addNew();
                });

                $scope.$on('dashboard-current-clearWidgets', function () {
                    $scope.$broadcast('clearwidgets', { dashboardid: $scope.mgrtabstate });
                });

                //multiplexing multiple events
                $scope.$on('dashletinput-initialized', function () {
                    if (!$scope.init) {
                        $scope.init = true;
                        //$scope.$broadcast('resize-widget');
                        $scope.$emit('manager-fully-loaded');
                    }
                });

                $scope.$on('dashlet-copy', function (event, arg) {
                    $scope.clipboard = arg;
                });

                $scope.$on('dashlet-paste', function (event) {
                    if ($scope.clipboard) {
                        var newwidget = new Widget(getUniqueId(), new DefaultWidgetState(), jsoncopy($scope.clipboard.state));
                        var dashboard = $scope.dwrap.getById($scope.mgrtabstate);
                        var wwrap = new IdIndexArray(dashboard.dstate.widgets);
                        wwrap.addNew(newwidget);
                    }
                });

                $scope.onstartup = function () {
                    $scope.dwrap = new IdIndexArray($scope.dashboards);
                    if ($scope.dashboards.length > 0 && $scope.dashboards[0] && $scope.dashboards[0].oid) {
                        $scope.mgrtabstate = $scope.dashboards[0].oid;
                    }
                    $scope.$emit('manager-ready');
                }

                $scope.onstartup();

                $scope.$watch('dashboards', function (newvalue) {
                    $scope.onstartup();
                });

                $scope.$watch('displaymode', function (newvalue) {
                    $scope.$broadcast('resize-widget');
                });
            }
        };
    })