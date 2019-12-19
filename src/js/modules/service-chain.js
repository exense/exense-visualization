function ServiceChain(services) {
    var srvDescriptors = services;
    return {
        getServices : function(){
            return srvDescriptors;
        }
    };
}