function IdIndexArray(arrayArg) {
    if (!arrayArg) {
        throw new Error('Please provide array ref as argument.');
    }
    return {
        array: arrayArg,
        getId: function (obj) {
            return obj['oid'];
        },
        addNewWithId: function (obj, id) {
            obj['oid'] = id;
            this.array.push(obj);
            return id;
        },
        addNew: function (obj) {
            var newId = getUniqueId();
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
                return -1;
            }
            return this.array[index];
        },
        hasById: function (oid) {
            if(this.getById(oid) !== -1){
                return true;
            }else{
                return false;
            }
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
        removeByIndex: function (idx) {
            var oid = this.getIdByIndex(idx);
            this.array.splice(idx, 1);
        },
        copyById: function (oid) {
            var copy = jsoncopy(this.getById(oid));
            copy['oid'] = getUniqueId();
            return copy;
        },
        duplicateById: function (oid) {
            var newId = this.addExisting(this.copyById(oid)); // pushed at the end of the array
            var copyIdx = this.getIndexById(newId);
            var originalIdx = this.getIndexById(oid);
            this.moveFromToIndex(copyIdx, originalIdx + 1);
        },
        moveFromToIndex: function (old_index, new_index) {
            this.array.splice(new_index, 0, this.array.splice(old_index, 1)[0]);
        },
        count: function () {
            return this.array.length;
        },
        getPrevious: function (oid) {
            return this.getByIndex(this.getIndexById(oid) - 1);
        },
        getPreviousId: function (oid) {
            return this.getId(this.getPrevious(oid));
        },
        getNext: function (oid) {
            return this.getByIndex(this.getIndexById(oid) + 1);
        },
        getNextId: function (oid) {
            return this.getId(this.getNext(oid));
        },
        addIfAbsent: function (obj) {
            if (!(obj['oid'])) {
                return this.addNew(obj);
            }
            var index = this.getIndexById(obj['oid']);
            if (index < 0) {
                return this.addExisting(obj);
            }
            //already present
            return index;
        },
        removeIfExists: function (oid) {
            if (!oid) {
                throw 'Cant remove object without proper oid';
            }
            var index = this.getIndexById(oid);
            if (index < 0) {
                //doesn't exist
                return -1;
            }
            //found
            return this.removeByIndex(index);
        },
        removeAll: function () {
            for (var i = 0; i < this.array.length; i++) {
                this.removeByIndex(i);
            }
        },
        getAsArray: function(){
            return this.array;
        }
    };
};