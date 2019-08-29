angular.module('viz-dashlet', ['nvd3', 'ui.bootstrap'])

    .directive('vizDashlet', function () {
        return {
            restric: 'E',
            scope: {
                data: '=',
                options: '=',
                state: '='
            },
            templateUrl: 'src/templates/viz-dashlet.html',
            controller: function ($scope) {

                $scope.broadcasts = [];

                $scope.saveState = function () {
                    $scope.state.tabindex = $scope.active;
                };

                $scope.setActiveTab = function (index) {
                    $scope.active = index;
                };

                $scope.pushBroadcast = function (msg) {
                    $scope.broadcasts.push(msg);
                }

                console.log('vizDashlet controller fired.')
                $scope.setActiveTab($scope.state.tabindex);
            }
        };
    })

    .directive('vizQuery', function () {
        return {
            restric: 'E',
            scope: {
                formwidth: '=',
                state: '='
            },
            templateUrl: 'src/templates/viz-query.html',
            controller: function ($scope, $http) {

                $scope.currentquery = JSON.parse(JSON.stringify($scope.state.initialquery));
                
                console.log('vizQuery controller fired.');

                console.log($scope.rawresponse);

                $scope.fireQuery = function () {

                    $http.get($scope.currentquery.url).then(function (response) {
                        $scope.response = response.data;
                        $scope.rawresponse = JSON.stringify(response);
                        console.log('rawresponse=' + $scope.rawresponse);
                    });

                    //could handle errors/warnings like this
                    $scope.$parent.$parent.$parent.pushBroadcast('sup');
                }
            }
        };
    })
    .directive('jsonText', function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attr, ngModel) {            
              function into(input) {
                return JSON.parse(input);
              }
              function out(data) {
                return JSON.stringify(data);
              }
              ngModel.$parsers.push(into);
              ngModel.$formatters.push(out);
    
            }
        };
    });

function DefaultOptions(chartHeight, chartWidth, innerContainerHeight, innerContainerWidth) {
    return {
        innercontainer : {
            height : innerContainerHeight,
            width : innerContainerWidth,
        },
        chart: {
            type: 'lineChart',
            height: chartHeight,
            width: chartWidth,
            margin: {
                top: 20,
                right: 20,
                bottom: 40,
                left: 55
            },
            x: function (d) { return d.x; },
            y: function (d) { return d.y; },
            useInteractiveGuideline: true,
            dispatch: {
                stateChange: function (e) { console.log("stateChange"); },
                changeState: function (e) { console.log("changeState"); },
                tooltipShow: function (e) { console.log("tooltipShow"); },
                tooltipHide: function (e) { console.log("tooltipHide"); }
            },
            xAxis: {
                axisLabel: 'Time (ms)'
            },
            yAxis: {
                axisLabel: 'Voltage (v)',
                tickFormat: function (d) {
                    return d3.format('.02f')(d);
                },
                axisLabelDistance: -10
            },
            callback: function (chart) {
                //console.log("!!! lineChart callback !!!");
            }
        }
    };
};