var rtmControlsscripts = document.getElementsByTagName("script")
var rtmControlscurrentScriptPath = rtmControlsscripts[rtmControlsscripts.length-1].src;


angular.module('rtm-controls', [])

    .directive('rtmControls', function () {
        return {
            restric: 'E',
            scope: {
                state: '='
            },
            templateUrl: rtmControlscurrentScriptPath.replace('/js/', '/templates/').replace('rtm-controls.js', 'rtm-controls.html'),
            controller: function ($scope, $rootScope) {
                $rootScope.queryResult = {'abc' : 'def'};
                console.log('rtmControls controller fired.')
            }
        };
    })
