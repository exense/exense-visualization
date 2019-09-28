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
    //console.log(JSON.stringify(vizScripts));
};
registerScript();

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

var setIntervalDefault = 5000;

var runResponseProc = function (postProc, response) {
    return eval('(' + postProc + ')(response)');
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
    return JSON.parse(JSON.stringify(obj));
};
function DefaultChartOptions(chartHeight, chartWidth, innerContainerHeight, innerContainerWidth, chartType) {
    return {
        innercontainer: {
            height: innerContainerHeight,
            width: innerContainerWidth,
        },
        chart: {
            type: chartType,
            height: chartHeight,
            width: chartWidth,
            margin: {
                top: 20,
                right: 20,
                bottom: 40,
                left: 55
            },
            x: function (d) { return d.x; },
            y: function (d) { return d.y; },
            useInteractiveGuideline: true,
            dispatch: {
                stateChange: function (e) { console.log("stateChange"); },
                changeState: function (e) { console.log("changeState"); },
                tooltipShow: function (e) { console.log("tooltipShow"); },
                tooltipHide: function (e) { console.log("tooltipHide"); }
            },
            xAxis: {
                axisLabel: 'Time (ms)'
            },
            yAxis: {
                axisLabel: 'y',
                tickFormat: function (d) {
                    return d3.format('.02f')(d);
                },
                axisLabelDistance: -10
            },
            showLegend: false,
            callback: function (chart) {
                //console.log("!!! lineChart callback !!!");
            }
        }
    };
};

function DefaultDashboard(widgets) {
    return {
        title: 'New dashboard',
        widgets: new IdIndexArray(widgets, function (oid) {
            console.log('[widgets] ' + oid + '--default removal--');
        }),
        mgrstate: {
            globalsettings: [{ "key": "__eId__", "value": "??", "isDynamic": false }],
            globalsettingsname: 'Global Settings',
            globalsettingschevron: false,
            globalsettingsautorefresh: false
        }
    };
}

function DefaultWidget(displaymode, presets, chartHeightSmall, chartWidthSmall, innerContainerHeightSmall, innerContainerWidthSmall) {
    return {
        widgetWidth: 'col-md-6',
        state: {
            title: 'New dashlet',
            tabindex: 0,
            data: {
                transformed: [],
                state: {}
            },
            shared: {
                presets: presets,
                displaymode: displaymode,
                options: new DefaultChartOptions(chartHeightSmall, chartWidthSmall, innerContainerHeightSmall, innerContainerWidthSmall,
                    'lineChart'),
                config: {
                    dashlettitle: 'New Dashlet',
                    autorefresh: 'Off',
                    barchevron: true,
                    master: false,
                    slave: false,
                    masterinput: 'empty',
                    slaveoutput: 'empty too'
                },
                global: {},
                http: {}
            },
            query: {
                inputtype: "Raw",
                type: "Simple",
                datasource: {
                    service: {
                        method: "Get",
                        controls: {}
                    }
                }
            }
        }
    };
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
    .directive('vizDashlet', function ($rootScope) {
        return {
            restrict: 'E',
            scope: {
                options: '=',
                widgetid: '=',
                state: '='
            },
            templateUrl: resolveTemplateURL('viz-dashlet.js', 'viz-dashlet.html'),
            controller: function ($scope, $element, $http, dashletcomssrv) {

                $scope.selectTab = function (tabIndex) {
                    $scope.state.tabindex = tabIndex;
                };

                $scope.isTabActive = function (tabIndex) {
                    return tabIndex === $scope.state.tabindex;
                };

                $scope.toggleBarchevronToConf = function () {
                    $scope.state.shared.config.barchevron = !$scope.state.shared.config.barchevron;
                }

                $scope.toggleBarchevronToViz = function () {
                    //Not firing our own query if slave, just listening to data
                    if (!$scope.state.shared.config.slave) {
                        $scope.fireQuery();
                    }
                    $scope.state.shared.config.barchevron = !$scope.state.shared.config.barchevron;
                }

                // Query firing
                $scope.isOngoingQuery = false;
                $scope.autorefreshInterval = null;

                $scope.fireQuery = function () {
                    try {
                        $scope.isOngoingQuery = true;
                        var srv = $scope.state.query.datasource.service;
                        if(!srv.params){
                            srv.params = ""; // prevent "undefined" string from being concatenated
                        }
                        $scope.state.shared.http.servicesent = 'url :' + JSON.stringify(srv.url + srv.params) + '; payload:' + JSON.stringify(srv.data);
                        $scope.executeHttp(srv.method, srv.url+srv.params, srv.data, $scope.dispatchSuccessResponse, srv, $scope.dispatchErrorResponse);
                    } catch (e) {
                        console.log('exception thrown while firing query: ' + e);
                    }
                };

                $scope.dispatchAsync = function (response) {
                    console.log('async:' + JSON.stringify(response));
                };

                $scope.dispatchErrorResponse = function (response) {
                    console.log('error:' + JSON.stringify(response));
                    if ($scope.asyncInterval) {
                        clearInterval($scope.asyncInterval);
                    }
                    $scope.isOngoingQuery = false;
                };

                $scope.executeHttp = function (method, url, payload, successcallback, successTarget, errorcallback) {
                    console.log('executeHttp')
                    if (method === 'Get') { $http.get(url).then(function (response) { successcallback(response, successTarget); }, function (response) { errorcallback(response); }); }
                    if (method === 'Post') { $http.post(url, payload).then(function (response) { successcallback(response, successTarget); }, function (response) { errorcallback(response); }); }
                };

                $scope.dispatchSuccessResponse = function (response, successTarget) {
                    $scope.isOngoingQuery = false;
                    if ($scope.state.query.type === 'Simple') {
                        $scope.loadData(response, successTarget)
                    }
                    if ($scope.state.query.type === 'Async') {
                        var scallback = $scope.state.query.datasource.callback;
                        //$scope.state.data.serviceraw = response;
                        $scope.state.shared.http.rawserviceresponse = JSON.stringify(response);
                        if ($scope.state.query.datasource.service.postproc.save) {
                            $scope.state.data.state = runResponseProc($scope.state.query.datasource.service.postproc.save.function, response);
                        }
                        var datatosend = scallback.data;
                        var urltosend = scallback.url;
                        if (scallback.preproc.replace) {
                            if (scallback.preproc.replace.target === 'data') {
                                datatosend = JSON.parse(runRequestProc(scallback.preproc.replace.function, datatosend, $scope.state.data.state));
                            } else {
                                if (scallback.preproc.replace.target === 'url') {
                                    urltosend = JSON.parse(runRequestProc(scallback.preproc.replace.function, urltosend, $scope.state.data.state));
                                }
                            }
                        }

                        $scope.state.shared.http.callbacksent = 'url :' + JSON.stringify(urltosend) + '; payload:' + JSON.stringify(datatosend);
                        var executionFunction = function () {
                            $scope.executeHttp(scallback.method, urltosend, datatosend, $scope.loadData, scallback, $scope.dispatchErrorResponse)
                        };
                        $scope.asyncInterval = setInterval(executionFunction,setIntervalDefault);
                        executionFunction(); //execute once immmediately;
                    }
                }

                $scope.loadData = function (response, proctarget) {
                    if ($scope.state.query.type === 'Simple') {
                        //$scope.state.data.serviceraw = response;
                        $scope.state.shared.http.rawserviceresponse = JSON.stringify(response);
                    }
                    if ($scope.state.query.type === 'Async') {
                        if ($scope.asyncInterval) {
                            try {
                                if (runResponseProc($scope.state.query.datasource.callback.postproc.asyncEnd.function, response)) {
                                    clearInterval($scope.asyncInterval);
                                }
                            } catch (e) {
                                console.log(e);
                                clearInterval($scope.asyncInterval);
                            }
                        }
                        //$scope.state.data.callbackraw = response;
                        $scope.state.shared.http.rawcallbackresponse = JSON.stringify(response);
                    }
                    $scope.state.data.transformed = runResponseProc(proctarget.postproc.transform.function, response);
                    //console.log($scope.state.data);
                };

                $scope.loadDataAsSlave = function (transformed) {
                    $scope.state.data.transformed = transformed;
                }

                $scope.$on('autorefresh-toggle', function (event, arg) {
                    if (arg.newValue == true) {
                        $scope.autorefreshInterval = setInterval(function () {
                            if (!$scope.isOngoingQuery) {
                                try {
                                    $scope.fireQuery();
                                } catch (e) {
                                    console.log('exception thrown while firing query: ' + e);
                                    $scope.isOngoingQuery = false;
                                }
                            }
                        },
                            setIntervalDefault);
                    } else {
                        clearInterval($scope.autorefreshInterval);
                    }
                });

                $scope.$on('templateph-loaded', function () {
                    $scope.initPaging();
                });

                // Paging

                $scope.$on('firenext', function () {
                    console.log('firenext')
                    $scope.nextPaging();
                    $scope.fireQuery();
                });

                $scope.$on('fireprevious', function () {
                    console.log('fireprevious')
                    $scope.previousPaging();
                    $scope.fireQuery();
                });
                
                $scope.initPaging = function () {
                    var curtmplt = $scope.state.query.controls.template;
                    if (curtmplt.paged
                        && curtmplt.paged.offsets
                        && curtmplt.paged.offsets.first) {
                        curtmplt.paged.offsets.first.state = runValueFunction(curtmplt.paged.offsets.first.start);
                        console.log(curtmplt.paged.offsets.first.state);
                        if (curtmplt.paged.offsets.second) {
                            curtmplt.paged.offsets.second.state = runValueFunction(curtmplt.paged.offsets.second.start);
                        }
                    }
                }

                $scope.nextPaging = function () {
                    var curtmplt = $scope.state.query.controls.template;
                    console.log('firstState=' + curtmplt.paged.offsets.first.state);
                    curtmplt.paged.offsets.first.state = runValueFunction(curtmplt.paged.offsets.first.next, curtmplt.paged.offsets.first.state);
                    console.log('newfirstState=' + curtmplt.paged.offsets.first.state);
                    curtmplt.paged.offsets.second.state = runValueFunction(curtmplt.paged.offsets.second.next, curtmplt.paged.offsets.second.state);
                }

                $scope.previousPaging = function () {
                    var curtmplt = $scope.state.query.controls.template;
                    curtmplt.paged.offsets.first.state = runValueFunction(curtmplt.paged.offsets.first.previous, curtmplt.paged.offsets.first.state);
                    curtmplt.paged.offsets.second.state = runValueFunction(curtmplt.paged.offsets.second.previous, curtmplt.paged.offsets.second.state);
                }
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
                options: '=',
                widgetwidth: '=',
                widgetid: '=',
                state: '='
            },
            templateUrl: resolveTemplateURL('viz-mgd-widget.js', 'viz-mgd-widget.html'),
            controller: function ($scope, $element) {
                $scope.currentstate = JSON.parse(JSON.stringify($scope.state));
                $scope.state.shared.chevron = true;
                $scope.state.shared.savedHeight = $scope.state.shared.options.innercontainer.height;
                $scope.state.shared.options.innercontainer.offset = 50;
                $scope.dashlettitle = $scope.state.title;

                $scope.toggleChevron = function () {
                    if ($scope.state.shared.chevron) {
                        $scope.collapse();
                    } else {
                        $scope.restore();
                    }
                    $scope.state.shared.chevron = !$scope.state.shared.chevron;
                };

                $scope.collapse = function () {
                    $scope.state.shared.savedHeight = $scope.state.shared.options.innercontainer.height;
                    $scope.state.shared.savedOffset = $scope.state.shared.options.innercontainer.offset;
                    $scope.state.shared.options.innercontainer.height = 30;
                    $scope.state.shared.options.innercontainer.offset = 0;
                };

                $scope.restore = function () {
                    $scope.state.shared.options.innercontainer.height = $scope.state.shared.savedHeight;
                    $scope.state.shared.options.innercontainer.offset = $scope.state.shared.savedOffset;
                };

                $scope.$on('dashlettitle-change', function (event, arg) {
                    $scope.dashlettitle = arg.newValue;
                });

                $scope.getActualDashletWidth = function () {
                    return $element[0].children[0].children[0].offsetWidth;
                }

                //TODO: this will be done once per dashlet in every dashboard
                // we must find a way to run this only once
                // from whichever dashlet exists in the dashboard 
                $(window).on('resize', function () {
                    $scope.resizeSingle();
                });

                $scope.resizeSingle = function () {
                    $scope.$emit('single-resize', {wid: $scope.widgetid, newsize: 0.8 * $scope.getActualDashletWidth() });
                };

                $scope.emitExtend = function () {
                    $scope.$emit('mgdwidget-extend', { wid: $scope.widgetid });
                    $(document).ready(function () {
                        $scope.resizeSingle();
                    });
                };

                $scope.emitReduce = function () {
                    $scope.$emit('mgdwidget-reduce', { wid: $scope.widgetid });
                    $(document).ready(function () {
                        $scope.resizeSingle();
                    });
                };

                $(document).ready(function () {
                    $scope.resizeSingle();
                });

                $scope.removeWidget = function(){
                    $scope.$emit('mgdwidget-remove', {wid: $scope.widgetid});
                }
            }
        };
    });;
registerScript();
angular.module('viz-query', ['nvd3', 'ui.bootstrap', 'key-val-collection', 'rtm-controls'])
    .directive('vizQuery', function () {
        return {
            restrict: 'E',
            scope: {
                formwidth: '=',
                state: '='
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
                options: '=',
                state: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-view.html'),
            controller: function ($scope) {
                $scope.$watch('state.data.transformed', function () {
                    if ($scope.state.shared.options.chart.type === 'table')
                        $scope.tableData = $scope.toTable($scope.state.data.transformed);
                    if ($scope.state.shared.options.chart.type.endsWith('Chart'))
                        $scope.chartData = $scope.toChart($scope.state.data.transformed);
                });

                $scope.isPagingOff = function () {
                    if ($scope.state.query.controls
                        && $scope.state.query.controls.template
                        && $scope.state.query.paged.ispaged) {
                        return $scope.state.query.paged.ispaged === 'Off';
                    } else {
                        return true;
                    }
                }

                $scope.stringToColour = function (i) {
                    var num = (i + 1) * 500000;
                    if ((i % 2) == 0) {
                        num = num * 100;
                    }
                    num >>>= 0;
                    var b = num & 0xFF,
                        g = (num & 0xFF00) >>> 8 % 255,
                        r = (num & 0xFF0000) >>> 16 % 255;
                    return "rgb(" + [r, g, b].join(",") + ")";
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
                                color: $scope.stringToColour(i),
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
                options: '=',
                state: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-transform.html'),
            controller: function ($scope) {

            }
        };
    })
    .directive('vizConfig', function (dashletcomssrv) {
        return {
            restrict: 'E',
            scope: {
                formwidth: '=',
                widgetid: '=',
                state: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-config.html'),
            controller: function ($scope) {

                $scope.state.shared.config.dashlettitle = $scope.state.title;

                $scope.$on('globalsettings-refreshToggle', function (event, arg) {
                    if (arg.new) {
                        if (!$scope.state.shared.config.slave) {
                            $scope.state.shared.config.autorefresh = 'On';
                        }
                    } else {
                        $scope.state.shared.config.autorefresh = 'Off';
                    }
                });

                $scope.loadConfigPreset = function (preset) {
                    $scope.currentconfig = preset;
                    $scope.state.shared.config = $scurrentconfig;
                };

                $scope.loadMaster = function (m) {
                    $scope.$emit('master-loaded', m);
                };

                $scope.titleChange = function () {
                    $scope.$emit('dashlettitle-change', { newValue: $scope.state.shared.config.dashlettitle })
                };

                $scope.titleChange();



                //Master-slave
                
                $scope.undoMaster = function () {
                    console.log($scope.widgetid + ': undoMaster')
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
                    if ($scope.state.shared.config.master) {
                        $scope.state.shared.config.master = !$scope.state.shared.config.master;
                    }
                    $scope.undoMaster();

                    if ($scope.state.shared.config.slave) {
                        $scope.state.shared.config.slave = !$scope.state.shared.config.slave;
                    }
                    $scope.undoSlave();
                });

                // clean up when slave unchecked
                // state.shared.config.slave

                $scope.$on('isMaster-changed', function (event, newValue) {
                    if (!newValue) {
                        console.log('registering dashlet with id:' + $scope.widgetid);
                        dashletcomssrv.registerWidget($scope.widgetid, $scope.state.shared.config.dashlettitle);
                        $scope.unwatchMaster = $scope.$watch('state.data.transformed', function (newValue) {
                            dashletcomssrv.updateMasterValue($scope.widgetid, angular.toJson(newValue));
                        });
                    }
                    else {
                        $scope.undoMaster();
                    }
                });

                $scope.$watch('state.shared.config.dashlettitle', function (newValue) {
                    if ($scope.state.shared.config.master) {
                        dashletcomssrv.udpdateTitle($scope.widgetid, newValue);
                    }
                });

                $scope.unwatchSlave = '';

                $scope.startWatchingMaster = function (masterid) {
                    if ($scope.state.shared.config.slave) {
                        var unwatcher = $scope.$watch(function () {
                            return dashletcomssrv.buffer[masterid];
                        }, function (newValue) {
                            // Event somehow not propagating right, setting value directly for now
                            // Update: event was not propagating due to controller out of scope
                            // This is not an issue anymore with most responsibilities at dashlet level
                            //$scope.$broadcast('slavedata-received', parsed);
                            console.log('newValue')
                            console.log(newValue);
                            $scope.state.data.transformed = JSON.parse(newValue);
                        });
                        $scope.unwatchSlave = unwatcher;
                    }
                };

                $scope.$watch('state.shared.config.slave', function (newValue) {
                    if (!newValue) {
                        $scope.undoSlave();
                    }
                });

                // no watching directly on the checkbox, only doing something once a master is picked
                $scope.$on('master-loaded', function (event, master) {
                    //if master already previously selected, stop watching him
                    $scope.undoSlave();
                    $scope.state.shared.config.currentmaster = master;
                    $scope.startWatchingMaster(master.oid);
                });

                // bind service masters to config master selection list
                $scope.$watch(function () {
                    return dashletcomssrv.masters;
                }, function (newValue) {
                    $scope.state.shared.config.masters = newValue;
                });

                $scope.$on('single-remove', function (event, arg) {
                    if (arg === $scope.widgetid) {
                        console.log('single-remove targeting ' + arg + ' was received.');
                        $scope.prepareRemove();
                    }
                });

                $scope.$on('global-remove', function (event, arg) {
                    $scope.prepareRemove();
                });

                $scope.prepareRemove = function () {
                    console.log('prepareRemove called.')
                    if ($scope.state.shared.config.master) {
                        dashletcomssrv.unregisterWidget($scope.widgetid);
                    }
                }

                // after dashlet loaded or duplicated
                if ($scope.state.shared.config.currentmaster) { //slave
                    $scope.startWatchingMaster($scope.state.shared.config.currentmaster.oid);
                } if ($scope.state.shared.config.master) { //master
                    //this is only an attempt. reregistration is avoided at service level
                    dashletcomssrv.registerWidget($scope.widgetid, $scope.state.shared.config.dashlettitle);
                }
            }
        }
    })
    .directive('vizInfo', function () {
        return {
            restrict: 'E',
            scope: {
                formwidth: '=',
                state: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-info.html'),
            controller: function ($scope) { }
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
    .directive('vizQService', function () {
        return {
            restrict: 'E',
            scope: {
                options: '=',
                state: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-q-service.html'),
            controller: function ($scope) {
            }
        };
    })
    .directive('vizQInput', function () {
        return {
            restrict: 'E',
            scope: {
                options: '=',
                state: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-q-input.html'),
            controller: function ($scope) {

                $scope.globalsettings = [];

                $scope.loadQueryPreset = function (querypreset) {
                    $scope.state.query = querypreset.query;
                }

                $scope.$on('key-val-collection-change-Placeholders', function (event, arg) {
                    $scope.templateplaceholders = arg.collection;
                    $scope.change(false);
                });

                $scope.processTemplate = function (placeholders) {
                    var data = runRequestProc(
                        $scope.state.query.datasource.service.preproc.replace.function,
                        $scope.state.query.controls.template.templatedPayload,
                        evalDynamic($scope.mergePlaceholders()));

                    var params = runRequestProc(
                        $scope.state.query.datasource.service.preproc.replace.function,
                        $scope.state.query.controls.template.templatedParams,
                        evalDynamic($scope.mergePlaceholders()));

                    return {
                        data: data,
                        params: params
                    };
                }

                // integration with outer settings via events
                $scope.$on('globalsettings-change', function (event, arg) {
                    $scope.globalsettings = arg.collection;

                    // ignoring case where no template has been loaded yet
                    if ($scope.state.query.controls.template) {
                        $scope.change(arg.async);
                    }
                });

                $scope.mergePlaceholders = function (placeholders) {
                    var phcopy = JSON.parse(JSON.stringify($scope.state.query.controls.template.placeholders));
                    var gscopy = JSON.parse(JSON.stringify($scope.globalsettings));
                    var pagingph = [];
                    console.log($scope.state)
                    if ($scope.state.query.controls.template && $scope.state.query.paged.ispaged === 'On') {
                        pagingph.push({ key: $scope.state.query.paged.offsets.first.vid, value: $scope.state.query.paged.offsets.first.state });
                        pagingph.push({ key: $scope.state.query.paged.offsets.second.vid, value: $scope.state.query.paged.offsets.second.state });
                    }
                    console.log('merging paging:')
                    console.log(pagingph)
                    return gscopy.concat(phcopy).concat(pagingph); // global settings dominate local placeholders
                };

                $scope.loadTemplatePreset = function (template) {
                    $scope.state.query = template.queryTemplate;
                    if (!$scope.state.query.controls) {
                        $scope.state.query.controls = { template: {} };
                    }
                    $scope.state.query.controls.template.templatedPayload = template.templatedPayload;
                    $scope.state.query.controls.template.templatedParams = template.templatedParams;
                    $scope.state.query.controls.template.placeholders = template.placeholders;

                    $scope.$emit('templateph-loaded');
                };

                $scope.change = function (async) {
                    var appliedTemplate = $scope.processTemplate();
                    $scope.state.query.datasource.service.data = appliedTemplate.data;
                    $scope.state.query.datasource.service.params = appliedTemplate.params;
                }
            }
        };
    })
    .directive('vizQPreproc', function () {
        return {
            restrict: 'E',
            scope: {
                options: '=',
                state: '='
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
                options: '=',
                state: '='
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
                dashboard: '=',
                dashboardid: '=',
                displaymode: '=',
                presets: '=',
                mgrstate: '='
            },
            templateUrl: resolveTemplateURL('viz-dashboard.js', 'viz-dashboard.html'),
            controller: function ($scope, dashletcomssrv) {

                $scope.wwrap = $scope.dashboard.widgets;

                // load time case
                if ($scope.mgrstate.globalsettingsautorefresh) {
                    $scope.toggleAutorefresh();
                }

                $scope.toggleAutorefresh = function () {
                    $scope.mgrstate.globalsettingsautorefresh = !$scope.mgrstate.globalsettingsautorefresh;
                    if ($scope.mgrstate.globalsettingsautorefresh) {
                        $scope.addInterval();
                    } else {
                        $scope.removeInterval();
                    }
                    $scope.$broadcast('globalsettings-refreshToggle', { 'new': $scope.mgrstate.globalsettingsautorefresh })
                };

                $scope.addInterval = function () {
                    $scope.mgrstate.gsautorefreshInterval = setInterval(function () {
                        $scope.$broadcast('globalsettings-change', { 'collection': $scope.mgrstate.globalsettings, async: true });
                    }, setIntervalDefault);
                }

                $scope.removeInterval = function () {
                    clearInterval($scope.mgrstate.gsautorefreshInterval);
                }

                $scope.$on('key-val-collection-change-Global Settings', function (event, arg) {
                    arg.async = false;
                    $scope.$broadcast('globalsettings-change', arg);
                });

                // Should not be necessary, just "cache locally" in component until GSettingd change
                // and make sure that GSettings are sent via ready/go events upon loading the components
                /*
                $scope.$on('templateph-loaded', function () {
                    $scope.$broadcast('globalsettings-change', { 'collection': $scope.mgrstate.globalsettings });
                });
                */
               
                $scope.toggleChevron = function () {
                    $scope.mgrstate.globalsettingschevron = !$scope.mgrstate.globalsettingschevron;
                };

                $scope.$on('mgdwidget-reduce', function (event, arg) {
                    var widget = $scope.wwrap.getById(arg.wid);
                    widget.widgetWidth = 'col-md-6';
                    var options = widget.state.shared.options;
                    options.chart.height = $scope.chartHeightSmall;
                    options.chart.width = $scope.chartWidthSmall;
                    options.innercontainer.height = $scope.innerContainerHeightSmall;
                    options.innercontainer.width = $scope.innerContainerWidthSmall;
                });
                $scope.$on('mgdwidget-extend', function (event, arg) {
                    var widget = $scope.wwrap.getById(arg.wid);
                    widget.widgetWidth = 'col-md-12';
                    var options = widget.state.shared.options;
                    options.chart.height = $scope.chartHeightBig;
                    options.chart.width = $scope.chartWidthBig;
                    options.innercontainer.height = $scope.innerContainerHeightBig;
                    options.innercontainer.width = $scope.innerContainerWidthBig;
                });
                $scope.$on('mgdwidget-remove', function (event, arg) {
                    dashletcomssrv.unregisterWidget(arg.wid);
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
                        var newWidgetId = $scope.wwrap.addNew(new DefaultWidget($scope.displaymode, $scope.presets, $scope.chartHeightSmall, $scope.chartWidthSmall, $scope.innerContainerHeightSmall, $scope.innerContainerWidthSmall));
                    }
                });

                $scope.computeHeights = function () {
                    var sHeight = window.innerHeight;

                    // parameterize via arguments or server-originating conf & promise?
                    $scope.headersHeight = 250;
                    $scope.chartToContainer = 35;
                    // $scope.chartHeightSmall = 250;

                    $scope.chartHeightSmall = (sHeight - $scope.headersHeight) / 2 - $scope.chartToContainer;
                    $scope.chartHeightBig = sHeight - ($scope.headersHeight - 80) - $scope.chartToContainer;
                    $scope.chartWidthSmall = 0;
                    $scope.chartWidthBig = 0;
                    $scope.innerContainerHeightSmall = (sHeight - $scope.headersHeight) / 2;
                    $scope.innerContainerHeightBig = sHeight - ($scope.headersHeight - 80);
                    $scope.innerContainerWidthSmall = 0;
                    $scope.innerContainerWidthBig = 0;
                };

                $scope.computeHeights();

                $scope.$on('single-resize', function (event, arg) {
                    $(document).ready(function () {
                        $scope.updateSingleChartSize(arg.wid, arg.newsize);
                    });

                });

                $scope.updateSingleChartSize = function (wId, newWidth) {

                    //should only be done once at manager level
                    $scope.computeHeights();
                    var widget = $scope.wwrap.getById(wId);
                    var options = widget.state.shared.options;
                    options.chart.width = newWidth;
                    options.innercontainer.width = newWidth - 50;

                    if (widget.widgetWidth === 'col-md-6') {
                        options.chart.height = $scope.chartHeightSmall;
                        options.innercontainer.height = $scope.innerContainerHeightSmall;
                    }
                    else {
                        options.chart.height = $scope.chartHeightBig;
                        options.innercontainer.height = $scope.innerContainerHeightBig;
                    }
                    $scope.forceRedraw();
                };

                $scope.forceRedraw = function () {
                    //force new angular digest
                    $scope.$apply(function () {
                        self.value = 0;
                    });
                };

                $scope.$emit('dashboard-ready');
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
                displaymode: '='
            },
            templateUrl: resolveTemplateURL('viz-dashboard.js', 'viz-dashboard-manager.html'),
            controller: function ($scope, dashletcomssrv) {
                $scope.dwrap = new IdIndexArray($scope.dashboards);

                // default tab (1st)
                if ($scope.dashboards.length > 0 && $scope.dashboards[0] && $scope.dashboards[0].oid) {
                    $scope.mgrtabstate = $scope.dashboards[0].oid;
                }

                $scope.selectTab = function (tabIndex) {
                    $scope.mgrtabstate = tabIndex;
                };

                $scope.isTabActive = function (tabIndex) {
                    return tabIndex === $scope.mgrtabstate;
                };

                $scope.$on('removeDashboard', function (event, arg) {
                    //If the currently opened tab is killed
                    if ($scope.mgrtabstate === arg) {
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
                    $.each($scope.dwrap.getById(arg).widgets.getAsArray(), function(idx, value){
                        dashletcomssrv.unregisterWidget(value.oid);
                    })
                    $scope.dwrap.removeById(arg);
                });

                $scope.$on('dashboard-new', function (event, arg) {
                    $scope.dwrap.addNew(new DefaultDashboard([]));
                    $scope.mgrtabstate = $scope.dwrap.getId($scope.dwrap.getByIndex($scope.dwrap.count() - 1));
                });

                $scope.$on('dashboard-clear', function () {
                    $scope.dwrap.clear();
                });

                $scope.$on('dashboard-current-addWidget', function () {
                    $scope.$broadcast('addwidget', { dashboardid: $scope.mgrtabstate });
                });
                $scope.$on('dashboard-current-clearWidgets', function () {
                    $scope.$broadcast('clearwidgets', { dashboardid: $scope.mgrtabstate });
                });


                $scope.$emit('manager-ready');
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

                $scope.changed = function(element, elementType){
                    $scope.$emit('key-val-collection-change-' + $scope.collectionname, { type: elementType, element: element, collection: $scope.collection });
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
            console.log('[dashletcomssrv] registering ' + widgetid);
            dashletcomssrv.masters.addIfAbsent({'oid' : widgetid, 'title': dashlettitle});
        };

        dashletcomssrv.udpdateTitle = function (widgetid, dashlettitle) {
            dashletcomssrv.masters.getById(widgetid).title = dashlettitle;             
        };

        dashletcomssrv.unregisterWidget = function (widgetid) {
            console.log('[dashletcomssrv] unregistering ' + widgetid);
            dashletcomssrv.masters.removeIfExists(widgetid);
        };
        
        dashletcomssrv.updateMasterValue = function (widgetid, newValue) {
            dashletcomssrv.buffer[widgetid] = newValue;
        };

        return dashletcomssrv;
    });
function IdIndexArray(arrayArg) {
    if (!arrayArg) {
        throw 'Please provide array ref as argument.';
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
            console.log('[idindexarray] removeAll called. collection size:' + this.array.length);
            for (var i = 0; i < this.array.length; i++) {
                try{
                    console.log('[ITERATION '+i+']')
                    this.removeByIndex(i);
                }catch(e){
                    console.log('error: ' + e);
                }finally{
                    console.log(i);
                }
            }
            console.log('[idindexarray] removall finished.')
        },
        getAsArray: function(){
            return this.array;
        }
    };
};