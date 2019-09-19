registerScript();
angular.module('key-val-collection', ['ui.bootstrap'])
    .directive('keyValCollection', function () {
        return {
            restrict: 'E',
            scope: {
                collection: '=',
                collectionname: '='
            },
            templateUrl: resolveTemplateURL('key-val-collection.js', 'key-val-collection.html'),
            controller: function ($scope) {

                $scope.collection = [];

                $scope.getNumber = function (num) {
                    return new Array(num);
                }

                $scope.addElement = function () {
                    $scope.collection.push({ key: '__?__', value: '?', isDynamic: false });
                };

                $scope.removeElement = function ($index) {
                    $scope.collection.splice($index, 1);
                };

                $scope.changed = function(element, elementType){
                    $scope.$emit('key-val-collection-change-' + $scope.collectionname, { type: elementType, element: element, collection: $scope.collection });
                }
            }
        }
    })