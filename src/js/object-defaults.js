function DefaultChartOptions(chartHeight, chartWidth, innerContainerHeight, innerContainerWidth, chartType) {
    return {
        innercontainer: {
            height: innerContainerHeight,
            width: innerContainerWidth,
        },
        chart: {
            type: chartType,
            height: chartHeight,
            width: chartWidth,
            margin: {
                top: 20,
                right: 20,
                bottom: 40,
                left: 55
            },
            x: function (d) { return d.x; },
            y: function (d) { return d.y; },
            useInteractiveGuideline: true,
            dispatch: {
                stateChange: function (e) { console.log("stateChange"); },
                changeState: function (e) { console.log("changeState"); },
                tooltipShow: function (e) { console.log("tooltipShow"); },
                tooltipHide: function (e) { console.log("tooltipHide"); }
            },
            xAxis: {
                axisLabel: 'Time (ms)'
            },
            yAxis: {
                axisLabel: 'y',
                tickFormat: function (d) {
                    return d3.format('.02f')(d);
                },
                axisLabelDistance: -10
            },
            showLegend: false,
            callback: function (chart) {
                //console.log("!!! lineChart callback !!!");
            }
        }
    };
};

function DefaultWidget(presets, chartHeightSmall, chartWidthSmall, innerContainerHeightSmall, innerContainerWidthSmall) {
    return {
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
                options: new DefaultChartOptions(chartHeightSmall, chartWidthSmall, innerContainerHeightSmall, innerContainerWidthSmall,
                    'lineChart'),
                config: {
                    autorefresh: 'Off',
                    barchevron: true,
                    master: false,
                    slave: false,
                    masterinput: 'empty',
                    slaveoutput: 'empty too'
                },
                global: {},
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
};

