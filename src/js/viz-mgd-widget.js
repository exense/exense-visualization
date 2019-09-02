var vizMgdWidgetscripts = document.getElementsByTagName("script")
var vizMgdWidgetcurrentScriptPath = vizMgdWidgetscripts[vizMgdWidgetscripts.length-1].src;

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
            templateUrl: vizMgdWidgetcurrentScriptPath.replace('/js/', '/templates/').replace('viz-mgd-widget.js', 'viz-mgd-widget.html'),
            controller: function ($scope) {
                $scope.currentstate = JSON.parse(JSON.stringify($scope.state));
            }
        };
    });