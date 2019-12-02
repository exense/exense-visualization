registerScript();

angular.module('viz-dashboard', ['viz-mgd-widget', 'ui.bootstrap', 'dashletcomssrv'])
    .directive('vizDashboard', function () {
        return {
            restrict: 'E',
            scope: {
                dashboardid: '=',
                dstate: '=',
                displaymode: '=',
                displaytype: '=',
                presets: '=',
                topmargin: '=',
                restprefix: '='
            },
            templateUrl: resolveTemplateURL('viz-dashboard.js', 'viz-dashboard.html'),
            controller: function ($scope, $element) {
                $scope.toggleAutorefresh = function () {
                    $scope.dstate.globalsettings.autorefresh = !$scope.dstate.globalsettings.autorefresh;
                    $scope.$broadcast('globalsettings-refreshToggle', { 'new': $scope.dstate.globalsettings.autorefresh })
                };

                $scope.toggleChevron = function () {
                    $scope.dstate.globalsettings.chevron = !$scope.dstate.globalsettings.chevron;
                };

                $scope.$on('mgdwidget-remove', function (event, arg) {
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
                        $scope.addWidget(arg);
                    }
                });

                $scope.$on('apply-global-setting', function (event, arg) {
                    var updated = false;
                    $.each($scope.dstate.globalsettings.placeholders, function (index, item) {
                        if (item.key === arg.key) {
                            $scope.dstate.globalsettings.placeholders[index].value = arg.value;
                            $scope.dstate.globalsettings.placeholders[index].isDynamic = arg.isDynamic;
                            updated = true;
                        }
                    });
                    if (!updated) {
                        $scope.dstate.globalsettings.placeholders.push(new Placeholder(arg.key, arg.value, arg.isDynamic));
                    }
                    $(document).ready(function () {
                        $scope.$broadcast('fireQueryDependingOnContext');
                    });
                });

                $scope.$on('globalsettings-globalRefreshToggle', function (event, arg) {
                    $scope.toggleAutorefresh();
                });

                $scope.addWidget = function (arg) {
                    var widget;
                    if (!arg) {
                        widget = new DefaultWidget();
                    }
                    var newWidgetId = $scope.wwrap.addNew(widget);
                    //console.log('[d:' + $scope.dashboardid + '] adding widget: [' + newWidgetId + ']');
                };

                $(window).on('resize', function () {
                    $scope.$broadcast('resize-widget');
                });

                $scope.onstartup = function () {
                    $scope.wwrap = new IdIndexArray($scope.dstate.widgets);
                    $scope.gsautorefreshInterval = null;

                    $scope.initAuto = false;
                    $scope.$on('dashletinput-ready', function () {
                        if (!$scope.initAuto) {
                            $scope.initAuto = true;
                            if ($scope.dstate.globalsettings.autorefresh) {
                                //for compatibility with toggle..
                                $scope.dstate.globalsettings.autorefresh = false;
                                $scope.toggleAutorefresh();
                            }

                            $scope.$emit('dashboard-ready');
                        }
                    });
                }

                $scope.onstartup();

                $scope.$watchCollection('dstate.widgets', function (newvalue) {
                    $scope.onstartup();
                });
            }
        };
    })

