angular.module('viz-dashlet', ['nvd3', 'ui.bootstrap'])

    .directive('vizDashlet', function () {
        return {
            restric: 'E',
            scope: {
                data: '=',
                options: '=',
            },
            templateUrl: 'src/templates/viz-dashlet.html',
            controller: function ($scope) {

                $scope.tabindexstate = 2;

                $scope.broadcasts = [];

                $scope.saveState = function(index){
                    $scope.tabindexstate = index;
                };

                $scope.pushBroadcast = function(msg){
                    $scope.broadcasts.push(msg);
                }

                console.log('vizDashlet controller fired.')
            }
        };
    })

    .directive('vizQuery', function () {
        return {
            restric: 'E',
            scope: {
                data: '=',
                options: '=',
            },
            templateUrl: 'src/templates/viz-query.html',
            controller: function ($scope, $http) {

                $scope.queryinput = '';
                $scope.serviceurl = '';

                $scope.rawresponse = '';

                $scope.response = {};

                console.log('vizQuery controller fired.');

                $scope.fireQuery = function () {
                    $http.get("/getConfiguration.json").then(function (response) {
                        $scope.response = response.data;
                        $scope.rawresponse = JSON.stringify(response);
                        console.log('rawresponse=' + $scope.rawresponse);
                    });

                    //could handle errors/warnings like this
                    console.log($scope.$parent.$parent.$parent);
                    $scope.$parent.$parent.$parent.pushBroadcast('sup');
                }
            }
        };
    });


function DefaultChartOptions() {
    return {
        chart: {
            type: 'lineChart',
            height: 240,
            width: 500,
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