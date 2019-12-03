var productionmode = true;
var productionFile = 'viz.js';;
var devJSFolder = '/js/';
var devTemplateFolder = '/templates/';

var vizScripts = {};

var registerScript = function () {
    var scripts = document.getElementsByTagName("script");
    var scriptUrl = scripts[scripts.length - 1].src;

    var filenameSplit = scriptUrl.split("/");
    var filename = filenameSplit[filenameSplit.length - 1];

    vizScripts[filename] = scriptUrl;
};
registerScript();

var forceRedraw = function (scope) {
    var phase = scope.$root.$$phase;
    if (phase == '$apply' || phase == '$digest') {
        scope.$eval(function () {
            self.value = 0;
        });
    }
    else {
        scope.$apply(function () {
            self.value = 0;
        });
    }
};

var resolveTemplateURL = function (containername, componentname) {
    if (productionmode === false) {
        templateUrl = vizScripts[containername].replace(devJSFolder, devTemplateFolder)
            .replace(containername, componentname)
            + '?who=' + componentname
            + '&anticache=' + getUniqueId();
    } else {
        templateUrl = vizScripts[productionFile].replace(productionFile, 'templates/' + componentname);
    }
    return templateUrl;
}

var setIntervalDefault = 3000;
var setIntervalAsyncDefault = 500;

var keyvalarrayToIndex = function (array, keyKey, valKey) {
    var index = {};
    $.each(array, function (idx, e) {
        index[e[keyKey]] = e[valKey];
    });
    return index;
};

var stringToColour = function (str) {
    if (str) {
        return intToColour(hashCode(str.toString()));
    }else{
        return "rgb(0,0,0)";
    }
}

var hashCode = function (mystr) {
    var hash = 0, i, chr;
    if (mystr.length === 0) return hash;
    for (i = 0; i < mystr.length; i++) {
        chr = mystr.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

var intToColour = function (i) {
    var num = (i + 1) * 500000;
    if ((i % 2) == 0) {
        num = num * 100;
    }
    num >>>= 0;
    var b = num & 0xFF,
        g = (num & 0xFF00) >>> 8 % 255,
        r = (num & 0xFF0000) >>> 16 % 255;
    return "rgb(" + [r, g, b].join(",") + ")";
};

var runResponseProc = function (postProc, args, response) {
    return eval('(' + postProc + ')(response, args)');
};

var runRequestProc = function (postProc, requestFragment, workData) {
    return eval('(' + postProc + ')(requestFragment, workData)');
};

var runValueFunction = function (functionFragment, value) {
    return eval('(function(value){' + functionFragment + '})(value)');
};

var runDynamicEval = function (expression) {
    return eval(expression);
};

var evalDynamic = function (placeholders) {
    var returned = JSON.parse(JSON.stringify(placeholders));
    $.each(returned, function (index, placeholder) {
        if (placeholder.isDynamic) {
            placeholder.value = runDynamicEval(placeholder.value);
        }
    });
    return returned;
};

var resolve = function (obj, path) {
    path = path.split('.');
    var current = obj;
    while (path.length) {
        if (typeof current !== 'object') return undefined;
        current = current[path.shift()];
    }
    return current;
};

var getUniqueId = function () {
    return Math.random().toString(36).substr(2, 9);
}

var jsoncopy = function (obj) {
    return JSON.parse(angular.toJson(obj));
}

var formatPotentialTimestamp = function (d) {
    var value;
    if ((typeof d) === "string") {
        value = parseInt(d);
    } else {
        value = d;
    }
    if (value >= 1000000000 && value < 2000000000) {
        value = value * 1000;
    }
    if (value >= 1000000000000 && value < 2000000000000) {
        return d3.time.format("%H:%M:%S")(new Date(value));
    } else {
        return d;
    }
};;
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
    input, preproc, postproc, manage, chartdata, tabledata) {
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
            },
            chartdata: chartdata,
            tabledata: tabledata
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

function Config(toggleaction, autorefresh, master, slave, target, autorefreshduration, asyncrefreshduration, incremental, incmaxdots, transposetable) {
    return {
        toggleaction: toggleaction,
        autorefresh: autorefresh,
        master: master,
        slave: slave,
        target: target,
        autorefreshduration: autorefreshduration,
        asyncrefreshduration: asyncrefreshduration,
        incremental: incremental,
        incmaxdots: incmaxdots,
        transposetable: transposetable
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

    if (xAxisScale) {
        options.xAxis.strScale = xAxisScale;
    }

    if (yAxisScale) {
        options.yAxis.strScale = yAxisScale;
    }

    if (chartType === 'stackedAreaChart') {
        options.useVoronoi = false;
        options.showControls = false;
        options.clipEdge = true;
        options.duration = 0;
        options.useInteractiveGuideline = true;
        options.showLegend = false;
        options.zoom = {
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
        options.stacked = stacked;
        options.useInteractiveGuideline = useInteractiveGuideline;
        options.x = function (d) { return d.x; };
        options.y = function (d) { return d.y; };
        options.showLegend = false;
        options.scatter = {
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
};;
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
    return new Config('Fire','Off', false, false, '', 3000, 1000, 'Off', 8, 'Off');
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

function DefaultControls() {
    return new Controls({});
};

function DefaultTemplatedQuery(){
    return new TemplatedQuery('Plain', new DefaultQuery(), new DefaultPaging(), new DefaultControls());
};

function DefaultTemplate(templatedPayload, templatedParams, placeholders) {
    return new Template("", "", [], new DefaultTemplatedQuery());
};

function DefaultChartOptions() {
    return new ChartOptions("lineChart", false, false,
    'function (d) {\r\n    var value;\r\n    if ((typeof d) === \"string\") {\r\n        value = parseInt(d);\r\n    } else {\r\n        value = d;\r\n    }\r\n\r\n    return d3.time.format(\"%H:%M:%S\")(new Date(value));\r\n}', 
    'function (d) { return d.toFixed(1); }',
    //'[new Date(new Date().getTime() - 120000).getTime(), new Date().getTime()]',
    null,
    null
    );
};

function DefaultDashletData() {
    return new DashletData(null, null, null)
};

function DefaultGuiClosed() {
    return new Gui(false, false, false, false, false,
        false, false, false, false, false,
        false, false, false, false, null, null);
};

function DefaultGuiOpen() {
    return new Gui(true, false, true, true, false,
        true, true, false, false, true,
        true, true, true, true, null, null);
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


;
registerScript();

angular.module('rtm-controls', [])

    .directive('rtmControls', function () {
        return {
            restrict: 'E',
            scope: {
                state: '='
            },

            templateUrl: resolveTemplateURL('rtm-controls.js', 'rtm-controls.html'),
            controller: function ($scope, $rootScope) {
                $rootScope.queryResult = { 'abc': 'def' };
            }
        };
    })
;
registerScript();

angular.module('viz-dashlet', ['viz-query', 'dashletcomssrv'])
    .directive('vizDashlet', function () {

        var controllerScript = 'viz-dashlet.js';
        var aggTemplateUrl = resolveTemplateURL(controllerScript, 'viz-dashlet-aggregated.html');
        var expTemplateUrl = resolveTemplateURL(controllerScript, 'viz-dashlet-exploded.html');
        var errorTemplateUrl = resolveTemplateURL(controllerScript, 'error-template.html');

        return {
            restrict: 'E',
            scope: {
                widgetid: '=',
                state: '=',
                displaytype: '=',
                displaymode: '=',
                presets: '=',
                restprefix: '=',
                inputsettingscol: '='
            },
            template: '<div ng-include="resolveDynamicTemplate()"></div>',
            controller: function ($scope, $http, dashletcomssrv) {
                $scope.state.unwatchers = [];
                $scope.loaded = false;
                $scope.resolveDynamicTemplate = function () {
                    if ($scope.displaytype === 'aggregated') {
                        return aggTemplateUrl;
                    }
                    else {
                        if ($scope.displaytype === 'exploded') {
                            return expTemplateUrl;
                        } else {
                            return errorTemplateUrl;
                        }
                    }
                };

                $scope.selectTab = function (tabIndex) {
                    $scope.state.tabindex = tabIndex;
                };

                $scope.isTabActive = function (tabIndex) {
                    return tabIndex === $scope.state.tabindex;
                };

                $scope.messageBoxClick = function () {
                    $scope.toggleBarchevronToConf();
                    $scope.selectTab(3);
                    $scope.state.gui.status.open.info = true;
                };

                $scope.toggleBarchevronToConf = function () {
                    $scope.state.viewtoggle = !$scope.state.viewtoggle;
                }

                $scope.toggleBarchevronToViz = function () {
                    if ($scope.state.config.toggleaction === 'Fire') {
                        $scope.fireQueryDependingOnContext();
                    }
                    if ($scope.state.config.toggleaction === 'Draw') {
                        $scope.state.data.rawresponse = jsoncopy($scope.state.data.rawresponse);
                    }
                    if ($scope.state.config.toggleaction === 'None') {
                        console.log('toggle view action is set to none: doing nothing.');
                    }
                    $scope.state.viewtoggle = !$scope.state.viewtoggle;
                }

                $scope.fireQueryDependingOnContext = function () {
                    //Not firing our own query if slave, just listening to data
                    //Also not firing if autorefresh is on
                    if (!$scope.state.config.slave && ($scope.state.config.autorefresh !== 'On')) {
                        $scope.fireQuery();
                    } else {
                        if ($scope.state.data.rawresponse) {
                            var saved = JSON.parse(angular.toJson($scope.state.data.rawresponse));
                            $scope.state.data.rawresponse = saved;
                        }
                    }
                }

                $scope.cleanupState = function () {
                    $scope.state.info.http.asynccheckpoint = false;
                    $scope.clearAsync();
                    $scope.$broadcast('cleanup-info');
                    //$scope.$broadcast('cleanup-view');
                    $scope.isRawDisplay = $scope.state.info.showraw === 'On';
                };

                // init
                $scope.isOngoingQuery = false;
                $scope.autorefreshInterval = undefined;

                $scope.fireQuery = function () {
                    $scope.cleanupState();
                    try {
                        $scope.isOngoingQuery = true;
                        var srv = $scope.state.query.datasource.service;
                        if (!srv.params) {
                            srv.params = ""; // prevent "undefined" string from being concatenated
                        }

                        //Done out of the box via templace
                        //$scope.executeReplace(srv);
                        if ($scope.isRawDisplay) {
                            $scope.state.info.http.servicesent = 'url :' + JSON.stringify(srv.url + srv.params) + '; payload:' + JSON.stringify(srv.data);
                        }
                        $scope.executeHttp(srv.method, srv.url + srv.params, srv.data, $scope.dispatchSuccessResponse, srv, $scope.dispatchErrorResponse);
                    } catch (e) {
                        $scope.sendErrorMessage('exception thrown while firing query: ' + e);
                    }
                };

                $scope.dispatchErrorResponse = function (response) {
                    if ($scope.state.query.type === 'Simple') {
                        $scope.state.info.http.rawserviceresponse = JSON.stringify(response);
                    }
                    if ($scope.state.query.type === 'Async') {
                        $scope.state.info.http.rawcallbackresponse = JSON.stringify(response);
                    }
                    $scope.sendErrorMessage('Query execution failed. Check error in service response for more details.');
                    $scope.clearAsync();
                    $scope.isOngoingQuery = false;
                };

                $scope.sendErrorMessage = function (msg) {
                    $scope.$broadcast('errormessage', msg);
                }

                $scope.executeHttp = function (method, url, payload, successcallback, successTarget, errorcallback) {
                    var effectiveUrl = url;
                    var effectivePayload = payload;
                    var effectiveMethod = method;
                    if (url) {
                        if (url.startsWith('http')) { // Proxified case
                            effectiveUrl = $scope.restprefix + '/viz/proxy';
                            effectivePayload = $scope.proxify(url, method, payload);
                            effectiveMethod = 'Post';
                        }
                        $scope.doExecuteHttp(effectiveMethod, effectiveUrl, effectivePayload, successcallback, successTarget, errorcallback);
                    } else {
                        $scope.sendErrorMessage('Service url is null');
                    }
                };

                $scope.proxify = function (url, method, payload) {
                    return {
                        url: url,
                        method: method,
                        data: payload
                    }
                };

                $scope.doExecuteHttp = function (method, url, payload, successcallback, successTarget, errorcallback) {
                    if (method === 'Get') { $http.get(url).then(function (response) { successcallback(response, successTarget); }, function (response) { errorcallback(response); }); }
                    if (method === 'Post') { $http.post(url, payload).then(function (response) { successcallback(response, successTarget); }, function (response) { errorcallback(response); }); }
                    if (method === 'Delete') { $http.delete(url, payload).then(function (response) { successcallback(response, successTarget); }, function (response) { errorcallback(response); }); }
                    if (method === 'Put') { $http.put(url, payload).then(function (response) { successcallback(response, successTarget); }, function (response) { errorcallback(response); }); }
                    if (method === 'Patch') { $http.patch(url, payload).then(function (response) { successcallback(response, successTarget); }, function (response) { errorcallback(response); }); }
                }

                $scope.dispatchSuccessResponse = function (response, successTarget) {
                    try {
                        if ($scope.state.query.type === 'Simple') {
                            $scope.loadData(response, successTarget);
                        }
                        if ($scope.state.query.type === 'Async') {
                            $scope.state.info.http.asynccheckpoint = true;
                            var srv = $scope.state.query.datasource.service;
                            var scallback = $scope.state.query.datasource.callback;
                            //$scope.state.data.serviceraw = response;
                            if ($scope.isRawDisplay) {
                                $scope.state.info.http.rawserviceresponse = JSON.stringify(response);
                            }
                            if ($scope.state.query.datasource.service.postproc.save) {
                                $scope.state.data.state = runResponseProc(srv.postproc.save.function, null, response);
                            }

                            var input = $scope.executeReplace(scallback, $scope.state.data.placeholdersstate);

                            if ($scope.isRawDisplay) {
                                $scope.state.info.http.callbacksent = 'url :' + JSON.stringify(input.url) + '; payload:' + JSON.stringify(input.data);
                            }
                            var executionFunction = function () {
                                $scope.executeHttp(scallback.method, input.url, input.data, $scope.loadData, scallback, $scope.dispatchErrorResponse)
                            };
                            $scope.setAsyncInterval(executionFunction);
                        }
                    } catch (e) {
                        $scope.sendErrorMessage('An error occured while processing response:' + e);
                        $scope.clearAsync();
                        $scope.isOngoingQuery = false;
                    }
                };

                //TODO: this should be scoped inside viz-query (inputs) and triggered via events
                $scope.executeReplace = function (service, mergedplaceholders) {
                    var mergedstate;

                    if (mergedplaceholders && $scope.state.data.state) {
                        mergedstate = mergedplaceholders.concat($scope.state.data.state);
                    } else {
                        if (mergedplaceholders) {
                            mergedstate = mergedplaceholders;
                        }
                        if ($scope.state.data.state) {
                            mergedstate = $scope.state.data.state;
                        }
                    }

                    var datatosend = service.data;
                    var urltosend = service.url;
                    if (service.preproc.replace && service.preproc.replace.function) {
                        var replaced;
                        if (datatosend) {
                            try {
                                replaced = runRequestProc(service.preproc.replace.function, datatosend, mergedstate);
                                datatosend = JSON.parse(replaced);
                            } catch (e) {
                                $scope.sendErrorMessage('An issue occured while replacing payload data: ' + e);
                            }
                        }
                        if (urltosend) {
                            try {
                                replaced = runRequestProc(service.preproc.replace.function, urltosend, mergedstate);
                                urltosend = replaced;
                            } catch (e) {
                                $scope.sendErrorMessage('An issue occured while replacing url params: ' + e);
                            }
                        }
                    }

                    return { data: datatosend, url: urltosend };
                }

                $scope.setAsyncInterval = function (callback) {
                    $scope.clearAsync();

                    var duration = setIntervalAsyncDefault;
                    if ($scope.state.config.asyncrefreshduration) {
                        duration = $scope.state.config.asyncrefreshduration;
                    }

                    $scope.asyncInterval = setInterval(callback, duration);
                };

                $scope.clearAsync = function () {
                    if ($scope.asyncInterval) {
                        clearInterval($scope.asyncInterval);
                    }
                };

                $scope.loadData = function (response, proctarget) {
                    if ($scope.state.query.type === 'Simple') {
                        if ($scope.isRawDisplay) {
                            $scope.state.info.http.rawserviceresponse = JSON.stringify(response);
                        }
                        $scope.isOngoingQuery = false;
                    }
                    if ($scope.state.query.type === 'Async') {
                        if ($scope.asyncInterval) {
                            try {
                                // stream consumed
                                if (runResponseProc($scope.state.query.datasource.callback.postproc.asyncEnd.function, null, response)) {
                                    //console.log('consumed. Clearing Async and resetting query fire.')
                                    $scope.clearAsync();
                                    $scope.isOngoingQuery = false;
                                } else {
                                    //console.log('Stream incomplete -> ' + JSON.stringify(response));
                                }
                            } catch (e) {
                                $scope.sendErrorMessage('An error occured while checking async response completeness' + e);
                                $scope.clearAsync();
                            }
                        }
                        if ($scope.isRawDisplay) {
                            $scope.state.info.http.rawcallbackresponse = JSON.stringify(response);
                        }
                    }
                    $scope.state.data.rawresponse = { dashdata: response };
                };

                $scope.state.unwatchers.push($scope.$watch('state.data.rawresponse', function (newValue) {
                    var proctarget = undefined;
                    if ($scope.state.query.type === 'Simple') {
                        proctarget = $scope.state.query.datasource.service;
                    }
                    if ($scope.state.query.type === 'Async') {
                        proctarget = $scope.state.query.datasource.callback;
                    }
                    // due to watch init
                    if (proctarget && proctarget.postproc && newValue && newValue.dashdata) {
                        //$scope.loaded: do not append at load time (the value has most likely already been added 
                        if (proctarget.postproc.transform.function && proctarget.postproc.transform.function.length > 0 && $scope.loaded) {
                            try {
                                var newTransformed = {
                                    dashdata: runResponseProc(
                                        proctarget.postproc.transform.function,
                                        keyvalarrayToIndex(
                                            evalDynamic(proctarget.postproc.transform.args),
                                            'key',
                                            'value'),
                                        newValue.dashdata
                                    )
                                };
                                //incremental refresh mode
                                if ($scope.state.data.transformed && $scope.state.data.transformed.dashdata && newTransformed && newTransformed.dashdata && $scope.state.config.incremental === 'On') {
                                    // new dots don't fit, trim existing array
                                    if ($scope.state.data.transformed.dashdata.length + newTransformed.dashdata.length > $scope.state.config.incmaxdots) {
                                        var overflow = $scope.state.data.transformed.dashdata.length + newTransformed.dashdata.length - $scope.state.config.incmaxdots;
                                        $scope.state.data.transformed.dashdata = $scope.state.data.transformed.dashdata.splice(overflow, $scope.state.data.transformed.dashdata.length - 1);
                                    }
                                    $scope.state.data.transformed = { dashdata: $scope.state.data.transformed.dashdata.concat(newTransformed.dashdata) };
                                } else {
                                    $scope.state.data.transformed = newTransformed;
                                }
                            } catch (e) {
                                $scope.sendErrorMessage('An error occured while performing transformation:' + e);
                            }
                        } else {
                            $scope.sendErrorMessage('Warning: a new raw value was read by widget with id : ' + $scope.widgetid + ' but no transform function was provided');
                        }
                    }
                }));

                $scope.clearAutorefreshInterval = function () {
                    if ($scope.autorefreshInterval) {
                        clearInterval($scope.autorefreshInterval);
                    }
                }

                $scope.state.unwatchers.push($scope.$watch('state.config.autorefresh', function (newValue) {
                    $scope.clearAutorefreshInterval();
                    if (newValue === 'On') {
                        $scope.setAutorefreshInterval();
                    }
                }));

                $scope.setAutorefreshInterval = function () {
                    var duration = setIntervalDefault;
                    if ($scope.state.config.autorefreshduration) {
                        duration = $scope.state.config.autorefreshduration;
                    }
                    $scope.autorefreshInterval = setInterval(function () {
                        if (!$scope.isOngoingQuery) {
                            try {
                                //console.log('$scope.isOngoingQuery=' + $scope.isOngoingQuery + "; Firing.");
                                $scope.fireQuery();
                            } catch (e) {
                                $scope.sendErrorMessage('[Autorefresh] unable to refresh due to error: ' + e + "; Starting new query.");
                                // agressive
                                $scope.clearAutorefreshInterval();
                                $scope.isOngoingQuery = false;
                            }
                        } else {
                            //console.log('$scope.isOngoingQuery=' + $scope.isOngoingQuery + "; Skipping interval.");
                        }
                    }, duration);
                }

                // info pane trigger
                $scope.$on('firequery', function () {
                    $scope.fireQuery();
                });

                $scope.$on('fireQueryDependingOnContext', function () {
                    $scope.fireQueryDependingOnContext();
                });

                // Paging

                // also initPaging() on viewtoggle (back to config)?
                $scope.$on('templateph-loaded', function () {
                    if ($scope.state.query.controls
                        && $scope.state.query.controls.template
                        && $scope.state.query.paged.ispaged) {
                        $scope.initPaging();
                    }
                });

                $scope.$on('firenext', function () {
                    $scope.nextPaging();
                });

                $scope.$on('fireprevious', function () {
                    $scope.previousPaging();
                });

                $scope.$on('template-updated', function () {
                    $scope.fireQuery();
                });

                $scope.$on('dashboard-data-clear', function () {
                    console.log('clearing data.');
                    $scope.clearData();
                });

                $scope.initPaging = function () {
                    var paged = $scope.state.query.paged;
                    if (paged && paged.offsets && paged.offsets.first) {
                        paged.offsets.first.state = runValueFunction(paged.offsets.first.start);
                        if (paged.offsets.second) {
                            paged.offsets.second.state = runValueFunction(paged.offsets.second.start);
                        }
                    }
                    $scope.$broadcast('update-template-nofire');
                }

                $scope.nextPaging = function () {
                    var paged = $scope.state.query.paged;
                    paged.offsets.first.state = runValueFunction(paged.offsets.first.next, paged.offsets.first.state);
                    paged.offsets.second.state = runValueFunction(paged.offsets.second.next, paged.offsets.second.state);
                    $scope.$broadcast('update-template');
                }

                $scope.previousPaging = function () {
                    var paged = $scope.state.query.paged;
                    paged.offsets.first.state = runValueFunction(paged.offsets.first.previous, paged.offsets.first.state);
                    paged.offsets.second.state = runValueFunction(paged.offsets.second.previous, paged.offsets.second.state);
                    $scope.$broadcast('update-template');
                };

                $scope.terminate = function () {
                    console.log('[' + $scope.widgetid + '] terminating...');
                    dashletcomssrv.unregisterWidget($scope.widgetid);
                    $scope.clearAsync();
                    $scope.clearAutorefreshInterval();
                    $scope.state.config.autorefresh = 'Off';
                    $scope.state.data = {};
                    $scope.state = null;
                    console.log('[' + $scope.widgetid + '] termination complete.');
                };

                $scope.unwatchAll = function () {
                    $.each($scope.state.unwatchers, function (idx, unwatcher) {
                        unwatcher();
                    });
                };

                $scope.$on('dashletinput-ready', function () {
                    if (!$scope.isAlreadyData()) {
                        $scope.fireQueryDependingOnContext();
                    }
                    $scope.loaded = true;
                });

                $scope.isAlreadyData = function () {
                    return $scope.state.data.rawresponse
                        || $scope.state.data.transformed
                        || $scope.state.gui.chartdata
                        || $scope.state.gui.tableata;
                };

                $scope.clearData = function () {
                    $scope.state.data.rawresponse = null;
                    $scope.state.data.transformed = null;
                    $scope.state.gui.chartdata = null;
                    $scope.state.gui.tableata = null;
                };

                $scope.$on('globalsettings-refreshToggle', function (event, arg) {
                    if (arg.new === true) {
                        if (!$scope.state.config.slave) {
                            $scope.state.config.autorefresh = 'On';
                        }
                    } else {
                        $scope.state.config.autorefresh = 'Off';
                    }
                });

                $scope.$on('$destroy', function () {
                    $scope.terminate();
                });
            }
        };
    });;
registerScript();

angular.module('viz-mgd-widget', ['viz-dashlet'])

    .directive('vizMgdWidget', function () {
        return {
            restrict: 'E',
            scope: {
                displaymode: '=',
                widgetid: '=',
                wstate: '=',
                state: '=',
                headersheightinput: '=',
                charttocontainerinput: '=',
                presets: '=',
                restprefix: '=',
                inputsettingscol: '='
            },
            templateUrl: resolveTemplateURL('viz-mgd-widget.js', 'viz-mgd-widget.html'),
            controller: function ($scope, $element) {

                $scope.computeHeights = function () {

                    $scope.generalThicknessOffset = 100;
                    $scope.headersheight = $scope.headersheightinput;

                    //console.log('[' + $scope.widgetid + '] headersheight: ' + $scope.headersheight);


                    if (!$scope.charttocontainerinput) {
                        $scope.charttocontainer = 30;
                    } else {
                        $scope.charttocontainer = $scope.charttocontainerinput;
                    }

                    var sHeight = window.innerHeight;
                    $scope.chartHeightSmall = (sHeight - $scope.headersheight - $scope.generalThicknessOffset) / 2 - $scope.charttocontainer;
                    $scope.chartHeightBig = (sHeight - $scope.headersheight - $scope.generalThicknessOffset) / 1 - $scope.charttocontainer;
                    $scope.chartWidthSmall = 0;
                    $scope.chartWidthBig = 0;

                    $scope.innerContainerHeightSmall = (sHeight - $scope.headersheight - $scope.generalThicknessOffset) / 2;
                    $scope.innerContainerHeightBig = (sHeight - $scope.headersheight - $scope.generalThicknessOffset) / 1;
                    $scope.innerContainerWidthSmall = 0;
                    $scope.innerContainerWidthBig = 0;

                    //console.log('[' + $scope.widgetid + '] innerContainerHeightSmall: ' + $scope.innerContainerHeightSmall);

                };

                $scope.getActualDashletWidth = function () {
                    return $element[0].children[0].children[0].offsetWidth;
                }

                $scope.updateSize = function () {
                    $scope.computeHeights();
                    var newWidth = 0.9 * $scope.getActualDashletWidth();
                    var options = $scope.state.options;
                    options.chart.width = newWidth;
                    options.innercontainer.width = newWidth - 50;

                    if ($scope.wstate.widgetwidth === 'col-md-6') {
                        options.chart.height = $scope.chartHeightSmall;
                        options.innercontainer.height = $scope.innerContainerHeightSmall;
                    }
                    else {
                        options.chart.height = $scope.chartHeightBig;
                        options.innercontainer.height = $scope.innerContainerHeightBig;
                    }

                    $scope.state.savedHeight = $scope.state.options.innercontainer.height;
                };

                $scope.startup = function () {
                    if (!$scope.state.options.innercontainer.height || $scope.state.options.innercontainer.height === 0) {
                        $(document).ready(function () {
                            $scope.resize();
                        });
                    } else {
                        //console.log('[' + $scope.widgetid + ']' + $scope.state.options.innercontainer.height + '; ' + $scope.headersheight);
                    }

                    $scope.state.savedHeight = $scope.state.options.innercontainer.height;
                    $scope.dashlettitle = $scope.state.title;
                };

                $scope.startup();

                $scope.toggleAutorefresh = function () {
                    $scope.$broadcast('globalsettings-refreshToggle', { 'new': !$scope.wstate.autorefresh });
                };

                $scope.$watch('state.config.autorefresh', function (newvalue) {
                    if (newvalue === 'On') {
                        $scope.wstate.autorefresh = true;
                    }else{
                        $scope.wstate.autorefresh = false;
                    }
                });

                $scope.toggleChevron = function () {
                    if ($scope.wstate.chevron) {
                        $scope.collapse();
                    } else {
                        $scope.restore();
                    }
                    $scope.wstate.chevron = !$scope.wstate.chevron;
                };

                $scope.saveDimensions = function () {
                    $scope.state.savedHeight = $scope.state.options.innercontainer.height;
                }

                $scope.collapse = function () {
                    $scope.saveDimensions();

                    $scope.state.options.innercontainer.height = 30;
                };

                $scope.restore = function () {
                    $scope.state.options.innercontainer.height = $scope.state.savedHeight;
                };

                $scope.resize = function () {
                    $scope.updateSize();
                    forceRedraw($scope);
                    $scope.$broadcast('resized');
                };

                $scope.extend = function () {
                    $scope.wstate.widgetwidth = 'col-md-12';
                    $(document).ready(function () {
                        $scope.resize();
                    });
                };

                $scope.moveLeft = function () {
                    $scope.$emit('mgdwidget-moveLeft', { wid: $scope.widgetid });
                    console.log('[' + $scope.widgetid + '] moveLeft');
                };

                $scope.moveRight = function () {
                    $scope.$emit('mgdwidget-moveRight', { wid: $scope.widgetid })
                    console.log('[' + $scope.widgetid + '] moveRight');
                };

                $scope.reduce = function () {
                    $scope.wstate.widgetwidth = 'col-md-6';
                    $scope.aggressiveResize();
                };

                $scope.aggressiveResize = function () {
                    $(document).ready(function () {
                        $scope.resize();
                        $scope.agressiveRefresh();
                    });
                }

                $scope.agressiveRefresh = function () {
                    $scope.moveRight();
                    forceRedraw($scope);
                    $scope.moveLeft();
                    forceRedraw($scope);
                };

                $scope.removeWidget = function () {
                    $scope.$emit('mgdwidget-remove', { wid: $scope.widgetid });
                };

                $scope.$on('resize-widget', function () {
                    $scope.resize();
                    //$scope.aggressiveResize();
                });

                $scope.$on('dashlettitle-change', function (event, arg) {
                    $scope.dashlettitle = arg.newValue;
                });
            }
        };
    });;
registerScript();
angular.module('viz-query', ['nvd3', 'ui.bootstrap', 'key-val-collection', 'rtm-controls'])
    .directive('vizQuery', function () {
        return {
            restrict: 'E',
            scope: {
                state: '=',
                presets: '=',
                inputsettingscol: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-query.html'),
            controller: function ($scope) {
            }
        }
    })
    .directive('vizView', function () {
        return {
            restrict: 'E',
            scope: {
                customheight: '=',
                state: '=',
                presets: '=',
                inputsettingscol: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-view.html'),
            controller: function ($scope) {

                if ($scope.customheight) {
                    $scope.state.options.chart.height = customheight - 10;
                }

                $scope.state.unwatchers.push($scope.$watch('state.data.transformed', function (newvalue) {
                    if (!newvalue || !newvalue.dashdata) {
                        newvalue = { dashdata: {} };
                    }
                    if ($scope.state.options.chart.type.endsWith('stackedAreaChart')) {
                        $scope.cleanupTooltips();
                    }
                    if ($scope.state.options.chart.type.endsWith('seriesTable')) {
                        $scope.state.gui.tabledata = $scope.toTable(newvalue.dashdata);
                    }
                    if ($scope.state.options.chart.type.endsWith('Chart')) {
                        $scope.state.gui.chartdata = $scope.toChart(newvalue.dashdata);
                        //$scope.applyDynamicChartConfig();
                        $scope.reapplyScales();
                    }

                    if ($scope.state.info.showraw === 'On') {
                        $scope.state.info.transformresult = angular.toJson(newvalue.dashdata);
                    }
                }, true));

                $scope.cleanupTooltips = function () {
                    while ($("div.nvtooltip").length > 1) {
                        $("div.nvtooltip").first().remove();
                    }
                };

                $scope.applyDynamicChartConfig = function () {
                    $(document).ready(function () {
                        var size = $(".nv-axisMax-y text").text().length;
                        $scope.state.options.chart.margin.left = 35 + 5 * size;

                        // race condition with margin refresh (or any other dynamic update of the chart's config)
                        // need to find a way to fix rotateYLabel issue in nvd3
                        /*
                        $(document).ready(function () {
                            $(".nv-y .tick text").attr("transform", "rotate(-40 0,14)");
                            $(".nv-axisMaxMin-y text").attr("transform", "rotate(-40 0,14)");
                        });
                        */
                    });
                }

                $scope.reapplyScales = function () {
                    $scope.state.options.chart.xDomain = eval($scope.state.options.chart.xAxis.strScale);
                    $scope.state.options.chart.yDomain = eval($scope.state.options.chart.yAxis.strScale);
                }

                $scope.$on('resized', function () {
                    //$scope.applyDynamicChartConfig();
                });

                $scope.formatPotentialTimestamp = function (value) {
                    return formatPotentialTimestamp(value);
                };

                $scope.stringToColour = function (str) {
                    return stringToColour(str);
                };

                $scope.isPagingOff = function () {
                    if ($scope.state.query.controls
                        && $scope.state.query.controls.template
                        && $scope.state.query.paged.ispaged) {
                        return $scope.state.query.paged.ispaged === 'Off';
                    } else {
                        return true;
                    }
                }

                $scope.toChart = function (data) {
                    var x = 'x', y = 'y', z = 'z';//begin,value,name
                    var retData = [];
                    var index = {};
                    var payload = data;
                    for (var i = 0; i < payload.length; i++) {
                        var curSeries = payload[i][z];
                        if (!(curSeries in index)) {
                            retData.push({
                                values: [],
                                key: curSeries,
                                color: $scope.stringToColour(curSeries),
                                strokeWidth: 3,
                                classed: 'dashed'
                            });
                            index[curSeries] = retData.length - 1;
                        }
                        retData[index[curSeries]].values.push({
                            x: payload[i][x],
                            y: payload[i][y]
                        });
                    }
                    return retData;
                };

                $scope.toTable = function (data) {
                    var x = 'x', y = 'y', z = 'z';//begin,value,name
                    var retData = [], index = {}, zlist = [];
                    var payload = data;
                    for (var i = 0; i < payload.length; i++) {
                        var curSeries = payload[i][x];
                        if (!(curSeries in index)) {
                            retData.push({
                                values: {},
                                x: curSeries,
                            });
                            index[curSeries] = retData.length - 1;
                        };
                        retData[index[curSeries]].values[payload[i][z]] = payload[i][y];
                        if (!zlist.includes(payload[i][z]))
                            zlist.push(payload[i][z]);
                    }
                    return { zlist: zlist.sort(), data: retData };
                };
            }
        };
    })
    .directive('vizTransform', function () {
        return {
            restrict: 'E',
            scope: {
                state: '=',
                presets: '=',
                inputsettingscol: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-transform.html'),
            controller: function ($scope) {
                $scope.loadTicks = function () {
                    $scope.state.options.chart.xAxis.tickFormat = eval('(' + $scope.state.options.chart.xAxis.strTickFormat + ')');
                    //$scope.state.options.chart.xAxis.tickFormat = function(d){ return 3;};
                    $scope.state.options.chart.yAxis.tickFormat = eval('(' + $scope.state.options.chart.yAxis.strTickFormat + ')');
                }

                $scope.loadScales = function () {
                    $scope.state.options.chart.xAxis.scale = eval('(' + $scope.state.options.chart.xAxis.strScale + ')');
                    $scope.state.options.chart.yAxis.scale = eval('(' + $scope.state.options.chart.yAxis.strScale + ')');
                }

                $scope.startup = function () {
                    $scope.loadTicks();
                };

                $scope.startup();
            }
        };
    })
    .directive('vizConfig', function (dashletcomssrv) {
        return {
            restrict: 'E',
            scope: {
                widgetid: '=',
                state: '=',
                presets: '=',
                inputsettingscol: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-config.html'),
            controller: function ($scope) {

                $scope.viztypes = ['seriesTable', 'singleValueTable', 'singleValueFullText', 'lineChart', 'multiBarChart', 'scatterChart', 'discreteBarChart', 'stackedAreaChart'];

                $scope.loadConfigPreset = function (preset) {
                    $scope.state.config = jsoncopy(preset);
                };

                $scope.loadMaster = function (m) {
                    $scope.$emit('master-loaded', m);
                };

                $scope.titleChange = function () {
                    $scope.$emit('dashlettitle-change', { newValue: $scope.state.title })
                };

                $scope.titleChange();



                //Master-slave

                $scope.undoMaster = function () {
                    // we shouldn't be registered if we don't have an unwatcher
                    dashletcomssrv.unregisterWidget($scope.widgetid);
                    if ($scope.unwatchMaster) {
                        //dashletcomssrv.unregisterWidget($scope.widgetid);
                        $scope.unwatchMaster();
                    }
                }

                $scope.undoSlave = function () {
                    if ($scope.unwatchSlave) {
                        $scope.unwatchSlave();
                    }
                }

                $scope.$on('coms-reset', function () {
                    if ($scope.state.config.master) {
                        $scope.state.config.master = !$scope.state.config.master;
                    }
                    $scope.undoMaster();

                    if ($scope.state.config.slave) {
                        $scope.state.config.slave = !$scope.state.config.slave;
                    }
                    $scope.undoSlave();
                });

                $scope.makeMaster = function (newValue) {
                    if (!newValue) {
                        dashletcomssrv.registerWidget($scope.widgetid, $scope.state.title);
                        //updating both values upon change on transformed for optimization/simplicity
                        // could be two distinct updates via service
                        $scope.unwatchMaster = $scope.$watch('state.data.transformed', function (newvalue) {
                            if (newvalue) {
                                dashletcomssrv.updateMasterValue($scope.widgetid, { transformed: angular.toJson(newvalue.dashdata), raw: angular.toJson($scope.state.data.rawresponse.dashdata) });
                            } else {
                                console.log('Warning: a failed transformation occured, we are not broadcasting new value to slaves.')
                            }
                        });
                    }
                    else {
                        $scope.undoMaster();
                    }
                }

                $scope.$on('isMaster-changed', function (event, newValue) {
                    $scope.makeMaster(newValue);
                });

                $scope.state.unwatchers.push($scope.$watch('state.title', function (newValue) {
                    if ($scope.state.config.master) {
                        dashletcomssrv.udpdateTitle($scope.widgetid, newValue);
                    }
                }));

                $scope.unwatchSlave = '';

                $scope.startWatchingMaster = function (masterid) {
                    if ($scope.state.config.slave) {
                        var unwatcher = $scope.$watch(function () {
                            return dashletcomssrv.buffer[masterid];
                        }, function (newvalue) {
                            if (newvalue) {
                                try {
                                    if ($scope.state.config.target) {
                                        // watcher not firing if using bracket syntax...
                                        var target = $scope.state.config.target;
                                        if (target === 'state.data.transformed') {
                                            $scope.state.data.transformed = { dashdata: JSON.parse(newvalue.transformed) };
                                        }
                                        if (target === 'state.data.rawresponse') {
                                            $scope.state.data.rawresponse = { dashdata: JSON.parse(newvalue.raw) };
                                        }
                                    } else {
                                        console.log('slave target is undefined.')
                                    }
                                } catch (e) {
                                    console.log(e);
                                }
                            } else {
                                console.log('Warning: an undefined newvalue has been read by slave with id:' + $scope.widgetid);
                            }
                        });
                        $scope.unwatchSlave = unwatcher;
                    }
                };

                $scope.state.unwatchers.push($scope.$watch('state.config.slave', function (newValue) {
                    if (!newValue) {
                        $scope.undoSlave();
                    }
                }));

                // no watching directly on the checkbox, only doing something once a master is picked
                $scope.$on('master-loaded', function (event, master) {
                    //if master already previously selected, stop watching him
                    $scope.undoSlave();
                    $scope.state.config.currentmaster = master;
                    $scope.startWatchingMaster(master.oid);
                });

                // bind service masters to config master selection list
                $scope.state.unwatchers.push($scope.$watch(function () {
                    return dashletcomssrv.masters;
                }, function (newValue) {
                    $scope.state.config.masters = newValue;
                }));

                $scope.$on('single-remove', function (event, arg) {
                    if (arg === $scope.widgetid) {
                        $scope.prepareRemove();
                    }
                });

                $scope.$on('global-remove', function (event, arg) {
                    $scope.prepareRemove();
                });

                $scope.prepareRemove = function () {
                    if ($scope.state.config.master) {
                        dashletcomssrv.unregisterWidget($scope.widgetid);
                    }
                }

                // after dashlet loaded or duplicated
                if ($scope.state.config.currentmaster) { //slave
                    // let masters register first
                    $(document).ready(function () {
                        $scope.startWatchingMaster($scope.state.config.currentmaster.oid);
                    });

                } if ($scope.state.config.master) { //master
                    $scope.makeMaster(false);
                }
            }
        }
    })
    .directive('vizInfo', function () {
        return {
            restrict: 'E',
            scope: {
                widgetid: '=',
                state: '=',
                presets: '=',
                inputsettingscol: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-info.html'),
            controller: function ($scope) {

                $scope.errorboxcolor = 'gray';

                $scope.$on('cleanup-info', function () {
                    $scope.state.info.http.rawserviceresponse = "";
                    $scope.state.info.http.rawcallbackresponse = "";
                    $scope.state.info.http.callbacksent = "";
                    $scope.state.info.http.servicesent = "";
                });

                $scope.sendSaveEvent = function () {
                    $scope.$emit('dashlet-save', jsoncopy({ oid: $scope.widgetid, state: $scope.state }));
                };

                $scope.sendCopyEvent = function () {
                    $scope.$emit('dashlet-copy', jsoncopy({ oid: $scope.widgetid, state: $scope.state }));
                };

                $scope.clearMessages = function () {
                    $scope.state.info.alert.message = "";
                    $scope.state.info.alert.counter = 0;
                };

                $scope.$on('errormessage', function (event, arg) {
                    $scope.state.info.alert.message = arg + "\n\n" + $scope.state.info.alert.message;
                    $scope.state.info.alert.counter++;
                });

                $scope.$on('clearmessages', function () {
                    $scope.clearMessages();
                });

                $scope.$watch('state.info.alert.counter', function (newvalue) {
                    if (newvalue > 0) {
                        $scope.errorboxcolor = '#ff7a00';
                    } else {
                        $scope.errorboxcolor = 'gray';
                    }
                });
            }
        }
    })
    .directive('jsonText', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attr, ngModel) {
                function into(input) {
                    return JSON.parse(input);
                }
                function out(data) {
                    return JSON.stringify(data);
                }
                ngModel.$parsers.push(into);
                ngModel.$formatters.push(out);
            }
        };
    })
    .directive('evalString', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attr, ngModel) {
                console.log('evalString!!')
                function into(input) {
                    return (function (d) { return 1; });
                }
                function out(data) {
                    return data.toString();
                }
                ngModel.$parsers.push(into);
                ngModel.$formatters.push(out);
            }
        };
    })
    .directive('vizQService', function () {
        return {
            restrict: 'E',
            scope: {
                state: '=',
                presets: '=',
                inputsettingscol: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-q-service.html'),
            controller: function ($scope) {
                $scope.initAsync = function () {
                    var savedservice = JSON.parse(angular.toJson($scope.state.query.datasource.service));
                    $scope.state.query = new DefaultAsyncQuery();
                    $scope.state.query.datasource.service = savedservice;
                }
            }
        };
    })
    .directive('vizQInput', function () {
        return {
            restrict: 'E',
            scope: {
                state: '=',
                presets: '=',
                inputsettingscol: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-q-input.html'),
            controller: function ($scope) {

                $scope.initControls = function () {
                    $scope.state.query.controls = new DefaultControls();
                    $scope.state.query.paged = new DefaultPaging();
                }

                $scope.initTemplate = function () {
                    $scope.state.query.controls.template = new DefaultTemplate();
                }

                $scope.loadQueryPreset = function (querypresetArg) {
                    var querypreset = jsoncopy(querypresetArg);
                    $scope.state.query = querypreset.query;
                }

                $scope.$watch('inputsettingscol', function (newValue) {
                    $scope.change();
                }, true);

                $scope.processTemplate = function () {
                    if ($scope.state.query && $scope.state.query.controls && $scope.state.query.controls.template) {
                        var data = "", params = "";
                        //TODO:replace doesn't really need to be exposed if it's only used as part of the Template control

                        $scope.state.data.placeholdersstate = evalDynamic($scope.mergePlaceholders());
                        if ($scope.state.query.datasource.service.preproc.replace.function) {
                            if ($scope.state.query.controls.template.templatedPayload) {
                                data = runRequestProc(
                                    $scope.state.query.datasource.service.preproc.replace.function,
                                    $scope.state.query.controls.template.templatedPayload,
                                    $scope.state.data.placeholdersstate);
                            }

                            if ($scope.state.query.controls.template.templatedParams) {
                                params = runRequestProc(
                                    $scope.state.query.datasource.service.preproc.replace.function,
                                    $scope.state.query.controls.template.templatedParams,
                                    $scope.state.data.placeholdersstate);
                            }
                        }
                        return {
                            data: data,
                            params: params
                        };
                    } else {
                        return null;
                    }
                }

                $scope.mergePlaceholders = function (placeholders) {
                    var phcopy = JSON.parse(JSON.stringify($scope.state.query.controls.template.placeholders));
                    var gscopy = JSON.parse(JSON.stringify($scope.inputsettingscol));
                    var pagingph = [];

                    if ($scope.state.query.controls.template && $scope.state.query.paged.ispaged === 'On') {
                        pagingph.push({ key: $scope.state.query.paged.offsets.first.vid, value: $scope.state.query.paged.offsets.first.state });
                        if ($scope.state.query.paged.offsets.second) {
                            pagingph.push({ key: $scope.state.query.paged.offsets.second.vid, value: $scope.state.query.paged.offsets.second.state });
                        }
                    }
                    return gscopy.concat(phcopy).concat(pagingph); // global settings dominate local placeholders
                };

                $scope.loadTemplatePreset = function (templateArg) {
                    var template = jsoncopy(templateArg);
                    $scope.state.query = template.queryTemplate;
                    if (!$scope.state.query.controls) {
                        $scope.state.query.controls = { template: {} };
                    }
                    $scope.state.query.controls.template.templatedPayload = template.templatedPayload;
                    $scope.state.query.controls.template.templatedParams = template.templatedParams;
                    $scope.state.query.controls.template.placeholders = template.placeholders;

                    // already updated due to paging event/callback
                    //$scope.change();

                    $scope.$emit('templateph-loaded');
                };

                $scope.$on('update-template-nofire', function () {
                    $scope.change();
                });

                $scope.$on('update-template', function () {
                    $scope.change();
                    $scope.$emit('template-updated');
                });

                // query about to fire
                $scope.$on('cleanup-info', function () {
                    $scope.change();
                });

                $scope.change = function () {
                    var appliedTemplate = $scope.processTemplate();
                    if (appliedTemplate) {
                        $scope.state.query.datasource.service.data = appliedTemplate.data;
                        $scope.state.query.datasource.service.params = appliedTemplate.params;
                    }
                }

                $scope.$emit('dashletinput-ready');
            }
        };
    })
    .directive('vizQPreproc', function () {
        return {
            restrict: 'E',
            scope: {
                state: '=',
                presets: '=',
                inputsettingscol: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-q-preproc.html'),
            controller: function ($scope) {
            }
        };
    })
    .directive('vizQPostproc', function () {
        return {
            restrict: 'E',
            scope: {
                state: '=',
                presets: '=',
                inputsettingscol: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-q-postproc.html'),
            controller: function ($scope) {
            }
        };
    });
registerScript();

angular.module('viz-dashboard', ['viz-mgd-widget', 'ui.bootstrap', 'dashletcomssrv'])
    .directive('vizDashboard', function () {
        return {
            restrict: 'E',
            scope: {
                dashboardid: '=',
                dstate: '=',
                displaymode: '=',
                displaytype: '=',
                presets: '=',
                topmargin: '=',
                restprefix: '='
            },
            templateUrl: resolveTemplateURL('viz-dashboard.js', 'viz-dashboard.html'),
            controller: function ($scope, $element) {
                $scope.toggleAutorefresh = function () {
                    $scope.dstate.globalsettings.autorefresh = !$scope.dstate.globalsettings.autorefresh;
                    $scope.$broadcast('globalsettings-refreshToggle', { 'new': $scope.dstate.globalsettings.autorefresh })
                };

                $scope.toggleChevron = function () {
                    $scope.dstate.globalsettings.chevron = !$scope.dstate.globalsettings.chevron;
                };

                $scope.$on('mgdwidget-remove', function (event, arg) {
                    $scope.wwrap.removeById(arg.wid);
                });

                $scope.$on('mgdwidget-moveLeft', function (event, arg) {
                    var widgetIndex = $scope.wwrap.getIndexById(arg.wid);
                    if (widgetIndex > 0) {
                        $scope.wwrap.moveFromToIndex(widgetIndex, widgetIndex - 1);
                    }
                });
                $scope.$on('mgdwidget-moveRight', function (event, arg) {
                    var widgetIndex = $scope.wwrap.getIndexById(arg.wid);
                    if (widgetIndex < $scope.wwrap.count() - 1) {
                        $scope.wwrap.moveFromToIndex(widgetIndex, widgetIndex + 1);
                    }
                });
                $scope.$on('mgdwidget-duplicate', function (event, arg) {
                    $scope.wwrap.duplicateById(arg.wid);
                });

                $scope.$on('clearwidgets', function (event, arg) {
                    if ($scope.dashboardid === arg.dashboardid) {
                        $scope.wwrap.clear();
                    }
                });

                $scope.$on('addwidget', function (event, arg) {
                    if ($scope.dashboardid === arg.dashboardid) {
                        $scope.addWidget(arg);
                    }
                });

                $scope.$on('apply-global-setting', function (event, arg) {
                    var updated = false;
                    $.each($scope.dstate.globalsettings.placeholders, function (index, item) {
                        if (item.key === arg.key) {
                            $scope.dstate.globalsettings.placeholders[index].value = arg.value;
                            $scope.dstate.globalsettings.placeholders[index].isDynamic = arg.isDynamic;
                            updated = true;
                        }
                    });
                    if (!updated) {
                        $scope.dstate.globalsettings.placeholders.push(new Placeholder(arg.key, arg.value, arg.isDynamic));
                    }
                    $(document).ready(function () {
                        $scope.$broadcast('fireQueryDependingOnContext');
                    });
                });

                $scope.$on('globalsettings-globalRefreshToggle', function (event, arg) {
                    $scope.toggleAutorefresh();
                });

                $scope.addWidget = function (arg) {
                    var widget;
                    if (!arg) {
                        widget = new DefaultWidget();
                    }
                    var newWidgetId = $scope.wwrap.addNew(widget);
                    //console.log('[d:' + $scope.dashboardid + '] adding widget: [' + newWidgetId + ']');
                };

                $(window).on('resize', function () {
                    $scope.$broadcast('resize-widget');
                });

                $scope.onstartup = function () {
                    $scope.wwrap = new IdIndexArray($scope.dstate.widgets);
                    $scope.gsautorefreshInterval = null;

                    $scope.initAuto = false;
                    $scope.$on('dashletinput-ready', function () {
                        if (!$scope.initAuto) {
                            $scope.initAuto = true;
                            if ($scope.dstate.globalsettings.autorefresh) {
                                //for compatibility with toggle..
                                $scope.dstate.globalsettings.autorefresh = false;
                                $scope.toggleAutorefresh();
                            }

                            $scope.$emit('dashboard-ready');
                        }
                    });
                }

                $scope.onstartup();

                $scope.$watchCollection('dstate.widgets', function (newvalue) {
                    $scope.onstartup();
                });
            }
        };
    })

;
registerScript();

angular.module('viz-dashboard-manager', ['viz-dashboard', 'ui.bootstrap', 'dashletcomssrv'])
    .directive('vizDashboardManager', function () {
        return {
            restrict: 'E',
            scope: {
                presets: '=',
                dashboards: '=',
                displaymode: '=',
                headermargin: '=',
                restprefix: '='
            },
            templateUrl: resolveTemplateURL('viz-dashboard.js', 'viz-dashboard-manager.html'),
            controller: function ($scope, $element) {
                if (!$scope.headermargin) {
                    $scope.topmargin = $element[0].getBoundingClientRect().top;
                }else{
                    $scope.topmargin = $scope.headermargin;
                }
                $scope.init = false;

                $scope.selectTab = function (tabIndex) {
                    $scope.mgrtabstate = tabIndex;
                };

                $scope.isTabActive = function (tabIndex) {
                    return tabIndex === $scope.mgrtabstate;
                };

                $scope.removeDashboard = function (dashboardid) {
                    //If the currently opened tab is killed
                    if ($scope.mgrtabstate === dashboardid) {
                        // if has previous, open previous
                        if ($scope.dwrap.getIndexById($scope.mgrtabstate) > 0) {
                            $scope.mgrtabstate = $scope.dwrap.getPreviousId($scope.mgrtabstate);
                        } else {// if has next, open next
                            if ($scope.dwrap.getIndexById($scope.mgrtabstate) < $scope.dwrap.count() - 1) {
                                $scope.mgrtabstate = $scope.dwrap.getNextId($scope.mgrtabstate);
                            } else {
                                // Empty session
                                $scope.mgrtabstate = null;
                            }
                        }
                    }
                    $scope.dwrap.removeById(dashboardid);
                };

                $scope.$on('dashboard-new', function (event, arg) {
                    var newdashboardid;
                    if (arg && arg.displaytype && arg.displaytype === 'exploded') {
                        newdashboardid = $scope.dwrap.addNew(new DefaultExplorationDashboard());
                    } else {
                        newdashboardid = $scope.dwrap.addNew(new DefaultDashboard());
                    }
                    $scope.mgrtabstate = newdashboardid;
                });

                $scope.$on('dashboard-clear', function () {
                    $scope.dwrap.clear();
                });

                $scope.$on('dashboard-current-addWidget', function () {
                	var curDashboard = $scope.dwrap.getById($scope.mgrtabstate);
                    var wwrap = new IdIndexArray(curDashboard.dstate.widgets);
                    wwrap.addNew(new DefaultWidget());
                });

                $scope.$on('dashboard-current-clearWidgets', function () {
                    var curDashboard = $scope.dwrap.getById($scope.mgrtabstate);
                    var wwrap = new IdIndexArray(curDashboard.dstate.widgets);
                    wwrap.clear();
                });

                //multiplexing multiple events
                $scope.$on('dashletinput-initialized', function () {
                    if (!$scope.init) {
                        $scope.init = true;
                        //$scope.$broadcast('resize-widget');
                        $scope.$emit('manager-fully-loaded');
                    }
                });

                $scope.$on('dashlet-copy', function (event, arg) {
                    $scope.clipboard = arg;
                });

                $scope.$on('dashlet-paste', function (event) {
                    if ($scope.clipboard) {
                        var newwidget = new Widget(getUniqueId(), new DefaultWidgetState(), jsoncopy($scope.clipboard.state));
                        var dashboard = $scope.dwrap.getById($scope.mgrtabstate);
                        var wwrap = new IdIndexArray(dashboard.dstate.widgets);
                        wwrap.addNew(newwidget);
                    }
                });

                $scope.onstartup = function () {
                    $scope.dwrap = new IdIndexArray($scope.dashboards);
                    if ($scope.dashboards.length > 0 && $scope.dashboards[0] && $scope.dashboards[0].oid) {
                        $scope.mgrtabstate = $scope.dashboards[0].oid;
                    }
                    $scope.$emit('manager-ready');
                }

                $scope.onstartup();

                $scope.$watchCollection('dashboards', function (newvalue, oldvalue) {
                    $scope.onstartup();
                });

                $scope.$watch('displaymode', function (newvalue) {
                    $scope.$broadcast('resize-widget');
                });
            }
        };
    });
registerScript();
angular.module('key-val-collection', ['ui.bootstrap'])
    .directive('keyValCollection', function () {
        return {
            restrict: 'E',
            scope: {
                collection: '=',
                collectionname: '='
            },
            templateUrl: resolveTemplateURL('key-val-collection.js', 'key-val-collection.html'),
            controller: function ($scope) {

                $scope.getNumber = function (num) {
                    return new Array(num);
                }

                $scope.addElement = function () {
                    $scope.collection.push({ key: '__?__', value: '?', isDynamic: false });
                    $scope.changed();
                };

                $scope.removeElement = function ($index) {
                    $scope.collection.splice($index, 1);
                    $scope.changed();
                };

                $scope.changed = function(){
                    $scope.$emit('key-val-collection-change-' + $scope.collectionname, { collection: $scope.collection });
                }

                // unused - will probably be discarded in the future, doesn't seem like clean design
                $scope.$on('force-update-' + $scope.collectionname, function(event, arg){
                    $scope.$emit('key-val-collection-change-' + $scope.collectionname, { type: 'forced', element: null, collection: $scope.collection });
                });
            }
        }
    });
registerScript();

angular.module('dashletcomssrv', [])
    .service('dashletcomssrv', function ($rootScope) {
 
        var dashletcomssrv = {};
        dashletcomssrv.buffer = {};
        dashletcomssrv.masters = {};
        dashletcomssrv.masters.array = [];
        dashletcomssrv.masters = new IdIndexArray(dashletcomssrv.masters.array, function(oid){
            //console.log('[dashletcomssrv] removing ' + oid);
        });

        dashletcomssrv.registerWidget = function (widgetid, dashlettitle) {
            dashletcomssrv.masters.addIfAbsent({'oid' : widgetid, 'title': dashlettitle});
        };

        dashletcomssrv.udpdateTitle = function (widgetid, dashlettitle) {
            dashletcomssrv.masters.getById(widgetid).title = dashlettitle;             
        };

        dashletcomssrv.unregisterWidget = function (widgetid) {
            dashletcomssrv.masters.removeIfExists(widgetid);
        };
        
        dashletcomssrv.updateMasterValue = function (widgetid, newValue) {
            dashletcomssrv.buffer[widgetid] = newValue;
        };

        return dashletcomssrv;
    });
function IdIndexArray(arrayArg) {
    if (!arrayArg) {
        throw new Error('Please provide array ref as argument.');
    }
    return {
        array: arrayArg,
        getId: function (obj) {
            return obj['oid'];
        },
        addNew: function (obj) {
            var newId = getUniqueId();
            obj['oid'] = newId;
            this.array.push(obj);
            return newId;
        },
        addExisting: function (obj) {
            this.array.push(obj);
        },
        clear: function () {
            this.array.length = 0;
        },
        getById: function (oid) {
            var index = this.getIndexById(oid);
            if (index === -1) {
                throw 'No object found with Id:' + oid;
            }
            return this.array[index];
        },
        getByIndex: function (idx) {
            return this.array[idx];
        },
        getIndexById: function (oid) {
            for (i = 0; i < this.array.length; i++) {
                if (this.array[i]['oid'] === oid) {
                    return i;
                }
            }
            return -1;
        },
        getIdByIndex: function (idx) {
            return this.array[idx]['oid'];
        },
        removeById: function (oid) {
            this.array.splice(this.getIndexById(oid), 1);
        },
        removeByIndex: function (idx) {
            var oid = this.getIdByIndex(idx);
            this.array.splice(idx, 1);
        },
        copyById: function (oid) {
            var copy = jsoncopy(this.getById(oid));
            copy['oid'] = getUniqueId();
            return copy;
        },
        duplicateById: function (oid) {
            var newId = this.addExisting(this.copyById(oid)); // pushed at the end of the array
            var copyIdx = this.getIndexById(newId);
            var originalIdx = this.getIndexById(oid);
            this.moveFromToIndex(copyIdx, originalIdx + 1);
        },
        moveFromToIndex: function (old_index, new_index) {
            this.array.splice(new_index, 0, this.array.splice(old_index, 1)[0]);
        },
        count: function () {
            return this.array.length;
        },
        getPrevious: function (oid) {
            return this.getByIndex(this.getIndexById(oid) - 1);
        },
        getPreviousId: function (oid) {
            return this.getId(this.getPrevious(oid));
        },
        getNext: function (oid) {
            return this.getByIndex(this.getIndexById(oid) + 1);
        },
        getNextId: function (oid) {
            return this.getId(this.getNext(oid));
        },
        addIfAbsent: function (obj) {
            if (!(obj['oid'])) {
                return this.addNew(obj);
            }
            var index = this.getIndexById(obj['oid']);
            if (index < 0) {
                return this.addExisting(obj);
            }
            //already present
            return index;
        },
        removeIfExists: function (oid) {
            if (!oid) {
                throw 'Cant remove object without proper oid';
            }
            var index = this.getIndexById(oid);
            if (index < 0) {
                //doesn't exist
                return -1;
            }
            //found
            return this.removeByIndex(index);
        },
        removeAll: function () {
            for (var i = 0; i < this.array.length; i++) {
                this.removeByIndex(i);
            }
        },
        getAsArray: function(){
            return this.array;
        }
    };
};;
registerScript();

angular.module('explore', ['viz-dashlet'])
    .directive('explore', function () {
        return {
            restrict: 'E',
            scope: {},
            templateUrl: resolveTemplateURL('explore.js', 'explore.html'),
            controller: function ($scope) {
                $scope.state = new ExplorationDashletState();
                $scope.presets = new StaticPresets();

                $scope.resize = function () {
                    $scope.state.options.chart.height = window.innerHeight / 3;
                };

                $(window).on('resize', function () {
                    $scope.resize();
                    $scope.$apply(function () {
                        self.value = 0;
                    });
                });


                $scope.resize();
            }
        };
    });;
registerScript();

angular.module('viz', ['viz-dashboard-manager'])
    .directive('viz', function () {
        return {
            restrict: 'E',
            scope: {},
            templateUrl: resolveTemplateURL('viz.js', 'viz.html'),
            controller: function ($scope) {
                $scope.staticPresetsInstance = new StaticPresets();
                $scope.dashboardsendpoint = [
                    new DefaultDashboard([new DefaultWidget()]),
                    new DefaultExplorationDashboard()
                ];

                $scope.$on('top.dashboard-new', function (event, arg) {
                    $scope.$broadcast('dashboard-new', arg);
                });
                
                $scope.$on('top.dashboard-clear', function () {
                    $scope.$broadcast('dashboard-clear');
                });

                $scope.$on('top.dashboard-current-addWidget', function () {
                    $scope.$broadcast('dashboard-current-addWidget');
                });
                $scope.$on('top.dashboard-current-clearWidgets', function () {
                    $scope.$broadcast('dashboard-current-clearWidgets');
                });
                $scope.$on('dashlet-save', function (event, arg) {
                    $scope.dashboardsendpoint.push(new DefaultDashboard([new Widget(getUniqueId(), new DefaultWidgetState(), arg.state)]));
                });
            }
        };
    });;
registerScript();

angular.module('viz-session-manager', ['viz-dashboard-manager', 'ui.bootstrap'])
    .directive('vizSessionManager', function () {
        return {
            restrict: 'E',
            scope: {
                presets: '=',
                dashboards: '=',
                displaymode: '=',
                headermargin: '=',
                restprefix: '=',
                currentsession: '='
            },
            templateUrl: resolveTemplateURL('viz-session-manager.js', 'viz-session-manager.html'),
            controller: function ($scope, $http, $element, $uibModal) {
                if (!$scope.dashboards) {
                    $scope.stdldashboards = [];
                }

                $scope.staticPresets = new StaticPresets();

                $scope.deriveEventName = function (sbName) {
                    return sbName.split('.')[1];
                };

                $scope.$on('sb.dashboard-new', function (event, arg) {
                    if (arg && arg === 'explore') {
                        $scope.$broadcast($scope.deriveEventName(event.name), { displaytype: 'exploded' })
                    } else {
                        $scope.$broadcast($scope.deriveEventName(event.name))
                    }
                });
                $scope.$on('sb.dashboard-clear', function (event) {
                    $scope.$broadcast($scope.deriveEventName(event.name))
                });
                $scope.$on('sb.dashboard-data-clear', function (event) {
                    $scope.$broadcast($scope.deriveEventName(event.name))
                });
                $scope.$on('sb.fireQueryDependingOnContext', function (event) {
                    $scope.$broadcast($scope.deriveEventName(event.name))
                });
                $scope.$on('sb.dashboard-current-addWidget', function (event) {
                    $scope.$broadcast($scope.deriveEventName(event.name))
                });
                $scope.$on('sb.dashboard-current-clearWidgets', function (event) {
                    $scope.$broadcast($scope.deriveEventName(event.name))
                });
                $scope.$on('sb.dashboard-configure', function (event) {
                    $scope.$broadcast($scope.deriveEventName(event.name))
                });
                $scope.$on('sb.docs', function (event) {
                    $scope.$broadcast($scope.deriveEventName(event.name))
                });
                $scope.$on('sb.saveSession', function (event) {
                    $scope.saveSession($scope.currentsession);
                });
                $scope.$on('sb.loadSession', function (event) {
                    $scope.loadSession($scope.currentsession);
                });
                $scope.$on('sb.deleteSession', function (event) {
                    $scope.deleteSession($scope.currentsession);
                });

                $scope.$on('sb.sessionSelected', function (event, arg) {
                    $scope.currentsession = arg;
                    $scope.loadSession($scope.currentsession);
                });

                $scope.$on('sb.freshSession', function (event, arg) {
                    $scope.currentsession = arg;
                    $scope.dashboards = [new DefaultDashboard()];
                });

                $scope.saveSession = function (sessionName) {
                    var serialized = angular.toJson({ name: sessionName, state: $scope.dashboards });
                    $http.post($scope.restprefix + '/viz/crud/sessions?name=' + sessionName, serialized)
                        .then(function (response) {
                            console.log('response')
                            console.log(response)
                        }, function (response) {
                            console.log('error response')
                            console.log(response)
                        });
                };

                $scope.loadSession = function (sessionName) {
                    $scope.dashboards.length = 0;
                    $http.get($scope.restprefix + '/viz/crud/sessions?name=' + sessionName)
                        .then(function (response) {
                            if (response && response.data && response.data.object.state && response.data.object.state.length > 0) {
                                $.each(response.data.object.state, function (index, item) {
                                    $scope.dashboards.push(item);
                                });
                            }
                        }, function (response) {
                            console.log('error response')
                            console.log(response)
                        });

                };

                $scope.deleteSession = function (sessionName) {
                    $http.delete($scope.restprefix + '/viz/crud/sessions?name=' + sessionName)
                        .then(function (response) {
                            console.log('response')
                            console.log(response)

                        }, function (response) {
                            console.log('error response')
                            console.log(response)
                        });

                };

                $scope.popTable = function () {
                    var $ctrl = this;
                    $ctrl.animationsEnabled = true;
                    $ctrl.tableElementParent = angular.element($element).find('sessionSearchParent');

                    var modalInstance = $uibModal.open({
                        animation: $ctrl.animationsEnabled,
                        ariaLabelledBy: 'modal-title',
                        ariaDescribedBy: 'modal-body',
                        templateUrl: resolveTemplateURL('viz-session-manager.js', 'tableModal.html'),
                        controller: 'SessionSearchModal',
                        controllerAs: '$ctrl',
                        size: 'lg',
                        appendTo: $ctrl.tableElementParent,
                        resolve: {
                            dataUrl: function () {
                                //used for client-side processing
                                //return $scope.restprefix + '/viz/crud/all/sessions';
                                //testing
                                //return '/test/mocks/dtbackend.txt';
                                //prod
                                return $scope.restprefix + '/viz/crud/paged/sessions';
                            },

                            tableElementParent: function () {
                                return $ctrl.tableElementParent;
                            }
                        }
                    });

                    modalInstance.result.then(function (selectedItem) {
                        $scope.$emit('sb.sessionSelected', selectedItem[0]);
                    }, function () {
                        $log.info('Modal dismissed at: ' + new Date());
                    });
                };

                $scope.popNewSession = function () {
                    var $ctrl = this;
                    $ctrl.animationsEnabled = true;
                    $ctrl.tableElementParent = angular.element($element).find('sessionNewParent');

                    var modalInstance = $uibModal.open({
                        animation: $ctrl.animationsEnabled,
                        ariaLabelledBy: 'modal-title',
                        ariaDescribedBy: 'modal-body',
                        templateUrl: resolveTemplateURL('viz-session-manager.js', 'singleInputModal.html'),
                        controller: 'SingleInputModal',
                        controllerAs: '$ctrl',
                        size: 'sm',
                        appendTo: $ctrl.tableElementParent,
                        resolve: {
                            tableElementParent: function () {
                                return $ctrl.tableElementParent;
                            }
                        }
                    });

                    modalInstance.result.then(function (selectedItem) {
                        $scope.$emit('sb.freshSession', selectedItem);
                    }, function () {
                    });
                };
            }
        };
    })
    .controller('SingleInputModal', function ($scope, $uibModalInstance, tableElementParent) {
        var $ctrl = this;
        $ctrl.selected = "";

        $ctrl.ok = function () {
            $uibModalInstance.close($scope.selected);
        };

        $ctrl.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    })
    .controller('SessionSearchModal', function ($scope, $uibModalInstance, tableElementParent, dataUrl) {
        var $ctrl = this;
        $ctrl.selected = "";

        $(document).ready(function () {
            $ctrl.tableElement = angular.element(tableElementParent).find('table');

            $ctrl.table = $ctrl.tableElement.DataTable({
                processing: true,
                serverSide: true,
                ajax: {
                    url: dataUrl,
                    type: 'POST'
                },
                select: true,
                order: [[0, "asc"]],
            });

            $ctrl.tableElement.on('click', 'tr', function () {
                $ctrl.selected = $ctrl.table.row(this).data();
            });
        });

        $ctrl.ok = function () {
            $uibModalInstance.close($ctrl.selected);
        };

        $ctrl.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    })
    .directive('vizToolbar', function () {
        return {
            restrict: 'E',
            scope: {
                dashboards: '=',
                restprefix: '='
            },
            templateUrl: resolveTemplateURL('viz-session-manager.js', 'viz-toolbar.html'),
            controller: function ($scope) {

            }
        };
    })

// hack to suppress DataTable warning
// see http://stackoverflow.com/questions/11941876/correctly-suppressing-warnings-in-datatables
window.alert = (function () {
    var nativeAlert = window.alert;
    return function (message) {
        message.indexOf("DataTables warning") === 0 ?
            console.warn(message) :
            nativeAlert(message);
    }
})();;
if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(search, this_len) {
        if (this_len === undefined || this_len > this.length) {
            this_len = this.length;
        }
        return this.substring(this_len - search.length, this_len) === search;
    };
}

if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
        value: function(search, rawPos) {
            var pos = rawPos > 0 ? rawPos|0 : 0;
            return this.substring(pos, pos + search.length) === search;
        }
    });
}

if (!String.prototype.includes) {
    String.prototype.includes = function(search, start) {
      'use strict';
  
      if (search instanceof RegExp) {
        throw TypeError('first argument must not be a RegExp');
      } 
      if (start === undefined) { start = 0; }
      return this.indexOf(search, start) !== -1;
    };
}

if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
      value: function (searchElement, fromIndex) {
  
        // 1. Let O be ? ToObject(this value).
        if (this == null) {
          throw new TypeError('"this" is null or not defined');
        }
  
        var o = Object(this);
  
        // 2. Let len be ? ToLength(? Get(O, "length")).
        var len = o.length >>> 0;
  
        // 3. If len is 0, return false.
        if (len === 0) {
          return false;
        }
  
        // 4. Let n be ? ToInteger(fromIndex).
        //    (If fromIndex is undefined, this step produces the value 0.)
        var n = fromIndex | 0;
  
        // 5. If n ≥ 0, then
        //  a. Let k be n.
        // 6. Else n < 0,
        //  a. Let k be len + n.
        //  b. If k < 0, let k be 0.
        var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
  
        function sameValueZero(x, y) {
          return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
        }
  
        // 7. Repeat, while k < len
        while (k < len) {
          // a. Let elementK be the result of ? Get(O, ! ToString(k)).
          // b. If SameValueZero(searchElement, elementK) is true, return true.
          // c. Increase k by 1.
          if (sameValueZero(o[k], searchElement)) {
            return true;
          }
          k++;
        }
  
        // 8. Return false
        return false;
      }
    });
  }