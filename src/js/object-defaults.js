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
    return new DefaultSimpleQuery();
};

function DefaultSimpleQuery(){
    return new SimpleQuery("Raw", new DefaultService());
};

function DefaultAsyncQuery(){
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

function DefaultAsyncEndFunc(){
    return "function(response){\r\treturn response.myEndBoolean;\r}";
}

function DefaultTransformFunc(){
    return "function (response, args) {\r\treturn [];\r}";
}

function DefaultReplaceFunc(){
    return "function(requestFragment, workData){\r\tfor(i=0;i<workData.length;i++){\r\t\trequestFragment = requestFragment.replace(workData[i].key, workData[i].value);\r\t}\r\treturn requestFragment;\r}";
}

function DefaultSaveFunct(){
    return "function(response){\r\treturn [\r\t\t{\r\t\t\tkey : '__mykey__', value : response.myvalue, isDynamic : false\r\t\t}\r\t];\r}";
}


function DefaultControls(template) {
    return new Controls({});
};

function DefaultTemplate(templatedPayload, templatedParams, placeholders) {
    return new Template("", "", []);
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

function DefaultPaging() {
    return new Paging('Off', {}, {});
};


