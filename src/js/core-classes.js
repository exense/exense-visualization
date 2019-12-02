function Dashboard(dashboardid, dstate) {
    return {
        oid: dashboardid,
        dstate: dstate
    };
}

function Widget(widgetid, wstate, dstate) {
    return {
        oid: widgetid,
        wstate: wstate,
        state: dstate
    };
};

function Dashlet(dashletid, dstate) {
    return {
        oid: dashletid,
        state: dstate
    };
};

function WidgetState(bstwidth, wrefresh, chevron) {
    return {
        widgetwidth: bstwidth,
        autorefresh: wrefresh,
        chevron: chevron
    };
};

function Info(showraw) {
    return {
        showraw: showraw,
        alert: {
            message: "",
            counter: 0,
        },
        http: {}
    };
}

function Gui(presets, loadconfig, display, coms, subscribeto,
    execution, info, presetquery, presetcontrols, service,
    input, preproc, postproc, manage) {
    return {
        status: {
            open: {
                presets: presets,
                loadconfig: loadconfig,
                display: display,
                coms: coms,
                subscribeto: subscribeto,
                execution: execution,
                info: info,
                presetquery: presetquery,
                presetcontrols: presetcontrols,
                service: service,
                input: input,
                preproc: preproc,
                postproc: postproc,
                manage: manage
            },
            disabled: {
                manage: false,
            }
        }
    };
}

function DashletState(title, viewtoggle, tabindex, data, chartoptions, config, query, gui, info) {
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
        info: info,
        gui: gui,
        query: query
    };
}

function DashletData(transformed, rawresponse, state) {
    return {
        transformed: transformed,
        rawresponse: rawresponse,
        state: state
    };
};

function Config(autorefresh, master, slave, target, autorefreshduration, asyncrefreshduration, incremental, incmaxdots) {
    return {
        autorefresh: autorefresh,
        master: master,
        slave: slave,
        target: target,
        autorefreshduration: autorefreshduration,
        asyncrefreshduration: asyncrefreshduration,
        incremental: incremental,
        incmaxdots: incmaxdots
    };
}

function DashboardState(globalsettings, widgets, title, displaytype, dashboardgui) {
    return {
        globalsettings: globalsettings,
        widgets: widgets,
        title: title,
        displaytype: displaytype,
        dashboardgui: dashboardgui
    };
}

function DashboardGui(inputopen) {
    return {
        inputopen: inputopen
    }
}

//gsettings
function GlobalSettings(placeholders, gautorefresh, gchevron, title, autorefreshduration) {
    return {
        placeholders: placeholders,
        autorefresh: gautorefresh,
        chevron: gchevron,
        name: title,
        intervalduration: autorefreshduration
    };
}

function ChartOptions(chartType, useInteractiveGuideline, stacked, xAxisTick, yAxisTick, xAxisScale, yAxisScale) {
    var options = {
        type: chartType,
        height: window.innerHeight / 4, // derived dynamically but defaulting for exploration dashlet
        width: 0, // derived dynamically but defaulting for exploration dashlet
        margin: {
            top: 20,
            right: 20,
            bottom: 55,
            left: 60
        },
        showLegend: false,
        forceY: 0,
        xAxis: {
            tickFormat: {},
            strTickFormat: xAxisTick,
            rotateLabels: -23
        },
        yAxis: {
            tickFormat: {},
            strTickFormat: yAxisTick
        }
    };

    if(xAxisScale){
        options.xAxis.strScale = xAxisScale;
    }

    if(yAxisScale){
        options.yAxis.strScale = yAxisScale;
    }

    if (chartType === 'stackedAreaChart') {
        options.useVoronoi=false;
        options.showControls=false;
        options.clipEdge=true;
        options.duration=0;
        options.useInteractiveGuideline=true;
        options.showLegend=false;
        options.zoom= {
                enabled: true,
                scaleExtent: [
                    1,
                    10
                ],
                useFixedDomain: false,
                useNiceScale: false,
                horizontalOff: true,
                verticalOff: true,
                unzoomEventType: "dblclick.zoom"
            };
    } else {
        options.stacked=stacked;
        options.useInteractiveGuideline=useInteractiveGuideline;
        options.x=function (d) { return d.x; };
        options.y=function (d) { return d.y; };
        options.showLegend=false;
        options.scatter={
                onlyCircles: false
            };
    }
    return options;
};

function Preproc(replacefunc) {
    return {
        replace: {
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

function Callback(url, method, data, preproc, postproc) {
    return new Service(url, method, data, preproc, postproc);
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

// for compatibility
function TemplatePreset(name, placeholders, payloadTemplate, paramsTemplate, query) {
    return new Preset(name, new Template(placeholders, payloadTemplate, paramsTemplate, query));
}

function Preset(name, preset) {
    return {
        name: name,
        preset: preset
    };
}

//Used when loading entire templatedQuery state (programmatically)
function TemplatedQuery(controltype, basequery, paging, controls) {
    return {
        inputtype: 'Template',
        controltype: controltype,
        type: basequery.type,
        datasource: basequery.datasource,
        paged: paging,
        controls: controls
    };
};

//example:"__FACTOR__", "return 0;", "return value + 1;", "if(value > 0){return value - 1;} else{return 0;}"
function Offset(vid, startfunc, nextfunc, previousfunc) {
    return {
        vid: vid,
        start: startfunc,
        next: nextfunc,
        previous: previousfunc
    };
};

function Paging(active, first, second) {
    return {
        ispaged: active, // 'On'
        offsets: {
            first: first,
            second: second
        }
    };
};

function Controls(template) {
    return {
        template: template
    };
};

function Template(templatedPayload, templatedParams, placeholders, querytemplate) {
    return {
        templatedPayload: templatedPayload,
        templatedParams: templatedParams,
        placeholders: placeholders,
        queryTemplate: querytemplate
    };
};