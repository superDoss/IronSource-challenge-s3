const chai = require('chai');
chai.use(require('chai-as-promised'));
const { should,expect } = chai;
const fs = require('fs');
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
        let db = {};
        beforeEach(() => {
            db = {
                getFileAccess: (user,file) => ({public:true}),
                getFile: (user,file) => 'test',
                verifyFileExist: (user,file) => true,
                isFileDeleted: (user,file) => false,
                verifyAccessToken: (user,file,access) => true, 
            };
        })

        it('Should download public file', async () => {
            const filesController = new FilesController(db);
            await expect(filesController.downloadFile(user,file,null))
                        .to.eventually.equal('test');
        });

        it('Should throw error if file does not exist', async () => {
            db.verifyFileExist = (user,file) => false;

            const filesController = new FilesController(db);
            await expect(filesController.downloadFile(user,file,null))
                        .to.eventually.rejectedWith('File does not exist');
        })

        it('Should download private file', async () => {
            db.getFileAccess = (user,file) => ({public:false});

            const filesController = new FilesController(db);
            await expect(filesController.downloadFile(user,file,user.accessToken))
                    .to.eventually.equal('test');
        });

        it('Should throw error for private file with no access token', async () => {
            db.getFileAccess = (user,file) => ({public:false});

            const filesController = new FilesController(db);
            await expect(filesController.downloadFile(user,file,null))
                    .to.eventually.rejectedWith('Missing access token for private file');
        });

        it('Should throw error for private file with wrong access token', async () => {
            db.getFileAccess = (user,file) => ({public:false});
            db.verifyAccessToken = (user,token) => false;

            const filesController = new FilesController(db);
            await expect(filesController.downloadFile(user,file,user.accessToken))
                .to.eventually.rejectedWith('Token is not verified');
        });

        it('Should not download file if file have been deleted', async () => {
            db.isFileDeleted = (user,file) => true;

            const filesController = new FilesController(db);
            await expect(filesController.downloadFile(user,file,user.accessToken))
                .to.eventually.rejectedWith('File has been deleted');
        })
    });

    describe('#fileMetadata',() => {
        const dbFile = {
            id:'test',
            name:'testName',
            size:1000,
            create_date:'some date',
            update_date:'some date',
            delete_date:'some date',
            public:1
        }

        it('Should return file metdata', async () => {
            
            const db = {
                getFileAccess: (user,file) => ({public:true}),
                getFile: (user,file) => dbFile,
                verifyFileExist: (user,file) => true,
            };

            const filesController = new FilesController(db);
            await expect(filesController.fileMetadata(user,file,user.accessToken))
            .to.eventually.have.all.keys(['name','size','created','updated','deleted']);
        });

        it('Should return file metdata with no updated key', async () => {
            const dbFileClone = Object.assign({},dbFile);
            dbFileClone.update_date = null;
            const db = {
                getFileAccess: (user,file) => ({public:true}),
                getFile: (user,file) => dbFileClone,
                verifyFileExist: (user,file) => true,
            };

            const filesController = new FilesController(db);
            await expect(filesController.fileMetadata(user,file,user.accessToken))
            .to.eventually.not.have.key('updated');
        })

        it('Should return file metadata even though file has been deleted',async () => {
            
            const db = {
                getFileAccess: (user,file) => ({public:true}),
                getFile: (user,file) => dbFile,
                verifyFileExist: (user,file) => true,
            };

            const filesController = new FilesController(db);
            await expect(filesController.fileMetadata(user,file,user.accessToken))
                .to.eventually.have.all.keys(['name','size','created','updated','deleted']);
        })
    })

    describe('#updateFileAccess',() => {
        const db = {
            verifyFileExist: (user,file) => true,
            updateFileAccess: (user,file,access) => access,
            verifyAccessToken: (user,token) => true,
            isFileDeleted: (user,file) => false
        };

        it('Should update file access to private', async () => {
            const filesController = new FilesController(db);
            await expect(filesController.updateFileAccess(user,file,'private',user.accessToken))
                .to.eventually.be.false;
        })

        it('Should update file access to private', async () => {
            const filesController = new FilesController(db);
            await expect(filesController.updateFileAccess(user,file,'public',user.accessToken))
                .to.eventually.be.true;
        })

        it('Should throw error when access value is not private or public', async () => {
            const filesController = new FilesController(db);
            const access = 'pubglic';
            await expect(filesController.updateFileAccess(user,file,access,user.accessToken))
                .to.eventually.rejectedWith('Access value not public or private. value recived: ' + access);
        })
    });

    describe('#deleteFile',() => {
        const db = {
            verifyFileExist: (user,file) => true,
            deleteFile: (user,file,token) => path.join(__basedir,'test.txt'),
            verifyAccessToken: (user,token) => true,
            isFileDeleted: (user,file) => false,
        };

        before(() => {
            fs.writeFileSync(path.join(__basedir,'test.txt'),'yada yada');
        })

        it('Should delete file',async () => {
            const filesController = new FilesController(db);
            await expect(filesController.deleteFile(user,file,user.accessToken)).to.eventually.be.true;
        })

        it('Should not delete file with no accessToken',async () => {
            const filesController = new FilesController(db);
            await expect(filesController.deleteFile(user,file,null))
                .to.eventually.rejectedWith('Missing access token to delete private file');
        })
    })
})