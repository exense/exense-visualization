angular.module('viz-mgd-widget', ['viz-dashlet'])

.directive('vizMgdWidget', function(){
    return {
        restric: 'E',
        scope: {
            data: '=',
            options: '=',
            widgetwidth: '=',
            widgetid: '=',
            state: '='
        },
        templateUrl: 'src/templates/viz-mgd-widget.html',
        controller: function ($scope) {
            console.log('defstate')
            console.log($scope.state);
            $scope.currentstate = JSON.parse(JSON.stringify($scope.state));
            console.log('currentstate')
            console.log($scope.currentstate);
            
            $scope.reduceWidget = function(wId){
                $scope.$parent.$parent.reduceWidget(wId);
            };

            $scope.extendWidget = function(wId){
                $scope.$parent.$parent.extendWidget(wId);
            };

            $scope.removeWidget = function(wId){
                $scope.$parent.$parent.removeWidget(wId);
            };

            console.log('vizMgdWidget controller fired.')
      }  
    };
});