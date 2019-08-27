
var myApp = angular.module('myApp', ['viz-mgd-widget']);

myApp.controller('myCtrl', function($scope){


$scope.widgets = [];

$scope.elemVals = {};
$scope.parentScrollable = true;
$scope.parentRelative = true;

$scope.getValues = function() {
var divEl = $window.document.querySelector('#posdemodiv');
var btnEl = $window.document.querySelector('#posdemobtn');

var offsetParent = $uibPosition.offsetParent(divEl);
$scope.elemVals.offsetParent = 'type: ' + offsetParent.tagName + ', id: ' + offsetParent.id;

var scrollParent = $uibPosition.scrollParent(divEl);
$scope.elemVals.scrollParent = 'type: ' + scrollParent.tagName + ', id: ' + scrollParent.id;

$scope.scrollbarWidth = $uibPosition.scrollbarWidth();

$scope.elemVals.position = $uibPosition.position(divEl);

$scope.elemVals.offset = $uibPosition.offset(divEl);

$scope.elemVals.viewportOffset = $uibPosition.viewportOffset(divEl);

$scope.elemVals.positionElements = $uibPosition.positionElements(btnEl, divEl, 'auto bottom-left');
};


$scope.clearWidgets = function() {
 $scope.widgets = [];
};


$scope.extendWidget = function(wId) {
     for(i=0; i<$scope.widgets.length; i++){
         if($scope.widgets[i].widgetId === wId){
             $scope.widgets[i].widgetWidth = 'col-md-12';
             $scope.widgets[i].options.chart.height = 500;
             $scope.widgets[i].options.chart.width = 1000;
         }
     }
};

 $scope.reduceWidget = function(wId) {
     for(i=0; i<$scope.widgets.length; i++){
         if($scope.widgets[i].widgetId === wId){
             $scope.widgets[i].widgetWidth = 'col-md-6';
             $scope.widgets[i].options.chart.height = 250;
             $scope.widgets[i].options.chart.width = 500;
         }
     }
};

$scope.addWidget = function() {
 wId = Math.random().toString(36).substr(2, 9);
 
 widget = {
   widgetId : wId,
   widgetWidth : 'col-md-6',
   options :  new DefaultChartOptions(),
   title: {
         enable: true,
         text: 'Title for Line Chart'
          },
   data : sinAndCos()
 };
 
 $scope.widgets.push(widget);
 };
 
 $scope.removeWidget = function(wId){
 console.log(wId)
     for(i=0; i<$scope.widgets.length; i++){
         if($scope.widgets[i].widgetId === wId)
             $scope.widgets.splice(i,i+1);
     }
    
    };
 
 /*Random Data Generator */
 function sinAndCos() {
     var sin = [],sin2 = [],
         cos = [];

     //Data is represented as an array of {x,y} pairs.
     for (var i = 0; i < 100; i++) {
         sin.push({x: i, y: Math.sin(i/10)});
         sin2.push({x: i, y: i % 10 == 5 ? null : Math.sin(i/10) *0.25 + 0.5});
         cos.push({x: i, y: .5 * Math.cos(i/10+ 2) + Math.random() / 10});
     }

     //Line chart data should be sent as an array of series objects.
     return [
         {
             values: sin,      //values - represents the array of {x,y} data points
             key: 'Sine Wave', //key  - the name of the series.
             color: '#ff7f0e',  //color - optional: choose your own line color.
             strokeWidth: 2,
             classed: 'dashed'
         },
         {
             values: cos,
             key: 'Cosine Wave',
             color: '#2ca02c'
         },
         {
             values: sin2,
             key: 'Another sine wave',
             color: '#7777ff',
             area: true      //area - set to true if you want this line to turn into a filled area chart.
         }
     ];
 };

});