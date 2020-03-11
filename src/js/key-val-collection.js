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

                $scope.getNumber = function (num) {
                    return new Array(num);
                }

                $scope.addElement = function () {
                    $scope.collection.push({ key: '__?__', value: '?', isDynamic: false });
                    $scope.changed();
                };

                $scope.removeElement = function ($index) {
                    $scope.collection.splice($index, 1);
                    $scope.changed();
                };

                $scope.changed = function(){
                    $scope.$emit('key-val-collection-change-' + $scope.collectionname, { collection: $scope.collection });
                }

                // unused - will probably be discarded in the future, doesn't seem like clean design
                /*$scope.$on('force-update-' + $scope.collectionname, function(event, arg){
                    $scope.$emit('key-val-collection-change-' + $scope.collectionname, { type: 'forced', element: null, collection: $scope.collection });
                });*/
            }
        }
    })