registerScript();

angular.module('dashletcomssrv', [])
    .service('dashletcomssrv', function ($rootScope) {
 
        var dashletcomssrv = {};
        dashletcomssrv.buffer = {};
        dashletcomssrv.masters = [];

        dashletcomssrv.registerWidget = function (dashletid) {
            dashletcomssrv.masters.push({mid : dashletid});
        };
        
        dashletcomssrv.updateMasterValue = function (dashletid, newValue) {
            dashletcomssrv.buffer[dashletid] = newValue;
        };

        return dashletcomssrv;
    })