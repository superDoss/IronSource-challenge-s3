const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;
chai.use(chaiHttp);

const fs = require('fs');

const path = require('path');
const __basedir = path.join(__dirname,'../');

const md5 = require('md5');
const app = require(path.join(__basedir,'app'));
const conf = require(path.join(__basedir,'config'));
const DB = require(path.join(__basedir,'src/db'));
const db = new DB(conf.connectionString);
const user1 = {
    id:"qAzef32F"
};

const file = {
    name:"test.json",
    path:"test/resources/test.json"
}

const createFilesTable = fs.readFileSync(path.join(__basedir,'db/create_files.sql'),{encoding:'utf8'});
const initDB = () => {
    db._db.exec(createFilesTable);
}

describe('End to End tests',() => {
    describe('Upload file',() => {
        beforeEach(initDB);
        it('Should upload a public file',async () => {
            const result = await chai.request(app)
                                    .post(`/${user1.id}/file`)
                                    .query({"access":"public"})
                                    .attach('file',file.path);

            expect(result).to.have.status(200);

            const access = await db.getFileAccess(user1.id,file.name);
            expect(access.public).to.be.true;
        });

        it('Should upload a private file',async () => {
            const result = await chai.request(app)
                                    .post(`/${user1.id}/file`)
                                    .query({"access":"private"})
                                    .attach('file',file.path);
           
            expect(result).to.have.status(200);

            const access = await db.getFileAccess(user1.id,result.body.id);
            expect(access.public).to.be.false;
        });

        it('Should upload a file with no access specified and it will be private', async () => {
            const result = await chai.request(app)
                                    .post(`/${user1.id}/file`)
                                    .attach('file',file.path);

            expect(result).to.have.status(200);

            const fileAccess = await db.getFileAccess(user1.id,result.body.id);
            expect(fileAccess.public).to.be.false;
        });
    })

    describe('Download file',() => {
        let privateFile = {
            name:"testPrivate.json",
            path:"test/resources/testPrivate.json"
        };

        let publicFile = {
            name:"testPublic.json",
            path:"test/resources/testPublic.json",
        };


        beforeEach(async () => {
            initDB();
            const publicRes = await chai.request(app)
                                .post(`/${user1.id}/file`)
                                .query({"access":"public"})
                                .attach('file',publicFile.path);
            publicFile.id = publicRes.body.id;

            const privateRes = await chai.request(app)
                                        .post(`/${user1.id}/file`)
                                        .query({"access":"private"})
                                        .attach('file',privateFile.path);

            privateFile.id = privateRes.body.id;
            privateFile.accessToken = privateRes.body.accessToken;
        })
        it("Should download a public file with it's name", async () => {
            const result = await chai.request(app)
                                        .get(`/${user1.id}/${publicFile.name}`);

            expect(result).to.have.status(200);
        });

        it("Should download a private file with it's id and accessToken", async () => {
            const result = await chai.request(app)
                                        .get(`/${user1.id}/${privateFile.id}`)
                                        .query({access_token:privateFile.accessToken});

            expect(result).to.have.status(200);
        });

        it('Should not download a private file without accessToken', async () => {
            const result = await chai.request(app)
                                        .get(`/${user1.id}/${privateFile.id}`);

            expect(result).to.have.status(400);
        });

        it('Should not download a private file with wrong accessToken', async () => {
            const result = await chai.request(app)
                                        .get(`/${user1.id}/${privateFile.id}`)
                                        .query({access_token:'foo'});

            expect(result).to.have.status(400);
        });

        it("Should return 404 if file deleted", async () => {
            before(async () => {
                await db.deleteFile(user1.id,publicFile.name);
            })

            const result = await chai.request(app)
                                        .get(`/${user1.id}/${publicFile.name}`);

            expect(result).to.have.status(404);
        });

        it("Should return 404 if file does not exist", async () => {
            const result = await chai.request(app)
                                        .get(`/${user1.id}/foo`);

            expect(result).to.have.status(404);
        });
        
        
    });

    describe('Update access',() => {
        it('Should update access from public to ptivate',async () => {

        });

        it('Should update access from private to public',async () => {

        });

        it('Should not let update file if access token is not provided',async () => {

        });

        it('Should not let update file if access token is wrong',async () => {

        });

        it('Should return 404 if file does not exist',async () => {

        });
    });

    describe('Get file metadata',() => {
        it('Should return file metadata of public file', async () => {

        });

        it('Should return file metadata of private file with accessToken', async () => {

        });

        it('Should not return file metadata of private file without accessToken', async () => {

        });

        it('Should not return file metadata of private file with wrong accessToken', async () => {

        });

        it('Should return file metadata even though file deleted', async () => {

        });

        it('Should return 404 if file does not exist', async () => {

        });
    });

    describe('Delete file', async () => {
        it("Should delete a public file with it's name", async () => {

        });

        it("Should delete a private file with it's id", async () => {

        });

        it("Should not delete a file without accessToken", async () => {

        });

        it("Should not delete a file with wrong accessToken", async () => {

        });

        it("Should return 404 if file does not exist", async () => {

        });
    })
})