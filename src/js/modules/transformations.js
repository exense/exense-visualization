//TODO: try to use classes instead of primitive types?
function Transformation(name, actualFunction) {
    var tName = name;
    var tFn = actualFunction.toString();
    return {
        getName : function(){
            return tName;
        },
        getFunctionAsString : function(){
            return tFn;
        }
    };
}

var to4DimFormat = function(){
    return "123";
}