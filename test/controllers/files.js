const { should,expect } = require('chai');
const FilesController = require('../../src/controllers/files');
//TODO: implement db
const db;

describe('FilesController',() => {
    describe('#saveFile',() => {
        let db = {
            insertFile:(file) => 'test'
        };

        //TODO add properties
        const file = {

        }

        const user = {
            id:'test',
            name:'test'
        }

        const filesController = new FilesController(db);
        describe('should save and return file id',async () => {
            expect(await filesController.saveFile(user,file)).to.equal('test');
        });

        describe('should throw exception if user is not presented',async () => {
            expect(await filesController.saveFile(null,file)).to.throw()
        });

        describe('should throw exception if file is not presented', async () => {
            expect(await filesController.saveFile(user,null)).to.throw();
        });

        
    })
})