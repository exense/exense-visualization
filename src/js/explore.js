registerScript();

angular.module('explore', ['viz-dashlet'])
    .directive('explore', function () {
        return {
            restrict: 'E',
            scope: {},
            templateUrl: resolveTemplateURL('explore.js', 'explore.html'),
            controller: function ($scope) {
            }
        };
    });