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

var setIntervalDefault = 2000;

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
}