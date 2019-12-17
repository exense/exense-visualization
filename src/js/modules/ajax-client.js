function AjaxClient(urlArg, dataArg, methodArg, callbackArg) {
    if (!arrayArg) {
        throw new Error('Please provide array ref as argument.');
    }
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