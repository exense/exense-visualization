angular.module('viz-mgd-widget', ['viz-dashlet'])

    .directive('vizMgdWidget', function () {
        return {
            restric: 'E',
            scope: {
                options: '=',
                widgetwidth: '=',
                widgetid: '=',
                state: '='
            },
            templateUrl: 'src/templates/viz-mgd-widget.html',
            controller: function ($scope) {
                $scope.currentstate = JSON.parse(JSON.stringify($scope.state));

                console.log('vizMgdWidget controller fired.')

                $scope.reduceWidget = function (wId) {
                    $scope.$parent.$parent.reduceWidget(wId);
                };

                $scope.extendWidget = function (wId) {
                    $scope.$parent.$parent.extendWidget(wId);
                };

                $scope.removeWidget = function (wId) {
                    $scope.$parent.$parent.removeWidget(wId);
                };
            }
        };
    });