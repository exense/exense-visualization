angular.module('viz-mgd-widget', ['viz-dashlet'])

    .directive('vizMgdWidget', function () {
        return {
            restric: 'E',
            scope: {
                data: '=',
                options: '=',
                widgetwidth: '=',
                widgetid: '=',
                state: '='
            },
            templateUrl: 'src/templates/viz-mgd-widget.html',
            controller: function ($scope) {
                $scope.currentstate = JSON.parse(JSON.stringify($scope.state));

                console.log('vizMgdWidget controller fired.')
            }
        };
    })


    .directive('vizMgdWidgetContent', function () {
        return {
            restric: 'E',
            scope: {
                data: '=',
                options: '=',
                widgetwidth: '=',
                widgetid: '=',
                state: '='
            },
            templateUrl: 'src/templates/viz-mgd-widget-content.html',
            controller: function ($scope) {

                $scope.reduceWidget = function (wId) {
                    $scope.$parent.$parent.$parent.$parent.reduceWidget(wId);
                };

                $scope.extendWidget = function (wId) {
                    $scope.$parent.$parent.$parent.$parent.extendWidget(wId);
                };

                $scope.removeWidget = function (wId) {
                    $scope.$parent.$parent.$parent.$parent.removeWidget(wId);
                };

                console.log('vizDashletContent controller fired.');
            }
        };
    });

