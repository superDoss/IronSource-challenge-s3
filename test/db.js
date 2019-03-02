const { should,expect } = require('chai');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const __basedir = path.join(__dirname,'../')
const DB = require(path.join(__basedir,'src/db'));

describe('DB',() => {
    const db = new DB(':memory:');
    
    const file = {
        originalname:'test',
        path:'test',
        filename:'BkuTabe',
        size:1000,
        public:true,
    };

    const user = {
        id:'qAzef32F',
        name:'user1',
        accessToken:'sjdnfsdFE32ss'
    };

    const createUsersTable = fs.readFileSync(path.join(__basedir,'db/create_users.sql'),{encoding:'utf8'});
    const createFilesTable = fs.readFileSync(path.join(__basedir,'db/create_files.sql'),{encoding:'utf8'});
    const initDB = () => {
        db._db.exec(createUsersTable);
        db._db.exec(createFilesTable);
    }
    

    describe('#insertFile',() => {
        before(initDB);
        it('should insert file and return file id',async () => {
            const result = await db.insertFile(user,file);
            expect(result).to.equal(file.filename);
        });
    })

    describe('#getFileAccess', () => {
        
        const publicFile = file;
        const privateFile = Object.assign({},file);
        
        privateFile.public = false;
        privateFile.filename = 'jhbkDfG';
        privateFile.originalname = 'test2';

        before(async () => {
            initDB();
            await db.insertFile(user,publicFile);
            await db.insertFile(user,privateFile);
        });
        
        it('Should return file curent access',async () => {
            const result = await db.getFileAccess(user.id,publicFile.filename);
            expect(result.public).to.be.true;
        });

        it('Should return private access',async () => {
            const result = await db.getFileAccess(user.id,privateFile.filename);
            expect(result.public).to.be.false;
        });

        it('Should return private access with no filename',async () => {
            const privateClone = Object.assign({},privateFile);
            privateClone.filename = '';
            const result = await db.getFileAccess(user.id,privateClone.originalname);
            expect(result.public).to.be.false;
        });

        it('Should return private access with no originalname',async () => {
            const privateClone = Object.assign({},privateFile);
            privateClone.originalname = '';
            const result = await db.getFileAccess(user.id,privateClone.filename);
            expect(result.public).to.be.false;
        });
    });

    describe('#getFile',() => {
        before(async () => {
            initDB();
            await db.insertFile(user,file);
        });

        it('Should return file path', async () => {
            const result = await db.getFile(user.id,file.filename);
            expect(result.path).to.equal('test');
            expect(result.name).to.equal('test');
        })
    });

    describe('#verifyAccessToken',() => {
        before(initDB);
        
        it('Should verify access token',async () => {
            const result = await db.verifyAccessToken(user.id,user.accessToken);
            expect(result).to.be.true;
        });

        it('Should invalidate access token',async () => {
            const result = await db.verifyAccessToken(user.id,'kjnvavar');
            expect(result).to.be.false;
        })
    });

    describe('#verifyFileExist',() => {
        before(async () => {
            initDB();
            await db.insertFile(user,file);
        });

        it('Should find file in db',async () => {
            const result = await db.verifyFileExist(user.id,file.filename);
            expect(result).to.be.true;
        });

        it('Should not find file in db',async () => {
            const fileClone = Object.assign({},file);
            fileClone.filename = 'kjhbdl';
            fileClone.originalname = 'ttt';
            const result = await db.verifyFileExist(user.id,fileClone.filename);
            expect(result).to.be.false;
        })
    });
})