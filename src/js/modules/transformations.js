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

//2-level grouping - could be generalized to n-grouping (via recursion / nesting)
var to4DimTableFormat = function(xyzmFormat, topGroupKey, subGroupKey){

    var zxIndex = {};
    var valueKeys = [];

    // get all non-grouping-involved keys
    $.each(xyzmFormat.data, function(idx, datapoint){
        $.each(Object.keys(datapoint), function(idx2, datapointKey){
            if(datapointKey !== topGroupKey && datapointKey !== subGroupKey){
                if(!valueKeys.includes(datapointKey)){
                    valueKeys.push(datapointKey);
                }
            }
        });
    });

    $.each(xyzmFormat.data, function(idx, datapoint){
        if(!Object.keys(zxIndex).includes(datapoint[topGroupKey])){
            zxIndex[datapoint[topGroupKey]] = {};
        }

        if(!Object.keys(zxIndex[datapoint[topGroupKey]]).includes(datapoint[subGroupKey])){
            zxIndex[datapoint[topGroupKey]][datapoint[subGroupKey]] = {};
            // add all non-grouping involved values to the grouping
            $.each(valueKeys, function(idx2, valueKey){
                zxIndex[datapoint[topGroupKey]][datapoint[subGroupKey]].valueKey = datapoint[valueKey];
            });
        }
    });

    return zxIndex;
}