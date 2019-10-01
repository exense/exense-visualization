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

function DashletState(title, viewtoggle, tabindex, data, chartoptions, config, query) {
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

function DashletData(transformed, state) {
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
};

function Preproc(replacetarget, replacefunc) {
    return {
        replace: {
            target: replacetarget,
            function: replacefunc
        }
    };
};

//Not implemented yet
function Transformation(transformfunc, transformargs) {
    return {
        function: transformfunc,
        args: transformargs
    };
};

function Postproc(asyncendfunc, transformfunc, transformargs, savefunc, transformations) {
    return {
        asyncEnd: {
            function: asyncendfunc
        },
        transform: {
            function: transformfunc,
            args: transformargs,
            transformations: transformations
        },
        save: {
            function: savefunc
        }
    };
};

function Service(url, method, data, preproc, postproc) {
    return {
        url: url,
        method: method,
        data: data,
        preproc: preproc,
        postproc: postproc
    };
};

function SimpleQuery(inputtype, service) {
    return {
        inputtype: inputtype,
        type: 'Simple',
        datasource: {
            service: service
        }
    };
};

function AsyncQuery(inputtype, mainservice, callback) {
    return {
        inputtype: inputtype,
        type: 'Async',
        datasource: {
            service: mainservice,
            callback: callback
        }
    };
};

function Placeholder(key, value, isdynamic) {
    return {
        key: key,
        value: value,
        isDynamic: isdynamic
    };
}

function Template(name, placeholders, payloadTemplate, paramsTemplate, query) {
    return {
        name: name,
        placeholders: placeholders,
        templatedPayload: payloadTemplate,
        templatedParams: paramsTemplate,
        queryTemplate: query
    };
};