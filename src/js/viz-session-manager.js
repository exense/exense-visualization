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
            controller: function ($scope) {
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

                $scope.saveSession = function (sessionName) {
                    console.log($scope.dashboardsendpoint);
                    var serialized = angular.toJson({ name: sessionName, state: $scope.dashboardsendpoint });
                    $http.post('/rest/viz/crud/session?name=' + sessionName, serialized)
                        .then(function (response) {
                            console.log('response')
                            console.log(response)
                        }, function (response) {
                            console.log('error response')
                            console.log(response)
                        });
                };

                $scope.loadSession = function (sessionName) {
                    $http.get('/rest/viz/crud/session?name=' + sessionName)
                        .then(function (response) {
                            if (response && response.data && response.data.state && response.data.state.length > 0) {
                                $scope.dashboardsendpoint = response.data.state;
                            } else {
                                $scope.dashboardsendpoint = [];
                            }
                        }, function (response) {
                            console.log('error response')
                            console.log(response)
                        });

                };

                $scope.deleteSession = function (sessionName) {
                    $http.delete('/rest/viz/crud/session?name=' + sessionName)
                        .then(function (response) {
                            console.log('response')
                            console.log(response)

                        }, function (response) {
                            console.log('error response')
                            console.log(response)
                        });

                };
            }
        };
    })
    .directive('vizToolbar', function () {
        return {
            restrict: 'E',
            scope:{
                dashboards: '='
            },
            templateUrl: resolveTemplateURL('viz-session-manager.js', 'viz-toolbar.html'),
            controller: function ($scope, $element, $http) {
    
            }
        };
    })