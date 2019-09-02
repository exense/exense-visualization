var vizWidgetManagerscripts = document.getElementsByTagName("script")
var vizWidgetManagercurrentScriptPath = vizWidgetManagerscripts[vizWidgetManagerscripts.length - 1].src;

angular.module('viz-widget-manager', ['viz-mgd-widget'])
    .factory('wmservice', function () {
        
        var wmservice = {};
        wmservice.widgets = [];

        // parameterize via arguments or server-originating conf & promise?
        wmservice.chartHeightSmall = 235;
        wmservice.chartHeightBig = 485;
        wmservice.chartWidthSmall = 490;
        wmservice.chartWidthBig = 990;
        wmservice.innerContainerHeightSmall = 240;
        wmservice.innerContainerHeightBig = 490;
        wmservice.innerContainerWidthSmall = 495;
        wmservice.innerContainerWidthBig = 995;

        wmservice.clearWidgets = function () {
            wmservice.widgets = [];
        };

        wmservice.getWidget = function (wId) {
            for (i = 0; i < wmservice.widgets.length; i++) {
                if (wmservice.widgets[i].widgetId === wId) {
                    return wmservice.widgets[i];
                }
            }
            return null;
        };

        wmservice.extendWidget = function (wId) {
            var widget = wmservice.getWidget(wId);
            widget.widgetWidth = 'col-md-12';
            widget.options.chart.height = wmservice.chartHeightBig;
            widget.options.chart.width = wmservice.chartWidthBig;
            widget.options.innercontainer.height = wmservice.innerContainerHeightBig;
            widget.options.innercontainer.width = wmservice.innerContainerWidthBig;
        };

        wmservice.reduceWidget = function (wId) {
            var widget = wmservice.getWidget(wId);
            widget.widgetWidth = 'col-md-6';
            widget.options.chart.height = wmservice.chartHeightSmall;
            widget.options.chart.width = wmservice.chartWidthSmall;
            widget.options.innercontainer.height = wmservice.innerContainerHeightSmall;
            widget.options.innercontainer.width = wmservice.innerContainerWidthSmall;
        };

        wmservice.getNewWidgetId = function () {
            return Math.random().toString(36).substr(2, 9);
        };

        wmservice.addWidget = function () {
            wId = wmservice.getNewWidgetId();

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
                options: new DefaultOptions(wmservice.chartHeightSmall, wmservice.chartWidthSmall, wmservice.innerContainerHeightSmall, wmservice.innerContainerWidthSmall),
                title: {
                    enable: true,
                    text: 'Title for Line Chart'
                },
            };

            wmservice.widgets.push(widget);
        };

        wmservice.removeWidget = function (wId) {
            for (i = 0; i < wmservice.widgets.length; i++) {
                if (wmservice.widgets[i].widgetId === wId)
                    wmservice.widgets.splice(i, i + 1);
            }
        };

        wmservice.getWidgetIndex = function (wId) {
            for (i = 0; i < wmservice.widgets.length; i++) {
                if (wmservice.widgets[i].widgetId === wId)
                    return i;
            }
        }

        wmservice.moveWidget = function (old_index, new_index) {
            if (new_index >= wmservice.widgets.length) {
                var k = new_index - wmservice.widgets.length + 1;
                while (k--) {
                    arr.push(undefined);
                }
            }
            wmservice.widgets.splice(new_index, 0, wmservice.widgets.splice(old_index, 1)[0]);
        };

        wmservice.moveWidgetLeft = function (wId) {
            var widgetIndex = wmservice.getWidgetIndex(wId);

            if (widgetIndex > 0) {
                wmservice.moveWidget(widgetIndex, widgetIndex - 1);
            }
        };

        wmservice.moveWidgetRight = function (wId) {
            var widgetIndex = wmservice.getWidgetIndex(wId);
            wmservice.moveWidget(widgetIndex, widgetIndex + 1);
        };

        wmservice.duplicateWidget = function (wId) {
            var copy = wmservice.getWidgetCopy(wId);
            wmservice.widgets.push(copy);
            wmservice.moveWidget(wmservice.getWidgetIndex(copy.widgetId), wmservice.getWidgetIndex(wId + 1));
        };

        wmservice.getWidgetCopy = function (wId) {
            var copy = JSON.parse(JSON.stringify(wmservice.getWidget(wId)));
            copy.widgetId = wmservice.getNewWidgetId();
            return copy;
        };

        return wmservice;
    })
    .directive('vizWidgetManager', function () {
        return {
            restric: 'E',
            scope: {
                options: '=',
                widgetwidth: '=',
                widgetid: '=',
                state: '='
            },  
            templateUrl: vizWidgetManagercurrentScriptPath.replace('/js/', '/templates/').replace('viz-widget-manager.js', 'viz-widget-manager.html'),
            controller: function ($scope, wmservice) {

                $scope.widgets = wmservice.widgets;
                
                $scope.$on('mgdwidget-reduce', function (event, arg) {
                    wmservice.reduceWidget(arg.wid);
                });
                $scope.$on('mgdwidget-extend', function (event, arg) {
                    wmservice.extendWidget(arg.wid);
                });
                $scope.$on('mgdwidget-remove', function (event, arg) {
                    wmservice.removeWidget(arg.wid);
                });
                $scope.$on('mgdwidget-moveLeft', function (event, arg) {
                    wmservice.moveWidgetLeft(arg.wid);
                });
                $scope.$on('mgdwidget-moveRight', function (event, arg) {
                    wmservice.moveWidgetRight(arg.wid);
                });
                $scope.$on('mgdwidget-duplicate', function (event, arg) {
                    wmservice.duplicateWidget(arg.wid);
                });
                $scope.$on('mgdwidget-refresh', function (event, arg) {
                    //not implemented yet
                });

                wmservice.addWidget();
                console.log(wmservice);
            }
        };
    })

