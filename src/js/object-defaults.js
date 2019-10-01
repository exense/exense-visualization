function DefaultGlobalSettings() {
    return [{ "key": "__eId__", "value": ".*", "isDynamic": false }];
}

function DefaultMgrState() {
    return new MgrState(new DefaultGlobalSettings(), false, false, "Global Settings");
}

function DefaultDashboard(widgets) {
    return {
        title: 'New dashboard',
        widgets: new IdIndexArray(widgets, function (oid) {
            console.log('[widgets] ' + oid + '--default removal--');
        }),
        mgrstate: new DefaultMgrState()
    };
}

function DefaultConfig() {
    return new Config('Off', true, true, false, 'state.data.transformed');
}

function DefaultQuery() {
    return new Query("Raw", "Simple", "Get", {});
}

function DefaultChartOptions(chartHeight, chartWidth) {
    return new ChartOptions(chartHeight, chartWidth, "lineChart");
}

function DefaultWidget(chartHeight, chartWidth, containerHeight, containerWidth) {
    return new Widget(
        'new', 0, 'col-md-6',
        new Options(
            new DefaultChartOptions(chartHeight, chartWidth),
            new ContainerOptions(containerHeight, containerWidth)
        ),
        new DefaultConfig(),
        new DefaultQuery());
};

