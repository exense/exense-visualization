function AjaxClient(urlArg, dataArg, methodArg, successCbk, errorCbk) {
    return {
        url: urlArg,
        data: dataArg,
        method: methodArg,
        success: successCbk,
        error: errorCbk,
        execute: function () {
          $.ajax('http://127.0.0.1:8080/').done(function( data ) {
            successCbk(data);
          }).fail(function( data ) {
            errorCbk(data);
          })
        },
    };
};