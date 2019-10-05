function DefaultGlobalSettings() {
    return [{ "key": "__eId__", "value": ".*", "isDynamic": false }];
};

function DefaultMgrState() {
    return new MgrState(new DefaultGlobalSettings(), false, false, "Global Settings");
};

function DefaultDashboard(widgets) {
    return {
        title: 'New dashboard',
        widgets: new IdIndexArray(widgets, function (oid) {
            console.log('[widgets] ' + oid + '--default removal--');
        }),
        mgrstate: new DefaultMgrState()
    };
};

function DefaultConfig() {
    return new Config('Off', false, false, '');
};

function DefaultQuery() {
    return new SimpleQuery(
        "Raw",
        new Service("", "Get", "",
            new Preproc("data", ""),
            new Postproc("", "", [], {}, ""))
    );
};

function DefaultChartOptions() {
    return new ChartOptions("lineChart", false, false);
};

function DefaultDashletData() {
    return new DashletData([], {}, {})
};

function DefaultGuiClosed() {
    return new Gui(false, false, false, false, false,
        false, false, false, false, false,
        false, false, false);
};

function DefaultGuiOpen() {
    return new Gui(true, false, true, true, false,
        true, true, false, false, true,
        true, true, true);
};

function DefaultDashletState() {
    return new DashletState(
        'New Dashlet', true, 0,
        new DefaultDashletData(),
        new DefaultChartOptions(),
        new DefaultConfig(),
        new DefaultQuery(),
        new DefaultGuiClosed());
};

function ExplorationDashletState() {
    return new DashletState(
        'New Dashlet', true, 0,
        new DefaultDashletData(),
        new DefaultChartOptions(),
        new DefaultConfig(),
        new DefaultQuery(),
        new DefaultGuiOpen());
};

function DefaultWidget() {
    return new Widget(
        getUniqueId(),
        'col-md-6',
        false,
        new DefaultDashletState()
    );
};

function DefaultOffPaging() {
    return new Paging('Off', {}, {});
};


