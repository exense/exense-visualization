registerScript();

angular.module('dashletcomssrv', [])
    .service('dashletcomssrv', function ($rootScope) {
 
        var dashletcomssrv = {};
        dashletcomssrv.value = '';
        
        dashletcomssrv.updateMasterValue = function (newValue) {
            dashletcomssrv.value = newValue;
            console.log('srvupdate->'+dashletcomssrv.value)
        };

        dashletcomssrv.readMasterValue = function () {
            return dashletcomssrv.value;
        };

        return dashletcomssrv;
    })