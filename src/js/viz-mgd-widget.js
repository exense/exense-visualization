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

                    $scope.generalThicknessOffset = 100;

                    //Local Defaults in case nothing provided (designed to fil 4 reduced dashlets on standard)    
                    if (!$scope.headersheightinput) {
                        $scope.headersheight = $element[0].getBoundingClientRect().top;
                        //console.log($element[0].getBoundingClientRect().top);
                        //console.log($element[0].offsetTop);
                    } else {
                        $scope.headersheight = $scope.headersheightinput;
                    }

                    if (!$scope.charttocontainerinput) {
                        $scope.charttocontainer = 25;
                    } else {
                        $scope.charttocontainer = $scope.charttocontainerinput;
                    }

                    var sHeight = window.innerHeight;
                    $scope.chartHeightSmall = (sHeight - $scope.headersheight - $scope.generalThicknessOffset) / 2 - $scope.charttocontainer;
                    $scope.chartHeightBig = (sHeight - $scope.headersheight- $scope.generalThicknessOffset) / 1 - $scope.charttocontainer;
                    $scope.chartWidthSmall = 0;
                    $scope.chartWidthBig = 0;
                    $scope.innerContainerHeightSmall = (sHeight - $scope.headersheight - $scope.generalThicknessOffset) / 2;
                    $scope.innerContainerHeightBig = (sHeight - $scope.headersheight - $scope.generalThicknessOffset) / 1;
                    $scope.innerContainerWidthSmall = 0;
                    $scope.innerContainerWidthBig = 0;
                };

                $scope.getActualDashletWidth = function () {
                    return $element[0].children[0].children[0].offsetWidth;
                }

                $scope.updateSize = function () {
                    $scope.computeHeights();
                    var newWidth = 0.9 * $scope.getActualDashletWidth();
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

                    $scope.state.savedHeight = $scope.state.options.innercontainer.height;
                };

                $scope.startup = function () {
                    if (!$scope.state.options.innercontainer.height || $scope.state.options.innercontainer.height === 0) {
                        $(document).ready(function () {
                            $scope.resize();
                        });
                    } else {
                        //console.log('[' + $scope.widgetid + ']' + $scope.state.options.innercontainer.height + '; ' + $scope.headersheight);
                    }

                    $scope.state.savedHeight = $scope.state.options.innercontainer.height;
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
                }

                $scope.collapse = function () {
                    $scope.saveDimensions();

                    $scope.state.options.innercontainer.height = 30;
                };

                $scope.restore = function () {
                    $scope.state.options.innercontainer.height = $scope.state.savedHeight;
                };

                $scope.resize = function () {
                    $scope.updateSize();
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