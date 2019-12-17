function ServiceChain(value) {
    var myValue = value;
    return {
        getValue : function(){
            return myValue;
        }
    };
}