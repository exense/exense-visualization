var vizmdTransformation = {};

//TODO: try to use classes instead of primitive types?
function Transformation(name, actualFunction) {
    var tName = name;
    var tFn = actualFunction.toString();
    return {
        getName: function () {
            return tName;
        },
        getFunctionAsString: function () {
            return tFn;
        }
    };
}

//2-level grouping - could be generalized to n-grouping (via recursion / nesting)
vizmdTransformation.toDualTable = function (xyzmFormat, topGroupKey, subGroupKey, inputMKey) {

    var zxIndex = new IdIndexArray([]);
    var valueKeys = [];

    var zList = [];
    var xList = [];
    var mList = [];
    var mKey = '';

    //default
    if (typeof inputMkey !== 'undefined' && inputMkey) {
        mKey = inputMKey;
    } else {
        mKey = 'm';
    }

    // get all non-grouping-involved keys
    $.each(xyzmFormat, function (idx, datapoint) {
        $.each(Object.keys(datapoint), function (idx2, datapointKey) {
            if (datapointKey !== topGroupKey && datapointKey !== subGroupKey) {
                if (!valueKeys.includes(datapointKey)) {
                    valueKeys.push(datapointKey);
                }
            }
        });
        if (!mList.includes(datapoint[mKey])) {
            mList.push(datapoint[mKey]);
        }
    });

    $.each(xyzmFormat, function (idx, datapoint) {
        if (!zxIndex.hasById(datapoint[topGroupKey])) {
            zxIndex.addNewWithId(new IdIndexArray([]), datapoint[topGroupKey]);
            zList.push(datapoint[topGroupKey]);
        }

        var currentTop = zxIndex.getById(datapoint[topGroupKey]);
        if (!currentTop.hasById(datapoint[subGroupKey])) {
            currentTop.addNewWithId({values : {}}, datapoint[subGroupKey])
            xList.push(datapoint[subGroupKey]);

            // add all non-grouping involved values to the grouping
            $.each(valueKeys, function (idx2, valueKey) {
                var currentSub = currentTop.getById(datapoint[subGroupKey]);
                currentSub.values[valueKey] = datapoint[valueKey];
            });
        }
    });

    return {
        data: zxIndex,
        zList: zList,
        xList: xList,
        mList: mList
    };
}