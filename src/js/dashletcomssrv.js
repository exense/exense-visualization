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

        dashletcomssrv.registerWidget = function (widgetid, dashlettitle) {
            dashletcomssrv.masters.addIfAbsent({'oid' : widgetid, 'title': dashlettitle});
        };

        dashletcomssrv.udpdateTitle = function (widgetid, dashlettitle) {
            dashletcomssrv.masters.getById(widgetid).title = dashlettitle;             
        };

        dashletcomssrv.unregisterWidget = function (widgetid) {
            dashletcomssrv.masters.removeIfExists(widgetid);
        };
        
        dashletcomssrv.updateMasterValue = function (widgetid, newValue) {
            dashletcomssrv.buffer[widgetid] = newValue;
        };

        return dashletcomssrv;
    })