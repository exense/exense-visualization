var AbstractIdentifiableObjectMethods = {
    getId: function () {
        return this._id;
    },
    setId: function (id) {
        this._id = id;
    },
    getCustomFields: function () {
        return this.customFields;
    },
    setCustomFields: function (customFields) {
        this.customFields = customFields;
    },
    addCustomFields: function (key, value) {
        this.customFields.key = value;
    }
};

function AbstractIdentifiableObject(_id, customFields) {
    this._id = _id;
    this.customFields = customFields;
};

jQuery.extend(AbstractIdentifiableObject.prototype, AbstractIdentifiableObjectMethods);

var AbstractOrganizableObjectMethods = {
    getAttributes: function () {
        return this.attributes;
    },
    setAttributes: function (attributes) {
        this.attributes = attributes;
    }
};

function AbstractOrganizableObject(_id, customFields, attributes) {
    AbstractIdentifiableObject.call(this, _id, customFields);
    this.attributes = attributes;
};

// Defining explicit inheritance
AbstractOrganizableObject.prototype = new AbstractIdentifiableObject();
AbstractOrganizableObject.prototype.constructor = AbstractOrganizableObject;

jQuery.extend(AbstractOrganizableObject.prototype, AbstractOrganizableObjectMethods);