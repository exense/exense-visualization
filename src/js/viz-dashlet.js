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

                $scope.toggleBarchevronToConf = function(){
                    $scope.state.shared.config.barchevron = !$scope.state.shared.config.barchevron;
                }

                $scope.toggleBarchevronToViz = function(){
                    $scope.$broadcast('child-firequery', {});
                    $scope.state.shared.config.barchevron = !$scope.state.shared.config.barchevron;
                }

                $scope.$on('autorefresh-toggle',function(event, arg){
                    $scope.$broadcast('child-autorefresh-toggle', arg);
                });
                
                $scope.$on('firequery',function(event, arg){
                    $scope.$broadcast('child-firequery', arg);
                });
            }
        };
    });