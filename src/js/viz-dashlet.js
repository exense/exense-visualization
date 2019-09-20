registerScript();

angular.module('viz-dashlet', ['viz-query', 'dashletcomssrv'])
    .directive('vizDashlet', function () {
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

                $scope.toggleBarchevronToConf = function () {
                    $scope.state.shared.config.barchevron = !$scope.state.shared.config.barchevron;
                }

                $scope.toggleBarchevronToViz = function () {
                    $scope.$broadcast('child-firequery', {});
                    $scope.state.shared.config.barchevron = !$scope.state.shared.config.barchevron;
                }

                $scope.$on('autorefresh-toggle', function (event, arg) {
                    $scope.$broadcast('child-autorefresh-toggle', arg);
                });

                $scope.$on('firequery', function (event, arg) {
                    $scope.$broadcast('child-firequery', arg);
                });

                $scope.$on('coms-reset', function(){
                    console.log('resetting..')
                    if($scope.state.shared.config.master){
                        state.shared.config.master = !state.shared.config.master;
                    }
                    if($scope.unwatchMaster){
                        $scope.unwatchMaster();
                    }
                    if($scope.unwatchSlave){
                        $scope.unwatchSlave();
                    }
                });

                // clean up when slave unchecked
                // state.shared.config.slave

                // replace watch with event?
                $scope.$watch('state.shared.config.master', function (isMaster) {
                    if (isMaster) {
                        dashletcomssrv.registerWidget($scope.dashletid);
                        $scope.unwatchMaster = $scope.$watch('state.shared.config.masterinput', function (newValue) {
                            dashletcomssrv.updateMasterValue($scope.dashletid, newValue);
                        });
                    }else{
                        dashletcomssrv.unregisterWidget($scope.dashletid);
                    }
                });

                $scope.$on('master-loaded', function (event, masterid) {
                    $scope.$watch('state.shared.config.slave', function () {
                        var thisarg = masterid;
                        $scope.unwatchSlave =  $scope.$watch(function () {
                            return dashletcomssrv.buffer[thisarg];
                        }, function (newValue) {
                            $scope.state.shared.config.slaveoutput = newValue;
                        });
                    });
                });

                // only register dashlets explicitely marked as masters for now  
                //dashletcomssrv.registerWidget($scope.dashletid);

                $scope.$watch(function () {
                    return dashletcomssrv.masters;
                }, function (newValue) {
                    $scope.state.shared.config.masters = newValue;
                }, true);
            }
        };
    });