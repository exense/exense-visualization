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
vizmdTransformation.toDualGrouping = function (xyzmFormat, topGroupKey, subGroupKey, inputMKey) {

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

    // build metric list
    $.each(xyzmFormat, function (idx, datapoint) {
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
            currentTop.addNewWithId({ values: {} }, datapoint[subGroupKey])
            xList.push(datapoint[subGroupKey]);
        }

        var currentSub = currentTop.getById(datapoint[subGroupKey]);
        currentSub.values[datapoint.m] = datapoint.y;
    });

    return {
        data: JSON.parse(JSON.stringify(zxIndex)),
        zList: zList,
        xList: xList,
        mList: mList
    };
};

vizmdTransformation.toPlainTable = function (twolvlgroups, h1, h2) {
    var multiArray = [];

    var headers = [];
    // empty corner
    headers.push(h1, h2);
    $.each(twolvlgroups.mList, function (idx, m) {
        headers.push(m);
    });

    $.each(twolvlgroups.data.array, function (idx, top) {
        $.each(top.array, function (idx1, sub) {
            var row = [];
            row.push(top.oid);
            row.push(sub.oid);
            $.each(twolvlgroups.mList, function (idx1, m) {
                if (sub.values && sub.values[m]){
                    row.push(sub.values[m]);
                }
            });
            multiArray.push(row);
        });
    });
    return { data: multiArray, headers: headers};
};