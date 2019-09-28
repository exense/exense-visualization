registerScript();

angular.module('viz-dashlet', ['viz-query', 'dashletcomssrv'])
    .directive('vizDashlet', function ($rootScope) {
        return {
            restrict: 'E',
            scope: {
                options: '=',
                dashletid: '=',
                state: '='
            },
            templateUrl: resolveTemplateURL('viz-dashlet.js', 'viz-dashlet.html'),
            controller: function ($scope, $element, dashletcomssrv) {

                $scope.redraw = 'drawn';

                $scope.$on('globalsettings-refreshToggle', function (event, arg) {
                    if (arg.new) {
                        if (!$scope.state.shared.config.slave) {
                            $scope.state.shared.config.autorefresh = 'On';
                        }
                    } else {
                        $scope.state.shared.config.autorefresh = 'Off';
                    }
                });

                $scope.toggleBarchevronToConf = function () {
                    $scope.state.shared.config.barchevron = !$scope.state.shared.config.barchevron;
                }

                $scope.toggleBarchevronToViz = function () {
                    //Not firing our own query if slave, just listening to data
                    if (!$scope.state.shared.config.slave) {
                        $scope.$broadcast('child-firequery', {});
                    }
                    $scope.state.shared.config.barchevron = !$scope.state.shared.config.barchevron;
                }

                $scope.$on('autorefresh-toggle', function (event, arg) {
                    $scope.$broadcast('child-autorefresh-toggle', arg);
                });

                $scope.$on('firequery', function (event, arg) {
                    $scope.$broadcast('child-firequery', arg);
                });

                $scope.undoMaster = function () {
                    console.log($scope.dashletid + ': undoMaster')
                    // we shouldn't be registered if we don't have an unwatcher
                    dashletcomssrv.unregisterWidget($scope.dashletid);
                    if ($scope.unwatchMaster) {
                        //dashletcomssrv.unregisterWidget($scope.dashletid);
                        $scope.unwatchMaster();
                    }
                }

                $scope.undoSlave = function () {
                    if ($scope.unwatchSlave) {
                        $scope.unwatchSlave();
                    }
                }

                $scope.$on('coms-reset', function () {
                    if ($scope.state.shared.config.master) {
                        $scope.state.shared.config.master = !$scope.state.shared.config.master;
                    }
                    $scope.undoMaster();

                    if ($scope.state.shared.config.slave) {
                        $scope.state.shared.config.slave = !$scope.state.shared.config.slave;
                    }
                    $scope.undoSlave();
                });

                // clean up when slave unchecked
                // state.shared.config.slave

                $scope.$on('isMaster-changed', function (event, newValue) {
                    if (!newValue) {
                        dashletcomssrv.registerWidget($scope.dashletid, $scope.state.shared.config.dashlettitle);
                        $scope.unwatchMaster = $scope.$watch('state.data.transformed', function (newValue) {
                            dashletcomssrv.updateMasterValue($scope.dashletid, angular.toJson(newValue));
                        });
                    }
                    else {
                        $scope.undoMaster();
                    }
                });

                $scope.$watch('state.shared.config.dashlettitle', function (newValue) {
                    if ($scope.state.shared.config.master) {
                        dashletcomssrv.udpdateTitle($scope.dashletid, newValue);
                    }
                });

                $scope.unwatchSlave = '';

                $scope.startWatchingMaster = function (masterid) {
                    if ($scope.state.shared.config.slave) {
                        var unwatcher = $scope.$watch(function () {
                            return dashletcomssrv.buffer[masterid];
                        }, function (newValue) {
                            // Event somehow not propagating right, setting value directly for now
                            //$scope.$broadcast('slavedata-received', parsed);
                            $scope.state.data.transformed = JSON.parse(newValue);
                        });
                        $scope.unwatchSlave = unwatcher;
                    }
                };

                $scope.$watch('state.shared.config.slave', function (newValue) {
                    if (!newValue) {
                        $scope.undoSlave();
                    }
                });

                // no watching directly on the checkbox, only doing something once a master is picked
                $scope.$on('master-loaded', function (event, master) {
                    //if master already previously selected, stop watching him
                    $scope.undoSlave();
                    $scope.state.shared.config.currentmaster = master;
                    $scope.startWatchingMaster(master.oid);
                });

                // bind service masters to config master selection list
                $scope.$watch(function () {
                    return dashletcomssrv.masters;
                }, function (newValue) {
                    $scope.state.shared.config.masters = newValue;
                });

                $scope.$on('single-remove', function (event, arg) {
                    if (arg === $scope.dashletid) {
                        console.log('single-remove targeting ' + arg + ' was received.');
                        $scope.prepareRemove();
                    }
                });

                $scope.$on('global-remove', function (event, arg) {
                    $scope.prepareRemove();
                });

                $scope.prepareRemove = function () {
                    console.log('prepareRemove called.')
                    if ($scope.state.shared.config.master) {
                        dashletcomssrv.unregisterWidget($scope.dashletid);
                    }
                }

                // after dashlet loaded or duplicated
                if ($scope.state.shared.config.currentmaster) { //slave
                    $scope.startWatchingMaster($scope.state.shared.config.currentmaster.oid);
                } if ($scope.state.shared.config.master) { //master
                    //this is only an attempt. reregistration is avoided at service level
                    dashletcomssrv.registerWidget($scope.dashletid, $scope.state.shared.config.dashlettitle);
                }
            }
        };
    });