registerScript();

angular.module('viz-session-manager', ['viz-dashboard-manager', 'ui.bootstrap'])
    .directive('vizSessionManager', function () {
        return {
            restrict: 'E',
            scope: {
                presets: '=',
                dashboards: '=',
                displaymode: '=',
                headermargin: '=',
                restprefix: '='
            },
            templateUrl: resolveTemplateURL('viz-session-manager.js', 'viz-session-manager.html'),
            controller: function ($scope, $http, $element, $uibModal) {
                $scope.sessionName = "New Session";
                $scope.staticPresets = new StaticPresets();
                $scope.dashboardsendpoint = [];
                //$scope.dashboardsendpoint.push(new PerformanceDashboard());

                $scope.deriveEventName = function (sbName) {
                    return sbName.split('.')[1];
                };

                $scope.$on('sb.dashboard-new', function (event, arg) {
                    if (arg && arg === 'explore') {
                        $scope.$broadcast($scope.deriveEventName(event.name), { displaytype: 'exploded' })
                    } else {
                        $scope.$broadcast($scope.deriveEventName(event.name))
                    }
                });
                $scope.$on('sb.dashboard-clear', function (event) {
                    $scope.$broadcast($scope.deriveEventName(event.name))
                });
                $scope.$on('sb.dashboard-current-addWidget', function (event) {
                    $scope.$broadcast($scope.deriveEventName(event.name))
                });
                $scope.$on('sb.dashboard-current-clearWidgets', function (event) {
                    $scope.$broadcast($scope.deriveEventName(event.name))
                });
                $scope.$on('sb.dashboard-configure', function (event) {
                    $scope.$broadcast($scope.deriveEventName(event.name))
                });
                $scope.$on('sb.docs', function (event) {
                    $scope.$broadcast($scope.deriveEventName(event.name))
                });
                $scope.$on('sb.saveSession', function (event) {
                    $scope.saveSession($scope.sessionName);
                });
                $scope.$on('sb.loadSession', function (event) {
                    $scope.loadSession($scope.sessionName);
                });
                $scope.$on('sb.deleteSession', function (event) {
                    $scope.deleteSession($scope.sessionName);
                });

                $scope.$on('sb.sessionSelected', function (event, arg) {
                    $scope.sessionName = arg;
                    $scope.loadSession($scope.sessionName);
                });

                $scope.saveSession = function (sessionName) {
                    console.log($scope.dashboardsendpoint);
                    var serialized = angular.toJson({ name: sessionName, state: $scope.dashboardsendpoint });
                    $http.post('/rest/viz/crud/sessions?name=' + sessionName, serialized)
                        .then(function (response) {
                            console.log('response')
                            console.log(response)
                        }, function (response) {
                            console.log('error response')
                            console.log(response)
                        });
                };

                $scope.loadSession = function (sessionName) {
                    $http.get('/rest/viz/crud/sessions?name=' + sessionName)
                        .then(function (response) {
                            if (response && response.data && response.data.object.state && response.data.object.state.length > 0) {
                                $scope.dashboardsendpoint = response.data.object.state;
                            } else {
                                $scope.dashboardsendpoint = [];
                            }
                        }, function (response) {
                            console.log('error response')
                            console.log(response)
                        });

                };

                $scope.deleteSession = function (sessionName) {
                    $http.delete('/rest/viz/crud/sessions?name=' + sessionName)
                        .then(function (response) {
                            console.log('response')
                            console.log(response)

                        }, function (response) {
                            console.log('error response')
                            console.log(response)
                        });

                };


                $scope.popTable = function () {
                    var $ctrl = this;
                    $ctrl.animationsEnabled = true;
                    $ctrl.tableElementParent = angular.element($element).find('parent');

                    var modalParent = angular.element($element).find('parent');
                    var modalInstance = $uibModal.open({
                        animation: $ctrl.animationsEnabled,
                        ariaLabelledBy: 'modal-title',
                        ariaDescribedBy: 'modal-body',
                        templateUrl: resolveTemplateURL('viz-session-manager.js', 'tableModal.html'),
                        controller: 'ModalInstanceCtrl',
                        controllerAs: '$ctrl',
                        size: 'lg',
                        appendTo: modalParent,
                        resolve: {
                            dataUrl: function () {
                                return $scope.restprefix + '/crud/all/sessions';
                            },

                            tableElementParent: function () {
                                return $ctrl.tableElementParent;
                            }
                        }
                    });

                    modalInstance.result.then(function (selectedItem) {
                        $scope.$emit('sb.sessionSelected', selectedItem[0]);
                    }, function () {
                        $log.info('Modal dismissed at: ' + new Date());
                    });
                };
            }
        };
    })
    .controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, tableElementParent, dataUrl) {
        var $ctrl = this;
        $ctrl.selected = "";

        $(document).ready(function () {
            $ctrl.tableElement = angular.element(tableElementParent).find('table');

            $ctrl.table = $ctrl.tableElement.DataTable({
                ajax: dataUrl,
                select: true,
                order: [[0, "asc"]],
            });

            $ctrl.tableElement.on('click', 'tr', function () {
                $ctrl.selected = $ctrl.table.row(this).data();
            });
        });

        $ctrl.ok = function () {
            $uibModalInstance.close($ctrl.selected);
        };

        $ctrl.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    })
    .directive('vizToolbar', function () {
        return {
            restrict: 'E',
            scope: {
                dashboards: '=',
                restprefix: '='
            },
            templateUrl: resolveTemplateURL('viz-session-manager.js', 'viz-toolbar.html'),
            controller: function ($scope) {

            }
        };
    })

// hack to suppress DataTable warning
// see http://stackoverflow.com/questions/11941876/correctly-suppressing-warnings-in-datatables
window.alert = (function() {
    var nativeAlert = window.alert;
    return function(message) {
        message.indexOf("DataTables warning") === 0 ?
            console.warn(message) :
            nativeAlert(message);
    }
})();