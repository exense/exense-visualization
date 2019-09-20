function IdIndexArray(arrayArg) {
    return {
        array: arrayArg,
        getId: function (obj) {
            return obj['oid'];
        },
        addNew: function (obj) {
            var newId = getUniqueId();
            //console.log('adding:' + newId);
            //console.log(array);
            obj['oid'] = newId;
            this.array.push(obj);
            return newId;
        },
        addExisting: function (obj) {
            this.array.push(obj);
        },
        clear: function () {
            this.array.length = 0;
        },
        getById: function (oid) {
            var index = this.getIndexById(oid);
            if (index === -1) {
                throw 'No object found with Id:' + oid;
            }
            return this.array[index];
        },
        getByIndex: function (idx) {
            return this.array[idx];
        },
        getIndexById: function (oid) {
            for (i = 0; i < this.array.length; i++) {
                if (this.array[i]['oid'] === oid) {
                    return i;
                }
            }
            return -1;
        },
        getIdByIndex: function (idx) {
            return this.array[idx]['oid'];
        },
        removeById: function (oid) {
            this.array.splice(this.getIndexById(oid), 1);
        },
        copyById: function (oid) {
            var copy = jsoncopy(this.getById(oid));
            copy['oid'] = getUniqueId();
            return copy;
        },
        dupplicateById: function (oid) {
            return this.addExisting(this.copyById(oid));
        },
        moveFromToIndex: function (old_index, new_index) {
            this.array.splice(new_index, 0, this.array.splice(old_index, 1)[0]);
        },
        count() {
            return this.array.length;
        },
        getPrevious(oid) {
            return this.getByIndex(this.getIndexById(oid) - 1);
        },
        getPreviousId(oid) {
            return this.getId(this.getPrevious(oid));
        },
        getNext(oid) {
            return this.getByIndex(this.getIndexById(oid) + 1);
        },
        getNextId(oid) {
            return this.getId(this.getNext(oid));
        }
    };
};