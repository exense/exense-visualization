registerScript();

angular.module('viz-dashboard', ['viz-mgd-widget', 'ui.bootstrap', 'dashletcomssrv'])
    .directive('vizDashboard', function () {
        return {
            restrict: 'E',
            scope: {
                dashboard: '=',
                dashboardid: '=',
                displaymode: '=',
                presets: '=',
                mgrstate: '=',
                headersheightinput: '=',
                charttocontainerinput: '='
            },
            templateUrl: resolveTemplateURL('viz-dashboard.js', 'viz-dashboard.html'),
            controller: function ($scope, dashletcomssrv) {

                $scope.wwrap = $scope.dashboard.widgets;

                $scope.gsautorefreshInterval = null;

                $scope.$on('d-terminate-' + $scope.dashboardid, function () {
                    var widList = [];
                    $.each($scope.wwrap.getAsArray(), function (idx, value) {
                        widList.push(value.oid);
                    });
                    $.each(widList, function (idx, value) {
                        console.log('[d:' + $scope.dashboardid + '] sending termination event to: [w:' + value + ']');
                        $scope.$broadcast('w-terminate-' + value);
                    });

                    console.log('emitting:' + 'd-terminated-' + $scope.dashboardid);
                    $scope.$emit('d-terminated-' + $scope.dashboardid);
                });

                $.each($scope.wwrap.getAsArray(), function (idx, value) {
                    $scope.registerTermination(value.oid);
                });

                $scope.registerTermination = function (widgetid) {
                    $scope.$on('w-terminated-' + widgetid, function () {
                        console.log('[d:' + $scope.dashboardid + ']received terminated event from: [w:' + widgetid + ']. Effectively removing widget');
                        $scope.wwrap.removeById(widgetid);
                    });
                };

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

                    var duration = setIntervalDefault;
                    if ($scope.mgrstate.gsautorefreshIntervalDuration) {
                        duration = $scope.mgrstate.gsautorefreshIntervalDuration;
                    }

                    $scope.removeInterval();
                    $scope.gsautorefreshInterval = setInterval(function () {
                        $scope.$broadcast('globalsettings-change', { 'collection': $scope.mgrstate.globalsettings, async: true });
                    }, duration);
                }

                $scope.removeInterval = function () {
                    if ($scope.gsautorefreshInterval) {
                        clearInterval($scope.gsautorefreshInterval);
                    }
                }

                $scope.$on('key-val-collection-change-Global Settings', function (event, arg) {
                    arg.async = false;
                    $scope.$broadcast('globalsettings-change', arg);
                });

                $scope.$on('dashletinput-ready', function () {
                    $scope.$broadcast('globalsettings-change-init', { 'collection': $scope.mgrstate.globalsettings });
                });

                $scope.toggleChevron = function () {
                    $scope.mgrstate.globalsettingschevron = !$scope.mgrstate.globalsettingschevron;
                };

                $scope.$on('mgdwidget-remove', function (event, arg) {
                    $scope.$broadcast('w-terminate-' + arg.wid);
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
                        var newWidgetId = $scope.wwrap.addNew(new DefaultWidget());
                        console.log('[d:' + $scope.dashboardid + '] adding widget: [' + newWidgetId + ']');
                        //console.log($scope.wwrap.getAsArray());
                        $scope.registerTermination(newWidgetId);
                    }
                });

                $(window).on('resize', function () {
                    $scope.$broadcast('resize-widget');
                });

                $(document).ready(function () {
                    $scope.$broadcast('resize-widget');
                });

                $scope.$emit('dashboard-ready');
            }
        };
    })

