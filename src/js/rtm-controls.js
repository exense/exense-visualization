registerScript();

angular.module('rtm-controls', [])

    .directive('rtmControls', function () {
        return {
            restrict: 'E',
            scope: {
                state: '='
            },

            templateUrl: resolveTemplateURL('rtm-controls.js', 'rtm-controls.html'),
            controller: function ($scope, $rootScope) {
                $rootScope.queryResult = { 'abc': 'def' };
            }
        };
    })
