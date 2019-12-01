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
};