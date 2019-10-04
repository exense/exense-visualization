registerScript();

angular.module('explore', ['viz-dashlet'])
    .directive('explore', function () {
        return {
            restrict: 'E',
            scope: {},
            templateUrl: resolveTemplateURL('explore.js', 'explore.html'),
            controller: function ($scope) {
                $scope.state = new ExplorationDashletState();
                $scope.presets = new StaticPresets();

                $scope.resize = function () {
                    $scope.state.options.chart.height = window.innerHeight / 3;
                };

                $(window).on('resize', function () {
                    $scope.resize();
                    $scope.$apply(function () {
                        self.value = 0;
                    });
                });


                $scope.resize();
            }
        };
    });