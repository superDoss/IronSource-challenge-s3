const chai = require('chai');
chai.use(require('chai-as-promised'));
const { should,expect } = chai;
const path = require('path');
const __basedir = path.join(__dirname,'../../')
const FilesController = require(path.join(__basedir,'src/controllers/files'));

describe('FilesController',() => {
    describe('#saveFile',() => {
        const db = {
            insertFile:(user,file) => 'test'
        };

        const file = {
            originalname:'test',
            path:'test',
            filename:'BkuTabe',
            size:1000,
            public:true,
        };

        const user = {
            id:'test',
            name:'test'
        }

        const filesController = new FilesController(db);
        it('should save and return file id',async () => {
            expect(await filesController.saveFile(user,file)).to.equal('test');
        });

        it('should throw exception if user is not presented',async () => {
            await expect(filesController.saveFile(null,file)).to.eventually.be.rejected;
        });

        it('should throw exception if file is not presented', async () => {
            await expect(filesController.saveFile(user,null)).to.eventually.be.rejected;
        });

        
    })
})