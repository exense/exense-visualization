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
                headersheightinput: '=',
                charttocontainerinput: '=',
                presets: '='
            },
            templateUrl: resolveTemplateURL('viz-mgd-widget.js', 'viz-mgd-widget.html'),
            controller: function ($scope, $element) {

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
                };

                $scope.startup = function () {
                    //Local Defaults in case nothing provided (designed to fil 4 reduced dashlets on standard)    
                    if (!$scope.headersheightinput) {
                        $scope.headersheight = window.innerHeight / 4 + 30;
                    } else {
                        $scope.headersheight = $scope.headersheightinput;
                    }

                    if (!$scope.charttocontainerinput) {
                        $scope.charttocontainer = 35;
                    } else {
                        $scope.charttocontainer = $scope.charttocontainerinput;
                    }

                    $scope.updateSize(0.8 * $scope.getActualDashletWidth());

                    $scope.state.savedHeight = $scope.state.options.innercontainer.height;
                    $scope.state.options.innercontainer.offset = 50;
                    $scope.dashlettitle = $scope.state.title;
                };

                $scope.startup();

                $scope.toggleAutorefresh = function () {
                    $scope.wstate.autorefresh = !$scope.wstate.autorefresh;
                    $scope.$broadcast('globalsettings-refreshToggle', { 'new': $scope.wstate.autorefresh });
                };

                $scope.toggleChevron = function () {
                    if ($scope.wstate.chevron) {
                        $scope.collapse();
                    } else {
                        $scope.restore();
                    }
                    $scope.wstate.chevron = !$scope.wstate.chevron;
                };

                $scope.saveDimensions = function () {
                    $scope.state.savedHeight = $scope.state.options.innercontainer.height;
                    $scope.state.savedOffset = $scope.state.options.innercontainer.offset;
                }

                $scope.collapse = function () {
                    $scope.saveDimensions();

                    $scope.state.options.innercontainer.height = 30;
                    $scope.state.options.innercontainer.offset = 0;
                };

                $scope.restore = function () {
                    $scope.state.options.innercontainer.height = $scope.state.savedHeight;
                    $scope.state.options.innercontainer.offset = $scope.state.savedOffset;
                };

                $scope.resize = function () {
                    $scope.updateSize(0.8 * $scope.getActualDashletWidth());
                    forceRedraw($scope);
                };

                $scope.extend = function () {
                    $scope.wstate.widgetwidth = 'col-md-12';
                    $(document).ready(function () {
                        $scope.resize();
                    });
                };

                $scope.reduce = function () {
                    $scope.wstate.widgetwidth = 'col-md-6';
                    $(document).ready(function () {
                        $scope.resize();
                    });
                };

                $scope.removeWidget = function () {
                    $scope.$emit('mgdwidget-remove', { wid: $scope.widgetid });
                }

                $scope.$on('resize-widget', function () {
                    $scope.resize();
                });

                $scope.$on('dashlettitle-change', function (event, arg) {
                    $scope.dashlettitle = arg.newValue;
                });
            }
        };
    });