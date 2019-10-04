registerScript();

angular.module('viz', ['viz-dashboard-manager'])
    .directive('viz', function () {
        return {
            restrict: 'E',
            scope: {},
            templateUrl: resolveTemplateURL('viz.js', 'viz.html'),
            controller: function ($scope) {
                $scope.staticPresetsInstance = new StaticPresets();
                $scope.dashboardsendpoint = [new DefaultDashboard([new DefaultWidget()])];

                $scope.$on('top.dashboard-new', function () {
                    $scope.$broadcast('dashboard-new');
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
            }
        };
    });