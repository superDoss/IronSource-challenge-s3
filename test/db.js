const { should,expect } = require('chai');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const __basedir = path.join(__dirname,'../')
const DB = require(path.join(__basedir,'src/db'));

describe('DB',() => {
    const db = new DB(':memory:');
    before(() => {
        const createUsersTable = fs.readFileSync(path.join(__basedir,'db/create_users.sql'),{encoding:'utf8'});
        const createFilesTable = fs.readFileSync(path.join(__basedir,'db/create_files.sql'),{encoding:'utf8'});
        db._db.exec(createUsersTable);
        db._db.exec(createFilesTable);
    });

    describe('#insertFile',() => {
        const file = {
            originalname:'test',
            path:'test',
            filename:'BkuTabe',
            size:1000,
            public:true,
        };

        const user = {
            id:'jhbvasd',
            name:'user1',
        };

        it('should insert file and return file id',async () => {
            const result = await db.insertFile(user,file);
            expect(result).to.equal(file.filename);
        });
    })
})