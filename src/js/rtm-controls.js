angular.module('rtm-controls', [])

    .directive('rtmControls', function () {
        return {
            restric: 'E',
            scope: {
                state: '='
            },
            templateUrl: 'src/templates/rtm-controls.html',
            controller: function ($scope, $rootScope) {
                $rootScope.queryResult = {'abc' : 'def'};
                console.log('rtmControls controller fired.')
            }
        };
    })
