registerScript();

angular.module('viz-mgd-widget', ['viz-dashlet'])

    .directive('vizMgdWidget', function () {
        return {
            restrict: 'E',
            scope: {
                options: '=',
                widgetwidth: '=',
                widgetid: '=',
                state: '='
            },
            templateUrl: resolveTemplateURL('viz-mgd-widget.js', 'viz-mgd-widget.html'),
            controller: function ($scope, $element) {
                $scope.currentstate = JSON.parse(JSON.stringify($scope.state));
                $scope.state.shared.chevron = true;
                $scope.state.shared.savedHeight = $scope.state.shared.options.innercontainer.height;
                $scope.state.shared.options.innercontainer.offset = 50;
                $scope.dashlettitle = $scope.state.title;

                $scope.toggleChevron = function () {
                    if ($scope.state.shared.chevron) {
                        $scope.collapse();
                    } else {
                        $scope.restore();
                    }
                    $scope.state.shared.chevron = !$scope.state.shared.chevron;
                };

                $scope.collapse = function () {
                    $scope.state.shared.savedHeight = $scope.state.shared.options.innercontainer.height;
                    $scope.state.shared.savedOffset = $scope.state.shared.options.innercontainer.offset;
                    $scope.state.shared.options.innercontainer.height = 30;
                    $scope.state.shared.options.innercontainer.offset = 0;
                };

                $scope.restore = function () {
                    $scope.state.shared.options.innercontainer.height = $scope.state.shared.savedHeight;
                    $scope.state.shared.options.innercontainer.offset = $scope.state.shared.savedOffset;
                };

                $scope.$on('dashlettitle-change', function (event, arg) {
                    $scope.dashlettitle = arg.newValue;
                });

                $scope.getActualDashletWidth = function () {
                    return $element[0].children[0].children[0].offsetWidth;
                }

                //TODO: this will be done once per dashlet in every dashboard
                // we must find a way to run this only once
                // from whichever dashlet exists in the dashboard 
                $(window).on('resize', function () {
                    $scope.resizeSingle();
                });

                $scope.resizeSingle = function () {
                    $scope.$emit('single-resize', {wid: $scope.widgetid, newsize: 0.8 * $scope.getActualDashletWidth() });
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