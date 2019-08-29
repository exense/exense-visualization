
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
                tabindex: 1,
                initialquery : {
                    type: 'Simple',
                    url: '/mock_data1.json',
                    method: 'post',
                    data: {"selectors1":[{"textFilters":[{"key":"eId","value":"5d67ce7e48322f000b931026","regex":"false"}],"numericalFilters":[]}],"serviceParams":{"measurementService.nextFactor":"0","aggregateService.sessionId":"defaultSid","aggregateService.granularity":"auto","aggregateService.groupby":"name","aggregateService.cpu":"1","aggregateService.partition":"8","aggregateService.timeout":"600"}}
                    ,
                    dataaccess: 'data.payload',
                    keyaccess: 'begin',
                    valueaccess: 'value'
                },
                data: []
            },
            options: new DefaultOptions($scope.chartHeightSmall, $scope.chartWidthSmall, $scope.innerContainerHeightSmall, $scope.innerContainerWidthSmall),
            title: {
                enable: true,
                text: 'Title for Line Chart'
            },
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

});