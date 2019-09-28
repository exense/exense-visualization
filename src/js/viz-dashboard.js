registerScript();

angular.module('viz-dashboard', ['viz-mgd-widget', 'ui.bootstrap', 'dashletcomssrv'])
    .directive('vizDashboard', function () {
        return {
            restrict: 'E',
            scope: {
                dashboard: '=',
                dashboardid: '=',
                presets: '=',
                mgrstate: '='
            },
            templateUrl: resolveTemplateURL('viz-dashboard.js', 'viz-dashboard.html'),
            controller: function ($scope, dashletcomssrv) {

                $scope.wwrap = $scope.dashboard.widgets;

                // load time case
                if ($scope.mgrstate.globalsettingsautorefresh) {
                    $scope.toggleAutorefresh();
                }

                $scope.toggleAutorefresh = function () {
                    $scope.mgrstate.globalsettingsautorefresh = !$scope.mgrstate.globalsettingsautorefresh;
                    if ($scope.mgrstate.globalsettingsautorefresh) {
                        $scope.addInterval();
                    } else {
                        $scope.removeInterval();
                    }
                    $scope.$broadcast('globalsettings-refreshToggle', { 'new': $scope.mgrstate.globalsettingsautorefresh })
                };

                $scope.addInterval = function () {
                    $scope.mgrstate.gsautorefreshInterval = setInterval(function () {
                        $scope.$broadcast('globalsettings-change', { 'collection': $scope.mgrstate.globalsettings, async: true });
                    }, setIntervalDefault);
                }

                $scope.removeInterval = function () {
                    clearInterval($scope.mgrstate.gsautorefreshInterval);
                }

                $scope.$on('key-val-collection-change-Global Settings', function (event, arg) {
                    arg.async = false;
                    $scope.$broadcast('globalsettings-change', arg);
                });

                // Should not be necessary, just "cache locally" in component until GSettingd change
                // and make sure that GSettings are sent via ready/go events upon loading the components
                /*
                $scope.$on('templateph-loaded', function () {
                    $scope.$broadcast('globalsettings-change', { 'collection': $scope.mgrstate.globalsettings });
                });
                */
               
                $scope.toggleChevron = function () {
                    $scope.mgrstate.globalsettingschevron = !$scope.mgrstate.globalsettingschevron;
                };

                $scope.$on('mgdwidget-reduce', function (event, arg) {
                    var widget = $scope.wwrap.getById(arg.wid);
                    widget.widgetWidth = 'col-md-6';
                    var options = widget.state.shared.options;
                    options.chart.height = $scope.chartHeightSmall;
                    options.chart.width = $scope.chartWidthSmall;
                    options.innercontainer.height = $scope.innerContainerHeightSmall;
                    options.innercontainer.width = $scope.innerContainerWidthSmall;
                });
                $scope.$on('mgdwidget-extend', function (event, arg) {
                    var widget = $scope.wwrap.getById(arg.wid);
                    widget.widgetWidth = 'col-md-12';
                    var options = widget.state.shared.options;
                    options.chart.height = $scope.chartHeightBig;
                    options.chart.width = $scope.chartWidthBig;
                    options.innercontainer.height = $scope.innerContainerHeightBig;
                    options.innercontainer.width = $scope.innerContainerWidthBig;
                });
                $scope.$on('mgdwidget-remove', function (event, arg) {
                    dashletcomssrv.unregisterWidget(arg.wid);
                    $scope.wwrap.removeById(arg.wid);
                });
                $scope.$on('mgdwidget-moveLeft', function (event, arg) {
                    var widgetIndex = $scope.wwrap.getIndexById(arg.wid);
                    if (widgetIndex > 0) {
                        $scope.wwrap.moveFromToIndex(widgetIndex, widgetIndex - 1);
                    }
                });
                $scope.$on('mgdwidget-moveRight', function (event, arg) {
                    var widgetIndex = $scope.wwrap.getIndexById(arg.wid);
                    if (widgetIndex < $scope.wwrap.count() - 1) {
                        $scope.wwrap.moveFromToIndex(widgetIndex, widgetIndex + 1);
                    }
                });
                $scope.$on('mgdwidget-duplicate', function (event, arg) {
                    $scope.wwrap.duplicateById(arg.wid);
                });

                $scope.$on('clearwidgets', function (event, arg) {
                    if ($scope.dashboardid === arg.dashboardid) {
                        $scope.wwrap.clear();
                    }
                });

                $scope.$on('addwidget', function (event, arg) {
                    if ($scope.dashboardid === arg.dashboardid) {
                        var newWidgetId = $scope.wwrap.addNew(new DefaultWidget($scope.presets, $scope.chartHeightSmall, $scope.chartWidthSmall, $scope.innerContainerHeightSmall, $scope.innerContainerWidthSmall));
                    }
                });

                $scope.computeHeights = function () {
                    var sHeight = window.innerHeight;

                    // parameterize via arguments or server-originating conf & promise?
                    $scope.headersHeight = 250;
                    $scope.chartToContainer = 35;
                    // $scope.chartHeightSmall = 250;

                    $scope.chartHeightSmall = (sHeight - $scope.headersHeight) / 2 - $scope.chartToContainer;
                    $scope.chartHeightBig = sHeight - ($scope.headersHeight - 80) - $scope.chartToContainer;
                    $scope.chartWidthSmall = 0;
                    $scope.chartWidthBig = 0;
                    $scope.innerContainerHeightSmall = (sHeight - $scope.headersHeight) / 2;
                    $scope.innerContainerHeightBig = sHeight - ($scope.headersHeight - 80);
                    $scope.innerContainerWidthSmall = 0;
                    $scope.innerContainerWidthBig = 0;
                };

                $scope.computeHeights();

                $scope.$on('single-resize', function (event, arg) {
                    $(document).ready(function () {
                        $scope.updateSingleChartSize(arg.wid, arg.newsize);
                    });

                });

                $scope.updateSingleChartSize = function (wId, newWidth) {

                    //should only be done once at manager level
                    $scope.computeHeights();
                    var widget = $scope.wwrap.getById(wId);
                    var options = widget.state.shared.options;
                    options.chart.width = newWidth;
                    options.innercontainer.width = newWidth - 50;

                    if (widget.widgetWidth === 'col-md-6') {
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

                $scope.$emit('dashboard-ready');
            }
        };
    })

