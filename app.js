
var myApp = angular.module('myApp', ['viz-mgd-widget']);

myApp.controller('myCtrl', function ($scope) {

    $scope.widgets = [];

    $scope.chartHeightSmall = 235;
    $scope.chartHeightBig = 485;
    $scope.chartWidthSmall = 490;
    $scope.chartWidthBig = 990;
    $scope.innerContainerHeightSmall = 240;
    $scope.innerContainerHeightBig = 490;
    $scope.innerContainerWidthSmall = 495;
    $scope.innerContainerWidthBig = 995;

    $scope.clearWidgets = function () {
        $scope.widgets = [];
    };

    $scope.getWidget = function (wId) {
        for (i = 0; i < $scope.widgets.length; i++) {
            if ($scope.widgets[i].widgetId === wId) {
                return $scope.widgets[i];
            }
        }
        return null;
    };

    $scope.extendWidget = function (wId) {
        var widget = $scope.getWidget(wId);
        widget.widgetWidth = 'col-md-12';
        widget.options.chart.height = $scope.chartHeightBig;
        widget.options.chart.width = $scope.chartWidthBig;
        widget.options.innercontainer.height = $scope.innerContainerHeightBig;
        widget.options.innercontainer.width = $scope.innerContainerWidthBig;
    };

    $scope.reduceWidget = function (wId) {
        var widget = $scope.getWidget(wId);
        widget.widgetWidth = 'col-md-6';
        widget.options.chart.height = $scope.chartHeightSmall;
        widget.options.chart.width = $scope.chartWidthSmall;
        widget.options.innercontainer.height = $scope.innerContainerHeightSmall;
        widget.options.innercontainer.width = $scope.innerContainerWidthSmall;
    };

    $scope.addWidget = function () {
        wId = Math.random().toString(36).substr(2, 9);

        widget = {
            widgetId: wId,
            widgetWidth: 'col-md-6',
            defstate: {
                tabindex: 0
            },
            options: new DefaultOptions($scope.chartHeightSmall, $scope.chartWidthSmall, $scope.innerContainerHeightSmall, $scope.innerContainerWidthSmall),
            title: {
                enable: true,
                text: 'Title for Line Chart'
            },
            data: sinAndCos()
        };

        $scope.widgets.push(widget);
    };

    $scope.removeWidget = function (wId) {
        for (i = 0; i < $scope.widgets.length; i++) {
            if ($scope.widgets[i].widgetId === wId)
                $scope.widgets.splice(i, i + 1);
        }

    };

    $scope.addWidget();



    
    /*Random Data Generator */
    function sinAndCos() {
        var sin = [], sin2 = [],
            cos = [];

        //Data is represented as an array of {x,y} pairs.
        for (var i = 0; i < 100; i++) {
            sin.push({ x: i, y: Math.sin(i / 10) });
            sin2.push({ x: i, y: i % 10 == 5 ? null : Math.sin(i / 10) * 0.25 + 0.5 });
            cos.push({ x: i, y: .5 * Math.cos(i / 10 + 2) + Math.random() / 10 });
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