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

                $scope.$watch('state.shared.config.master', function (isMaster) {
                    if (isMaster) {
                        dashletcomssrv.registerWidget($scope.dashletid);
                        $scope.$watch('state.shared.config.masterinput', function (newValue) {
                            dashletcomssrv.updateMasterValue($scope.dashletid, newValue);
                        });
                    }
                });

                $scope.$on('master-loaded', function (event, arg) {
                    $scope.$watch('state.shared.config.slave', function () {
                        console.log(arg);
                        var masterid = arg;
                        $scope.$watch(function () {
                            return dashletcomssrv.buffer[masterid];
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