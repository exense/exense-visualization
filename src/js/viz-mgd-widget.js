var vizMgdWidgetscripts = document.getElementsByTagName("script")
var vizMgdWidgetcurrentScriptPath = vizMgdWidgetscripts[vizMgdWidgetscripts.length - 1].src;

angular.module('viz-mgd-widget', ['viz-dashlet'])

    .directive('vizMgdWidget', function () {
        return {
            restrict: 'E',
            scope: {
                options: '=',
                widgetwidth: '=',
                dashboardid: '=',
                widgetid: '=',
                state: '='
            },
            templateUrl: vizMgdWidgetcurrentScriptPath.replace('/js/', '/templates/').replace('viz-mgd-widget.js', 'viz-mgd-widget.html') + '?who=viz-mgd-widget&anticache=' + getUniqueId(),
            controller: function ($scope, $element) {
                $scope.currentstate = JSON.parse(JSON.stringify($scope.state));
                $scope.chevron = true;
                $scope.dashlettitle = 'Dashlet title';

                $scope.toggleChevron = function(){
                    $scope.chevron = !$scope.chevron;
                };

                $scope.$on('dashlet-title', function (event, arg) {
                    $scope.dashlettitle = arg.newValue;
                });

                $scope.getActualDashletWidth = function () {
                    return $element[0].children[0].children[0].offsetWidth;
                }

                //TODO: this will be done once per dashlet in every dashboard
                // we must find a way to run this only once
                // from whichever dashlet exists in the dashboard 
                $(window).on('resize', function () {
                    $scope.$emit('global-resize', { newsize: 0.8 * $scope.getActualDashletWidth() });
                });

                $scope.resizeSingle = function(){
                    $scope.$emit('single-resize', { did: $scope.dashboardid, wid: $scope.widgetid, newsize: 0.8 * $scope.getActualDashletWidth() });
                };

                $scope.emitExtend = function () {
                    $scope.$emit('mgdwidget-extend', { wid: $scope.widgetid });
                    $(document).ready(function () {
                        $scope.resizeSingle();
                    });
                };

                $scope.emitReduce = function () {
                    $scope.$emit('mgdwidget-reduce', { wid: $scope.widgetid });
                    $(document).ready(function () {
                        $scope.resizeSingle();
                    });
                };

                $(document).ready(function () {
                    $scope.resizeSingle();
                });
            }
        };
    });