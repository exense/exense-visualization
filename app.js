
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

    $scope.getNewWidgetId = function(){
        return Math.random().toString(36).substr(2, 9);
    };

    $scope.addWidget = function () {
        wId = $scope.getNewWidgetId();

        widget = {
            widgetId: wId,
            widgetWidth: 'col-md-6',
            defstate: {
                tabindex: 0,
                initialquery: {
                    type: 'Simple',
                    url: '/mock_data1.json',
                    method: 'post',
                    data: 'nothing'
                    ,
                    dataaccess: 'data.payload',
                    keyaccess: 'begin',
                    valueaccess: 'value'
                },
                data: [],
                presets: [
                    {
                        name: 'RTM Measurements',
                        inputtype: 'Raw',
                        query: {
                            type: 'Simple',
                            data: '{"selectors1":[{"textFilters":[{"key":"eId","value":"5d67ce7e48322f000b931026","regex":"false"}],"numericalFilters":[]}],"serviceParams":{"measurementService.nextFactor":"0","aggregateService.sessionId":"defaultSid","aggregateService.granularity":"auto","aggregateService.groupby":"name","aggregateService.cpu":"1","aggregateService.partition":"8","aggregateService.timeout":"600"}}}'
                        }
                    },
                    {
                        name: 'empty preset'
                    }
                ]
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

    $scope.getWidgetIndex = function(wId){
        for (i = 0; i < $scope.widgets.length; i++) {
            if ($scope.widgets[i].widgetId === wId)
                return i;
        }
    }

    $scope.moveWidget = function (old_index, new_index) {
        if (new_index >= $scope.widgets.length) {
            var k = new_index - $scope.widgets.length + 1;
            while (k--) {
                arr.push(undefined);
            }
        }
        $scope.widgets.splice(new_index, 0, $scope.widgets.splice(old_index, 1)[0]);
    };

    $scope.moveWidgetLeft = function (wId) {
        var widgetIndex = $scope.getWidgetIndex(wId);

        if(widgetIndex > 0){
            $scope.moveWidget(widgetIndex, widgetIndex - 1);
        }
    };

    $scope.moveWidgetRight = function (wId) {
        var widgetIndex = $scope.getWidgetIndex(wId);
        $scope.moveWidget(widgetIndex, widgetIndex + 1);
    };

    $scope.duplicateWidget = function (wId) {
        var copy = $scope.getWidgetCopy(wId);
        $scope.widgets.push(copy);
        $scope.moveWidget($scope.getWidgetIndex(copy.widgetId), $scope.getWidgetIndex(wId + 1));
    };

    $scope.getWidgetCopy = function (wId) {
        var copy = JSON.parse(JSON.stringify($scope.getWidget(wId)));
        copy.widgetId = $scope.getNewWidgetId();
        return copy;
    };

    $scope.addWidget();

});