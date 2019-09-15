var productionmode = false;

var devJSFolder = '/js/';
var devTemplateFolder = '/templates/';

var vizScripts = {};

var registerScript = function(){
    var scripts = document.getElementsByTagName("script");
    var scriptUrl = scripts[scripts.length - 1].src;

    var filenameSplit = scriptUrl.split("/");
    var filename = filenameSplit[filenameSplit.length-1];

    vizScripts[filename] = scriptUrl;
    //console.log(JSON.stringify(vizScripts));
};

var resolveTemplateURL = function (containername, componentname){
    if (productionmode === false){
        templateUrl = vizScripts[containername].replace(devJSFolder, devTemplateFolder)
                          .replace(containername, componentname)
                           +'?who='+componentname
                           +'&anticache=' + getUniqueId();
    }else{
        templateUrl = url.replace(filename, 'dist/'+ componentname);
    }
    return templateUrl;
}

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
