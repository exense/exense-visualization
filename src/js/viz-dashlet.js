var vizDashletscripts = document.getElementsByTagName("script")
var vizDashletcurrentScriptPath = vizDashletscripts[vizDashletscripts.length - 1].src;

angular.module('viz-dashlet', ['viz-query'])
    .directive('vizDashlet', function () {
        return {
            restrict: 'E',
            scope: {
                options: '=',
                state: '='
            },
            templateUrl: vizDashletcurrentScriptPath.replace('/js/', '/templates/').replace('viz-dashlet.js', 'viz-dashlet.html') + '?who=viz-dashlet&anticache=' + getUniqueId(),
            controller: function ($scope, $element) {

                $scope.redraw = 'drawn';
                $scope.dashlettabstate = $scope.state.tabindex;
                console.log($scope.state)
                console.log($scope.state.shared.options)
                $scope.saveState = function () {
                    $scope.state.tabindex = $scope.dashlettabstate;
                };

                $scope.$on('autorefresh-toggle',function(event, arg){
                    $scope.$broadcast('child-autorefresh-toggle', arg);
                });
            }
        };
    });