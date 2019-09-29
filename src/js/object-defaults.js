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
                bottom: 50,
                left: 55
            },
            x: function (d) { return d.x; },
            y: function (d) { return d.y; },
            showLegend: false,
            scatter: {
                onlyCircles: false
            },
            forceY: 0,
            xAxis: {
                tickFormat: function (d) {
                    return d3.time.format("%H:%M:%S")(new Date(d));
                },
                rotateLabels: -30
            }
        }
    };
};

function DefaultDashboard(widgets) {
    return {
        title: 'New dashboard',
        widgets: new IdIndexArray(widgets, function (oid) {
            console.log('[widgets] ' + oid + '--default removal--');
        }),
        mgrstate: {
            globalsettings: [{ "key": "__eId__", "value": ".*", "isDynamic": false }],
            globalsettingsname: 'Global Settings',
            globalsettingschevron: false,
            globalsettingsautorefresh: false
        }
    };
}

function DefaultWidget(displaymode, presets, chartHeightSmall, chartWidthSmall, innerContainerHeightSmall, innerContainerWidthSmall) {
    return {
        widgetWidth: 'col-md-6',
        state: {
            title: 'New dashlet',
            tabindex: 0,
            data: {
                transformed: [],
                state: {}
            },
            shared: {
                presets: presets,
                displaymode: displaymode,
                options: new DefaultChartOptions(chartHeightSmall, chartWidthSmall, innerContainerHeightSmall, innerContainerWidthSmall,
                    'lineChart'),
                config: {
                    dashlettitle: 'New Dashlet',
                    autorefresh: 'Off',
                    barchevron: true,
                    master: false,
                    slave: false,
                    masterinput: 'empty',
                    slaveoutput: 'empty too',
                    target: 'state.data.transformed',
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

