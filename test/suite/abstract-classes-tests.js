const libloader = require('../helpers/libloader');
const assert = require('assert');

const libs = ['../../src/js/models/abstract-classes.js'];
libloader.load(libs);

describe('Core', function()
{
    
    describe('AbstractIdentifiableObject Tests', function()
    {
        it('should be identifiable',
            function()
            {
                let identifiableObject = new AbstractIdentifiableObject();
                identifiableObject.setId("abcd");
                assert.equal("abcd", identifiableObject.getId("abcd"));
            })
    });

    describe('AbstractOrganizableObject Tests', function()
    {
        it('should be organizable',
            function()
            {
                let organizableObject = new AbstractOrganizableObject();
                organizableObject.setAttributes({"name" : "abcd"});
                assert.equal("abcd", organizableObject.getAttributes().name);
            })

        it('should also, still be identifiable',
            function()
            {
                let organizableObject = new AbstractOrganizableObject();
                organizableObject.setId("abcd");
                assert.equal("abcd", organizableObject.getId("abcd"));
            })
    });

});