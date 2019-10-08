registerScript();

angular.module('viz', ['viz-dashboard-manager'])
    .directive('viz', function () {
        return {
            restrict: 'E',
            scope: {},
            templateUrl: resolveTemplateURL('viz.js', 'viz.html'),
            controller: function ($scope) {
                $scope.staticPresetsInstance = new StaticPresets();
                $scope.dashboardsendpoint = [
                    new DefaultDashboard([new DefaultWidget()]),
                    new DefaultExplorationDashboard()
                ];

                $scope.$on('top.dashboard-new', function (event, arg) {
                    $scope.$broadcast('dashboard-new', arg);
                });
                $scope.$on('top.dashboard-clear', function () {
                    $scope.$broadcast('dashboard-clear');
                });

                $scope.$on('top.dashboard-current-addWidget', function () {
                    $scope.$broadcast('dashboard-current-addWidget');
                });
                $scope.$on('top.dashboard-current-clearWidgets', function () {
                    $scope.$broadcast('dashboard-current-clearWidgets');
                });
                $scope.$on('dashlet-save', function (event, arg) {
                    $scope.dashboardsendpoint.push(new DefaultDashboard([new Widget(getUniqueId(), new DefaultWidgetState(), arg.state)]));
                });
            }
        };
    });