function Dashboard(widgets, title, state) {
    return {
        title: title,
        widgets: new IdIndexArray(widgets, function (oid) {
            console.log('[widgets] ' + oid + '--default removal--');
        }),
        mgrstate: state
    };
}

function Widget(widgetid, wstate, dstate) {
    return {
        oid: widgetid,
        wstate: wstate,
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
    input, preproc, postproc) {
    return {
        status: {
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
            postproc: postproc
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

function Config(autorefresh, master, slave, target, autorefreshduration, asyncrefreshduration) {
    return {
        autorefresh: autorefresh,
        master: master,
        slave: slave,
        target: target,
        autorefreshduration: autorefreshduration,
        asyncrefreshduration: asyncrefreshduration
    };
}

function MgrState(gsettings, gautorefresh, gchevron, title, autorefreshduration) {
    return {
        globalsettings: gsettings,
        globalsettingsautorefresh: gautorefresh,
        globalsettingschevron: gchevron,
        globalsettingsname: title,
        gsautorefreshIntervalDuration: autorefreshduration
    }
}

function ChartOptions(chartType, useInteractiveGuideline, stacked) {
	if(chartType === 'stackedAreaChart'){
		return {
				type: "stackedAreaChart",
				height: 0, // all derived dynamically
				width: 0, // all derived dynamically
				margin: {
					top: 20,
					right: 20,
					bottom: 50,
					left: 55
				},
				useVoronoi: false,
				showControls: false,
				clipEdge: true,
				duration: 0,
				useInteractiveGuideline: true,
				showLegend: false,
				xAxis: {
                    showMaxMin: false,
                    tickFormat: function (d) {
                        //interpret these ranges as timestamp for now
                        return formatPotentialTimestamp(d);
                    },
                },
                forceY: 0,
				rotateLabels: -25,
				yAxis: {},
				zoom: {
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
				}
			};
	}else{
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
			stacked: stacked,
			useInteractiveGuideline: useInteractiveGuideline,
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
					return formatPotentialTimestamp(d);
				},
				rotateLabels: -25
			}
		};
	}
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

function TemplatePreset(name, placeholders, payloadTemplate, paramsTemplate, query) {
    return {
        name: name,
        placeholders: placeholders,
        templatedPayload: payloadTemplate,
        templatedParams: paramsTemplate,
        queryTemplate: query
    };
};

//Used when loading entire templatedQuery state (programmatically)
function TemplatedQuery(controltype, basequery, paging, controls) {
    return {
        inputtype: 'Controls',
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

function Template(templatedPayload, templatedParams, placeholders) {
    return {
        templatedPayload: templatedPayload,
        templatedParams: templatedParams,
        placeholders: placeholders
    };
};