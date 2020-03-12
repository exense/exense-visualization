registerScript();

angular.module('rtm', ['viz-dashboard-manager'])
    .directive('rtm', function () {
        return {
            restrict: 'E',
            scope: {},
            templateUrl: resolveTemplateURL('rtm.js', 'rtm.html'),
            controller: function ($scope) {
                $scope.staticPresetsInstance = new StaticPresets();
                $scope.dashboardsendpoint = [new RTMDashboard()];
            }
        };
    });