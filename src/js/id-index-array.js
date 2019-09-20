var oidkey = 'oid';
var objkey = 'obj';

function IdIndexArray(arrayArg, oidkeyArg) {
    if(!arrayArg){
        arrayArg = [];
    }
    if(!oidkeyArg){
        oidkey = 'iiaoidDefault';
    }else{
        oidkey = oidkeyArg;
    }
    return {
        array: arrayArg,
        addNew: function (obj) {
            var newId = getUniqueId();
            obj[oidkey] = newId;
            this.array.push(obj);
            return newId;
        },
        clear: function () {
            this.array.length = 0;
        },
        getById: function (oid) {
            var index = this.getIndexById(oid);
            if(index === -1){
                throw 'No object found with Id:' + oid;
            }
            return this.array[index];
        },
        getByIndex: function (idx) {
            return this.array[idx];
        },
        getIndexById: function (oid) {
            for (i = 0; i < this.array.length; i++) {
                if (this.array[i][oidkey] === oid) {
                    return i;
                }
            }
            return -1;
        },
        getIdByIndex: function (idx) {
            return this.array[idx][oidkey];
        },
        removeById: function (oid) {
            this.array.splice(this.getIndexById(oid), 1);
        },
        copyById(oid) {
            return jsoncopy(this.getById(oid));
        },
        count() {
            return this.array.length;
        }
    };
};
