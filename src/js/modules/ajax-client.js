function AjaxClient(urlArg, dataArg, methodArg, callbackArg) {
    return {
        url: urlArg,
        data: dataArg,
        method: methodArg,
        callback: callbackArg,
        executeHttp: function () {
            //TODO
        },
    };
};