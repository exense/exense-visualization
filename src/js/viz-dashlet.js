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
                        $scope.$watch('state.shared.config.masterinput', function (newValue) {
                            dashletcomssrv.updateMasterValue(newValue);
                        });
                    }
                });

                $scope.$watch('state.shared.config.slave', function (isSlave) {
                    if (isSlave) {
                        $scope.$watch(function(){ return dashletcomssrv.value; }, function (newValue) {
                            $scope.state.shared.config.slaveoutput = newValue;
                        });
                    }
                });

            }
        };
    });