const chai = require('chai');
chai.use(require('chai-as-promised'));
const { should,expect } = chai;
const path = require('path');
const __basedir = path.join(__dirname,'../../')
const FilesController = require(path.join(__basedir,'src/controllers/files'));

describe('FilesController',() => {
    const file = {
        originalname:'test',
        path:'test',
        filename:'BkuTabe',
        size:1000,
        public:true,
    };

    const user = {
        id:'testId',
        name:'testName',
        accessToken:'testToken',
    }

    describe('#saveFile',() => {
        const db = {
            insertFile:(user,file) => 'test'
        };

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
    });

    describe('#downloadFile',() => {
        
        it('Should download public file', async () => {
            const db = {
                getFileAccess: (user,file) => ({public:true}),
                getFilePath: (user,file) => 'test',
                verifyFileExist: (user,file) => true,
            };

            const filesController = new FilesController(db);
            await expect(filesController.downloadFile(user,file,null))
                        .to.eventually.equal('test');
        });

        it('Should throw error if file does not exist', async () => {
            const db = {
                verifyFileExist: (user,file) => false,
            };

            const filesController = new FilesController(db);
            await expect(filesController.downloadFile(user,file,null))
                        .to.eventually.rejectedWith('File does not exist');
        })

        it('Should download private file', async () => {
            const db = {
                getFileAccess: (user,file) => ({public:false}),
                getFilePath: (user,file) => 'test',
                verifyFileExist: (user,file) => true,
                verifyAccessToken: (user,token) => true,
            };

            const filesController = new FilesController(db);
            await expect(filesController.downloadFile(user,file,user.accessToken))
                    .to.eventually.equal('test');
        });

        it('Should throw error for private file with no access token', async () => {
            const db = {
                getFileAccess: (user,file) => ({public:false}),
                getFilePath: (user,file) => 'test',
                verifyFileExist: (user,file) => true,
            };

            const filesController = new FilesController(db);
            await expect(filesController.downloadFile(user,file,null))
                    .to.eventually.rejectedWith('Missing access token for private file');
        });

        it('Should throw error for private file with wrong access token', async () => {
            const db = {
                getFileAccess: (user,file) => ({public:false}),
                getFilePath: (user,file) => 'test',
                verifyFileExist: (user,file) => true,
                verifyAccessToken: (user,token) => false,
            };

            const filesController = new FilesController(db);
            await expect(filesController.downloadFile(user,file,user.accessToken))
                .to.eventually.rejectedWith('Token is not verified');
        });
    })
})