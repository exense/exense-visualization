function Processor(name, stage ) {
    return {
        getServices : function(){
            return srvDescriptors;
        }
    };
}

function ServiceDescriptor() {
    var srvDescriptors = services;
    return {
        getServices : function(){
            return srvDescriptors;
        }
    };
}

function ServiceChain(services) {
    var srvDescriptors = services;
    return {
        getServices : function(){
            return srvDescriptors;
        }
    };
}