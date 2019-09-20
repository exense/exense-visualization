registerScript();

angular.module('dashletcomssrv', [])
    .service('dashletcomssrv', function ($rootScope) {
 
        var dashletcomssrv = {};
        dashletcomssrv.buffer = {};
        dashletcomssrv.masters = {};
        dashletcomssrv.masters.array = [];
        dashletcomssrv.masters = new IdIndexArray(dashletcomssrv.masters.array);

        dashletcomssrv.registerWidget = function (dashletid) {
            dashletcomssrv.masters.addIfAbsent({oid : dashletid});
        };

        dashletcomssrv.unregisterWidget = function (dashletid) {
            dashletcomssrv.masters.removeIfExists(dashletid);
        };

        
        dashletcomssrv.updateMasterValue = function (dashletid, newValue) {
            dashletcomssrv.buffer[dashletid] = newValue;
        };

        return dashletcomssrv;
    })