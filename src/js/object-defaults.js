function DefaultGlobalSettings() {
    return new GlobalSettings(
        [],
        false,
        false,
        'Global Settings',
        3000
    );
};

function DefaultDashboardState(widgets) {
    if (!widgets) {
        widgets = [new DefaultWidget()];
    }
    return new DashboardState(
        new DefaultGlobalSettings(),
        widgets,
        'Viz Dashboard',
        'aggregated',
        new DefaultDashboardGui()
    );
};

function DefaultDashboard(widgets) {
    return new Dashboard(
        getUniqueId(),
        new DefaultDashboardState(widgets)
    );
};

function DefaultExplorationDashboard() {
    return new Dashboard(
        getUniqueId(),
        new DashboardState(
            new DefaultGlobalSettings(),
            [new ExplorationDashlet()],
            'Explore Dashboard',
            'exploded',
            new DefaultDashboardGui()
        )
    );
};

function DefaultDashboardGui() {
    return new DashboardGui(true);
}

function DefaultConfig() {
    return new Config('Off', false, false, '', 3000, 500, 'Off', 8);
};

function DefaultQuery() {
    return new DefaultSimpleQuery();
};

function DefaultSimpleQuery() {
    return new SimpleQuery("Raw", new DefaultService());
};

function DefaultAsyncQuery() {
    return new AsyncQuery("Raw", new DefaultService(), new DefaultCallback());
};

function DefaultService() {
    return new Service("", "Get", "",
        new DefaultPreproc(),
        new DefaultPostproc());
};

function DefaultCallback() {
    return new Callback("", "Get", "",
        new DefaultPreproc(),
        new DefaultPostproc());
};

function DefaultPreproc() {
    return new Preproc(DefaultReplaceFunc());
};

function DefaultPostproc() {
    return new Postproc(
        DefaultAsyncEndFunc(),
        DefaultTransformFunc(),
        [],
        DefaultSaveFunct(),
        {});
};

function DefaultAsyncEndFunc() {
    return "function(response){\r\treturn response.myEndBoolean;\r}";
}

function DefaultTransformFunc() {
    return "function (response, args) {\r\treturn [];\r}";
}

function DefaultReplaceFunc() {
    return "function(requestFragment, workData){\r\tfor(i=0;i<workData.length;i++){\r\t\trequestFragment = requestFragment.replace(workData[i].key, workData[i].value);\r\t}\r\treturn requestFragment;\r}";
}

function DefaultSaveFunct() {
    return "function(response){\r\treturn [\r\t\t{\r\t\t\tkey : '__mykey__', value : response.status, isDynamic : false\r\t\t}\r\t];\r}";
}

function DefaultInfo() {
    return new Info('Off');
}

function DefaultControls(template) {
    return new Controls({});
};

function DefaultTemplate(templatedPayload, templatedParams, placeholders) {
    return new Template("", "", []);
};

function DefaultChartOptions() {
    return new ChartOptions("lineChart", false, false,
    'function (d) {\r\n    var value;\r\n    if ((typeof d) === \"string\") {\r\n        value = parseInt(d);\r\n    } else {\r\n        value = d;\r\n    }\r\n\r\n    return d3.time.format(\"%H:%M:%S\")(new Date(value));\r\n}', 
    'function (d) { return d.toFixed(0); }');
};

function DefaultDashletData() {
    return new DashletData([], {}, {})
};

function DefaultGuiClosed() {
    return new Gui(false, false, false, false, false,
        false, false, false, false, false,
        false, false, false, false);
};

function DefaultGuiOpen() {
    return new Gui(true, false, true, true, false,
        true, true, false, false, true,
        true, true, true, true);
};

function DefaultDashletState() {
    return new DashletState(
        'New Dashlet', true, 0,
        new DefaultDashletData(),
        new DefaultChartOptions(),
        new DefaultConfig(),
        new DefaultQuery(),
        new DefaultGuiClosed(),
        new DefaultInfo()
    );
};

function ExplorationDashletState() {
    return new DashletState(
        'New Exploration Dashlet', true, 0,
        new DefaultDashletData(),
        new DefaultChartOptions(),
        new DefaultConfig(),
        new DefaultQuery(),
        new DefaultGuiOpen(),
        new Info('On')
    );
};

function ExplorationDashlet() {
    return new Dashlet(
        getUniqueId(),
        new ExplorationDashletState()
    );
};

function DefaultWidget() {
    return new Widget(
        getUniqueId(),
        new DefaultWidgetState(),
        new DefaultDashletState()
    );
};

function DefaultWidgetState() {
    return new WidgetState('col-md-6', false, true);
}

function DefaultPaging() {
    return new Paging('Off', {}, {});
};


