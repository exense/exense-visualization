registerScript();

angular.module('dashletcomssrv', [])
    .service('dashletcomssrv', function () {

        var wmservice = {sessions : {}, masters : []};

        wmservice.sayHi = function(){
            console.log();
        }

        wmservice.registerDashboards = function(sessionid, dashboards){
            wmservice.sessions[sessionid] = dashboards;
        }

        wmservice.unregisterDashboards = function(sessionid, dashboards){
            wmservice.sessions[sessionid] = undefined;
        }

        wmservice.makeMaster = function(did, wid){
            console.log('making ['+did+':'+wid+'] master');
        }

        wmservice.bindSlaveToMaster = function(slave_did, slave_wid, master_did, master_wid){
            console.log('binding slave ['+slave_did+':'+slave_wid+'] to master ['+master_did+':'+master_wid+']');
        }

        return wmservice;
    })