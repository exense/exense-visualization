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

        dashletcomssrv.registerWidget = function (dashletid, dashlettitle) {
            console.log('[dashletcomssrv] registering ' + dashletid);
            dashletcomssrv.masters.addIfAbsent({'oid' : dashletid, 'title': dashlettitle});
        };

        dashletcomssrv.udpdateTitle = function (dashletid, dashlettitle) {
            dashletcomssrv.masters.getById(dashletid).title = dashlettitle;             
        };

        dashletcomssrv.unregisterWidget = function (dashletid) {
            console.log('[dashletcomssrv] unregistering ' + dashletid);
            dashletcomssrv.masters.removeIfExists(dashletid);
        };
        
        dashletcomssrv.updateMasterValue = function (dashletid, newValue) {
            dashletcomssrv.buffer[dashletid] = newValue;
        };

        return dashletcomssrv;
    })