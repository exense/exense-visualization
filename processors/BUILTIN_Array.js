var testmode = true;

var getUniqueId = function () {
    return Math.random().toString(36).substr(2, 9);
}

var oidkey = 'iiaoid';

function IdIndexArray(arrayArg) {
    if(!arrayArg){
        arrayArg = [];
    }
    return {
        array: arrayArg,
        getId: function (obj) {
            return obj[oidkey];
        },
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
        },
        getPrevious(oid){
            return this.getByIndex(this.getIndexById(oid) - 1);
        },
        getPreviousId(oid){
            return this.getPrevious(oid).getId();
        },
        getNext(oid){
            return this.getByIndex(this.getIndexById(oid) + 1);
        },
        getNextId(oid){
            return this.getNext(oid).getId();
        }
    };
};


var testData = [];

var arrayWrapper = new IdIndexArray(testData);

var id1 = arrayWrapper.addNew({ foo: 'bar1' });
var id2 = arrayWrapper.addNew({ foo: 'bar2' });
var id3 = arrayWrapper.addNew({ foo: 'bar3' });
var id4 = arrayWrapper.addNew({ foo: 'bar4' });
arrayWrapper.removeById(id3);
arrayWrapper.removeById(id4);

var actual = arrayWrapper.count()
+ arrayWrapper.getById(id2).foo
+ testData[0].foo
+ arrayWrapper.getPrevious(arrayWrapper.getId(arrayWrapper.getById(id2))).foo
+ arrayWrapper.getNext(arrayWrapper.getId(arrayWrapper.getById(id1))).foo;
var expected = 2 + 'bar2'+'bar1'+'bar1'+'bar2';

if (testmode) {
    if (actual === expected) {
        console.log('[PASSED]')
        //console.log(actual);
    }
    else {
        console.log('[FAILED]')
        console.log('actual:' + actual);
        console.log(' != ');
        console.log('expected:' + expected);
    }
}