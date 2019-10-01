registerScript();

angular.module('viz-mgd-widget', ['viz-dashlet'])

    .directive('vizMgdWidget', function () {
        return {
            restrict: 'E',
            scope: {
                displaymode: '=',
                widgetid: '=',
                wstate: '=',
                state: '=',
                headersheight: '=',
                charttocontainer: '=',
                presets: '='
            },
            templateUrl: resolveTemplateURL('viz-mgd-widget.js', 'viz-mgd-widget.html'),
            controller: function ($scope, $element) {

                $scope.currentstate = JSON.parse(JSON.stringify($scope.state));
                $scope.state.chevron = true;
                $scope.state.savedHeight = $scope.state.options.innercontainer.height;
                $scope.state.options.innercontainer.offset = 50;
                $scope.dashlettitle = $scope.state.title;

                $scope.toggleChevron = function () {
                    if ($scope.state.chevron) {
                        $scope.collapse();
                    } else {
                        $scope.restore();
                    }
                    $scope.state.chevron = !$scope.state.chevron;
                };

                $scope.collapse = function () {
                    $scope.state.savedHeight = $scope.state.options.innercontainer.height;
                    $scope.state.savedOffset = $scope.state.options.innercontainer.offset;
                    $scope.state.options.innercontainer.height = 30;
                    $scope.state.options.innercontainer.offset = 0;
                };

                $scope.restore = function () {
                    $scope.state.options.innercontainer.height = $scope.state.savedHeight;
                    $scope.state.options.innercontainer.offset = $scope.state.savedOffset;
                };

                $scope.$on('dashlettitle-change', function (event, arg) {
                    $scope.dashlettitle = arg.newValue;
                });

                $scope.getActualDashletWidth = function () {
                    return $element[0].children[0].children[0].offsetWidth;
                }

                $scope.updateSize = function (newWidth) {

                    //should only be done once at manager level
                    $scope.computeHeights();
                    var options = $scope.state.options;
                    options.chart.width = newWidth;
                    options.innercontainer.width = newWidth - 50;

                    if ($scope.wstate.widgetwidth === 'col-md-6') {
                        options.chart.height = $scope.chartHeightSmall;
                        options.innercontainer.height = $scope.innerContainerHeightSmall;
                    }
                    else {
                        options.chart.height = $scope.chartHeightBig;
                        options.innercontainer.height = $scope.innerContainerHeightBig;
                    }
                    $scope.forceRedraw();
                };

                $scope.forceRedraw = function () {
                    //force new angular digest
                    $scope.$apply(function () {
                        self.value = 0;
                    });
                };

                $scope.computeHeights = function () {
                    var sHeight = window.innerHeight;

                    $scope.chartHeightSmall = (sHeight - $scope.headersheight) / 2 - $scope.charttocontainer;
                    $scope.chartHeightBig = sHeight - ($scope.headersheight - 80) - $scope.charttocontainer;
                    $scope.chartWidthSmall = 0;
                    $scope.chartWidthBig = 0;
                    $scope.innerContainerHeightSmall = (sHeight - $scope.headersheight) / 2;
                    $scope.innerContainerHeightBig = sHeight - ($scope.headersheight - 80);
                    $scope.innerContainerWidthSmall = 0;
                    $scope.innerContainerWidthBig = 0;
                };

                $scope.computeHeights();

                $scope.$on('resize-widget', function () {
                    $scope.resize();
                });

                $scope.resize = function () {
                    $(document).ready(function () {
                        $scope.updateSize(0.8 * $scope.getActualDashletWidth());
                    });
                };

                $scope.extend = function () {
                    $scope.wstate.widgetwidth = 'col-md-12';
                    var options = $scope.state.options;
                    options.chart.height = $scope.chartHeightBig;
                    options.chart.width = $scope.chartWidthBig;
                    options.innercontainer.height = $scope.innerContainerHeightBig;
                    options.innercontainer.width = $scope.innerContainerWidthBig;

                    // still need to wait for document ready?!
                    $(document).ready(function () {
                        $scope.resize();
                    });
                };

                $scope.reduce = function () {
                    $scope.wstate.widgetwidth = 'col-md-6';
                    var options = $scope.state.options;
                    options.chart.height = $scope.chartHeightSmall;
                    options.chart.width = $scope.chartWidthSmall;
                    options.innercontainer.height = $scope.innerContainerHeightSmall;
                    options.innercontainer.width = $scope.innerContainerWidthSmall;

                    // still need to wait for document ready?!
                    $(document).ready(function () {
                        $scope.resize();
                    });
                };

                $scope.removeWidget = function () {
                    $scope.$emit('mgdwidget-remove', { wid: $scope.widgetid });
                }

                $(document).ready(function () {
                    $scope.resize();
                });
            }
        };
    });