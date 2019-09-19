angular.module('wmservice', [])
    .service('wmservice', function ($rootScope) {

        var wmservice = {};

        wmservice.dashboards = [];

        wmservice.computeHeights = function () {
            var sHeight = window.innerHeight;

            // parameterize via arguments or server-originating conf & promise?
            wmservice.headersHeight = 250;
            wmservice.chartToContainer = 15;
            // wmservice.chartHeightSmall = 250;

            wmservice.chartHeightSmall = (sHeight - wmservice.headersHeight) / 2 - wmservice.chartToContainer;
            wmservice.chartHeightBig = sHeight - (wmservice.headersHeight - 80) - wmservice.chartToContainer;
            wmservice.chartWidthSmall = 0;
            wmservice.chartWidthBig = 0;
            wmservice.innerContainerHeightSmall = (sHeight - wmservice.headersHeight) / 2;
            wmservice.innerContainerHeightBig = sHeight - (wmservice.headersHeight - 80);
            wmservice.innerContainerWidthSmall = 0;
            wmservice.innerContainerWidthBig = 0;
        };

        wmservice.computeHeights();

        wmservice.forceRedraw = function () {
            //force new angular digest
            $rootScope.$apply(function () {
                self.value = 0;
            });
        };

        wmservice.getNewId = function () {
            return Math.random().toString(36).substr(2, 9);
        };

        wmservice.addDashboard = function () {
            var dId = wmservice.getNewId();
            wmservice.dashboards.push({
                title: 'New dashboard',
                widgets: [],
                dashboardid: dId,
                mgrstate: {
                    globalsettings : [{ "key": "__eId__", "value": "??", "isDynamic" : false }],
                    globalsettingsname : 'Global Settings',
                    globalsettingschevron: false
                }
            });
            return dId;
        };

        wmservice.clearDashboards = function () {
            wmservice.dashboards.length = 0;
        };

        wmservice.clearWidgets = function (dId) {
            wmservice.getDashboardById(dId).widgets.length = 0;
        };

        wmservice.getWidget = function (dId, wId) {
            var dWidgets = wmservice.getDashboardById(dId).widgets;

            for (i = 0; i < dWidgets.length; i++) {
                if (dWidgets[i].widgetId === wId) {
                    return dWidgets[i];
                }
            }
            return null;
        };

        wmservice.updateSingleChartSize = function (dId, wId, newWidth) {

            //should only be done once at manager level
            wmservice.computeHeights();

            var widget = wmservice.getWidget(dId, wId);
            widget.state.shared.options.chart.width = newWidth;
            widget.state.shared.options.innercontainer.width = newWidth - 50;

            if (widget.widgetWidth === 'col-md-6') {
                widget.state.shared.options.chart.height = wmservice.chartHeightSmall;
                widget.state.shared.options.innercontainer.height = wmservice.innerContainerHeightSmall;
            }
            else {
                widget.state.shared.options.chart.height = wmservice.chartHeightBig;
                widget.state.shared.options.innercontainer.height = wmservice.innerContainerHeightBig;
            }
            wmservice.forceRedraw();
        };

        wmservice.extendWidget = function (dId, wId) {
            var widget = wmservice.getWidget(dId, wId);
            widget.widgetWidth = 'col-md-12';
            widget.state.shared.options.chart.height = wmservice.chartHeightBig;
            widget.state.shared.options.chart.width = wmservice.chartWidthBig;
            widget.state.shared.options.innercontainer.height = wmservice.innerContainerHeightBig;
            widget.state.shared.options.innercontainer.width = wmservice.innerContainerWidthBig;
        };

        wmservice.reduceWidget = function (dId, wId) {
            var widget = wmservice.getWidget(dId, wId);
            widget.widgetWidth = 'col-md-6';
            widget.state.shared.options.chart.height = wmservice.chartHeightSmall;
            widget.state.shared.options.chart.width = wmservice.chartWidthSmall;
            widget.state.shared.options.innercontainer.height = wmservice.innerContainerHeightSmall;
            widget.state.shared.options.innercontainer.width = wmservice.innerContainerWidthSmall;
        };

        wmservice.addWidget = function (dId, presets) {

            wId = wmservice.getNewId();

            widget = {
                widgetId: wId,
                widgetWidth: 'col-md-6',
                title: 'Dashlet title',
                state: {
                    tabindex: 0,
                    data: {
                        transformed: [],
                        state: {}
                    },
                    shared: {
                        presets: presets,
                        options: new DefaultChartOptions(wmservice.chartHeightSmall, wmservice.chartWidthSmall, wmservice.innerContainerHeightSmall, wmservice.innerContainerWidthSmall,
                            'lineChart'),
                        config: {
                            autorefresh: 'Off',
                            barchevron: true
                        },
                        global : {},
                        http: {}
                    },
                    query: {
                        inputtype: "Raw",
                        type: "Simple",
                        datasource: {
                            service: {
                                method: "Get",
                                controls: {}
                            }
                        }
                    }
                }
            };

            // initialize every new dashboard with a first basic widget
            wmservice.getDashboardById(dId).widgets.push(widget);
        };

        wmservice.removeWidget = function (dId, wId) {
            var dWidgets = wmservice.getDashboardById(dId).widgets;

            for (i = 0; i < dWidgets.length; i++) {
                if (dWidgets[i].widgetId === wId) {
                    dWidgets.splice(i, 1);
                }
            }
        };

        wmservice.getWidgetIndex = function (dId, wId) {
            return wmservice.getObjectIndexFromArray(wmservice.getDashboardById(dId).widgets, 'widgetId', wId);
        }

        wmservice.getDashboardIndex = function (dId) {
            return wmservice.getObjectIndexFromArray(wmservice.dashboards, 'dashboardid', dId);
        }

        wmservice.getDashboardById = function (dId) {
            return wmservice.dashboards[wmservice.getDashboardIndex(dId)];
        }

        wmservice.removetDashboardById = function (dId) {
            wmservice.dashboards.splice(wmservice.getDashboardIndex(dId), 1);
        }

        wmservice.getObjectIndexFromArray = function (array, oIdKey, oId) {
            for (i = 0; i < array.length; i++) {
                if (array[i][oIdKey] === oId) {
                    return i;
                }
            }
        }

        wmservice.moveWidget = function (dId, old_index, new_index) {
            var dWidgets = wmservice.getDashboardById(dId).widgets;

            if (new_index >= dWidgets.length) {
                var k = new_index - dWidgets.length + 1;
                while (k--) {
                    arr.push(undefined);
                }
            }
            dWidgets.splice(new_index, 0, dWidgets.splice(old_index, 1)[0]);
        };

        wmservice.moveWidgetLeft = function (dId, wId) {
            var widgetIndex = wmservice.getWidgetIndex(dId, wId);

            if (widgetIndex > 0) {
                wmservice.moveWidget(dId, widgetIndex, widgetIndex - 1);
            }
        };

        wmservice.moveWidgetRight = function (dId, wId) {
            var widgetIndex = wmservice.getWidgetIndex(dId, wId);
            wmservice.moveWidget(dId, widgetIndex, widgetIndex + 1);

        };

        wmservice.duplicateWidget = function (dId, wId) {
            var copy = wmservice.getWidgetCopy(dId, wId);
            wmservice.getDashboardById(dId).widgets.push(copy);
            wmservice.moveWidget(dId, wmservice.getWidgetIndex(dId, copy.widgetId), wmservice.getWidgetIndex(dId, wId) + 1);
        };

        wmservice.getWidgetCopy = function (dId, wId) {
            var copy = JSON.parse(JSON.stringify(wmservice.getWidget(dId, wId)));
            copy.widgetId = wmservice.getNewId();
            return copy;
        };
        return wmservice;
    })