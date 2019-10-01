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

function DashletState(title, viewtoggle, tabindex, data, options, config, query){
    return {
        title: title,
        viewtoggle: viewtoggle,
        tabindex: tabindex,
        data: data,
        options: options,
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

function ChartOptions(chartHeight, chartWidth, chartType) {
    return {
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

function ContainerOptions(innerContainerHeight, innerContainerWidth) {
    return {
        height: innerContainerHeight,
        width: innerContainerWidth,
    };
};

function Options(chartOptions, containerOptions) {
    return {
        innercontainer: containerOptions,
        chart: chartOptions
    };
};

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