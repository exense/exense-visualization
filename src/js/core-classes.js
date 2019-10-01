function Dashboard(widgets, title, state) {
    return {
        title: title,
        widgets: new IdIndexArray(widgets, function (oid) {
            console.log('[widgets] ' + oid + '--default removal--');
        }),
        mgrstate: state
    };
}

function Widget(bstwidth, dstate) {
    return {
        wstate: {
            widgetwidth: bstwidth,
        },
        state: dstate
    };
};

function DashletState(title, viewtoggle, tabindex, data, chartoptions, config, query){
    return {
        title: title,
        viewtoggle: viewtoggle,
        tabindex: tabindex,
        data: data,
        options: {
            innercontainer: {
                height: 0, // all derived dynamically
                width: 0, // all derived dynamically
            },
            chart: chartoptions
        },
        config: config,
        global: {},
        http: {},
        query: query
    };
}

function DashletData(transformed, state){
    return {
        transformed: transformed,
        state: state
    };
};

function Config(autorefresh, viewtoggle, master, slave, target) {
    return {
        autorefresh: autorefresh,
        master: master,
        slave: slave,
        target: target,
    };
}

function MgrState(gsettings, gautorefresh, gchevron, title) {
    return {
        globalsettings: gsettings,
        globalsettingsautorefresh: gautorefresh,
        globalsettingschevron: gchevron,
        globalsettingsname: title,
        gsautorefreshInterval: null
    }
}

function ChartOptions(chartType) {
    return {
        type: chartType,
        height: 0, // all derived dynamically
        width: 0, // all derived dynamically
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
                //interpret these ranges as timestamp for now
                if ((d > 1000000000 && d < 2000000000) || (d > 1000000000000 && d < 2000000000000)) {
                    return d3.time.format("%H:%M:%S")(new Date(d));
                } else {
                    return d;
                }
            },
            rotateLabels: -30
        }
    };
}

function Query(inputtype, type, method, controls) {
    return {
        inputtype: inputtype,
        type: type,
        datasource: {
            service: {
                method: method,
                controls: controls
            }
        }
    };
};