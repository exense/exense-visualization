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
            controller: function ($scope, $element) {
                $scope.currentstate = JSON.parse(JSON.stringify($scope.state));
                
                $scope.getActualDashletWidth = function(){
                    return $element[0].offsetWidth;
                }

                //TODO: this will be done once per dashlet in every dashboard
                // we must find a way to run this only once
                // from whichever dashlet exists in the dashboard 
                $(window).on('resize', function () {
                    //console.log('[resize] new dashlet size:' + $element[0].offsetWidth);
                    $scope.$emit('global-resize', { newsize: 0.8 * $scope.getActualDashletWidth() });
                });
            }
        };
    });