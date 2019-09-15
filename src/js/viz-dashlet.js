registerScript();

angular.module('viz-dashlet', ['viz-query'])
    .directive('vizDashlet', function () {
        return {
            restrict: 'E',
            scope: {
                options: '=',
                state: '='
            },
            templateUrl: resolveTemplateURL('viz-dashlet.js', 'viz-dashlet.html'),
            controller: function ($scope, $element) {

                $scope.redraw = 'drawn';

                $scope.toggleBarchevronToConf = function () {
                    $scope.state.shared.config.barchevron = !$scope.state.shared.config.barchevron;
                }

                $scope.toggleBarchevronToViz = function () {
                    $scope.$broadcast('child-firequery', {});
                    $scope.state.shared.config.barchevron = !$scope.state.shared.config.barchevron;
                }

                $scope.$on('autorefresh-toggle', function (event, arg) {
                    $scope.$broadcast('child-autorefresh-toggle', arg);
                });

                $scope.$on('firequery', function (event, arg) {
                    $scope.$broadcast('child-firequery', arg);
                });
            }
        };
    });