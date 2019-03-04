const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;
chai.use(chaiHttp);

const fs = require('fs');

const path = require('path');
const __basedir = path.join(__dirname,'../');

const app = require(path.join(__basedir,'app'));
const conf = require(path.join(__basedir,'config'));
const DB = require(path.join(__basedir,'src/db'));
const db = new DB(conf.connectionString);
const user1 = {
    id:"qAzef32F"
};

const shortUUID = require('short-uuid');

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
        const fileClone = Object.assign({},file);
        beforeEach(() => {
            fileClone.name = shortUUID.generate() + '.json';
            fileClone.path = "test/resources/" + fileClone.name;
            fs.writeFileSync(fileClone.path);
        });

        afterEach(() => {
            fs.unlinkSync(fileClone.path);
        })

        it('Should upload a public file',async () => {

            const result = await chai.request(app)
                                    .post(`/${user1.id}/file`)
                                    .query({"access":"public"})
                                    .attach('file',fileClone.path);

            expect(result).to.have.status(200);

            const access = await db.getFileAccess(user1.id,fileClone.name);
            expect(access.public).to.be.true;
        });

        it('Should upload a private file',async () => {
            const result = await chai.request(app)
                                    .post(`/${user1.id}/file`)
                                    .query({"access":"private"})
                                    .attach('file',fileClone.path);
           
            expect(result).to.have.status(200);

            const access = await db.getFileAccess(user1.id,result.body.id);
            expect(access.public).to.be.false;
        });

        it('Should upload a file with no access specified and it will be private', async () => {
           
            const result = await chai.request(app)
                                    .post(`/${user1.id}/file`)
                                    .attach('file',fileClone.path);

            expect(result).to.have.status(200);

            const fileAccess = await db.getFileAccess(user1.id,result.body.id);
            expect(fileAccess.public).to.be.false;
        });
    })

    describe('Download file',() => {
        const privateFile = {}
                ,publicFile = {};


        beforeEach(async () => {
            publicFile.name = `${shortUUID.generate()}.json`;
            publicFile.path = `test/resources/${publicFile.name}`;
            fs.writeFileSync(publicFile.path);

            privateFile.name = `${shortUUID.generate()}.json`;
            privateFile.path = `test/resources/${privateFile.name}`;
            fs.writeFileSync(privateFile.path);
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

        afterEach(() => {
            fs.unlinkSync(publicFile.path);
            fs.unlinkSync(privateFile.path);
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
            await db.deleteFile(user1.id,publicFile.name);
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
        const privateFile = {}
                ,publicFile = {};


        beforeEach(async () => {
            publicFile.name = `${shortUUID.generate()}.json`;
            publicFile.path = `test/resources/${publicFile.name}`;
            fs.writeFileSync(publicFile.path);

            privateFile.name = `${shortUUID.generate()}.json`;
            privateFile.path = `test/resources/${privateFile.name}`;
            fs.writeFileSync(privateFile.path);

            const publicRes = await chai.request(app)
                                .post(`/${user1.id}/file`)
                                .query({"access":"public"})
                                .attach('file',publicFile.path);
            publicFile.id = publicRes.body.id;
            publicFile.accessToken = publicRes.body.accessToken;

            const privateRes = await chai.request(app)
                                        .post(`/${user1.id}/file`)
                                        .query({"access":"private"})
                                        .attach('file',privateFile.path);

            privateFile.id = privateRes.body.id;
            privateFile.accessToken = privateRes.body.accessToken;
        })

        afterEach(() => {
            fs.unlinkSync(publicFile.path);
            fs.unlinkSync(privateFile.path);
        })

        it('Should update access from public to ptivate',async () => {
            const result = await chai.request(app)
                                        .put(`/${user1.id}/${publicFile.name}`)
                                        .query({
                                            access_token:publicFile.accessToken,
                                            access:"private"
                                        });

            expect(result).to.have.status(200);
            const access = await db.getFileAccess(user1.id,publicFile.name);
            expect(access.public).to.be.false;
        });

        it('Should update access from private to public',async () => {
            const result = await chai.request(app)
                                        .put(`/${user1.id}/${privateFile.name}`)
                                        .query({
                                            access_token:privateFile.accessToken,
                                            access:"public"
                                        });

            expect(result).to.have.status(200);
            const access = await db.getFileAccess(user1.id,privateFile.name);
            expect(access.public).to.be.true;
        });

        it('Should not let update file if access token is not provided',async () => {
            const result = await chai.request(app)
                                        .put(`/${user1.id}/${privateFile.name}`)
                                        .query({access:"public"});

            expect(result).to.have.status(400);
        });

        it('Should not let update file if access token is wrong',async () => {
            const result = await chai.request(app)
                                        .put(`/${user1.id}/${privateFile.name}`)
                                        .query({
                                            access_token:'foo',
                                            access:"public"
                                        });

            expect(result).to.have.status(400);
        });

        it('Should return 404 if file does not exist',async () => {
            const result = await chai.request(app)
                                        .put(`/${user1.id}/foo`)
                                        .query({
                                            access_token:privateFile.accessToken,
                                            access:"public"
                                        });

            expect(result).to.have.status(404);
        });
    });

    describe('Get file metadata',() => {
        const privateFile = {}
                ,publicFile = {};


        beforeEach(async () => {
            publicFile.name = `${shortUUID.generate()}.json`;
            publicFile.path = `test/resources/${publicFile.name}`;
            fs.writeFileSync(publicFile.path);

            privateFile.name = `${shortUUID.generate()}.json`;
            privateFile.path = `test/resources/${privateFile.name}`;
            fs.writeFileSync(privateFile.path);

            const publicRes = await chai.request(app)
                                .post(`/${user1.id}/file`)
                                .query({"access":"public"})
                                .attach('file',publicFile.path);
            publicFile.id = publicRes.body.id;
            publicFile.accessToken = publicRes.body.accessToken;

            const privateRes = await chai.request(app)
                                        .post(`/${user1.id}/file`)
                                        .query({"access":"private"})
                                        .attach('file',privateFile.path);

            privateFile.id = privateRes.body.id;
            privateFile.accessToken = privateRes.body.accessToken;
        })

        afterEach(() => {
            fs.unlinkSync(publicFile.path);
            fs.unlinkSync(privateFile.path);
        })
        it('Should return file metadata of public file', async () => {
            const result = await chai.request(app)
                                        .get(`/${user1.id}/${publicFile.name}`)
                                        .query({metadata:"true"});

            expect(result).to.have.status(200);
            expect(result.body).to.have.keys(['name','size','created']);
            expect(result.body.name).to.equal(publicFile.name);
        });

        it('Should return file metadata of private file with accessToken', async () => {
            const result = await chai.request(app)
                                        .get(`/${user1.id}/${privateFile.id}`)
                                        .query({
                                            metadata:"true",
                                            access_token:privateFile.accessToken
                                        });

            expect(result).to.have.status(200);
            expect(result.body).to.have.keys(['name','size','created']);
            expect(result.body.name).to.equal(privateFile.name);
        });

        it('Should not return file metadata of private file without accessToken', async () => {
            const result = await chai.request(app)
                                        .get(`/${user1.id}/${privateFile.id}`)
                                        .query({metadata:"true"});

            expect(result).to.have.status(404);
        });

        it('Should not return file metadata of private file with wrong accessToken', async () => {
            const result = await chai.request(app)
                                        .get(`/${user1.id}/${privateFile.id}`)
                                        .query({
                                            metadata:"true",
                                            access_token:'foo'
                                        });

            expect(result).to.have.status(404)
        });

        it('Should return file metadata even though file deleted', async () => {
            await chai.request(app)
                    .delete(`/${user1.id}/${publicFile.name}`)
                    .query({access_token:publicFile.accessToken});
            
            const result = await chai.request(app)
                                        .get(`/${user1.id}/${publicFile.name}`)
                                        .query({metadata:"true"});
            

            expect(result).to.have.status(200);
            expect(result.body).to.have.keys(['name','size','created','deleted']);
            expect(result.body.name).to.equal(publicFile.name);
        });

        it('Should return 404 if file does not exist', async () => {
            const result = await chai.request(app)
                                        .get(`/${user1.id}/foo`)
                                        .query({metadata:"true"});

            expect(result).to.have.status(404);
        });
    });

    describe('Delete file', async () => {
        const privateFile = {}
                ,publicFile = {};


        beforeEach(async () => {
            publicFile.name = `${shortUUID.generate()}.json`;
            publicFile.path = `test/resources/${publicFile.name}`;
            fs.writeFileSync(publicFile.path);

            privateFile.name = `${shortUUID.generate()}.json`;
            privateFile.path = `test/resources/${privateFile.name}`;
            fs.writeFileSync(privateFile.path);

            const publicRes = await chai.request(app)
                                .post(`/${user1.id}/file`)
                                .query({"access":"public"})
                                .attach('file',publicFile.path);
            publicFile.id = publicRes.body.id;
            publicFile.accessToken = publicRes.body.accessToken;

            const privateRes = await chai.request(app)
                                        .post(`/${user1.id}/file`)
                                        .query({"access":"private"})
                                        .attach('file',privateFile.path);

            privateFile.id = privateRes.body.id;
            privateFile.accessToken = privateRes.body.accessToken;
        })

        afterEach(() => {
            fs.unlinkSync(publicFile.path);
            fs.unlinkSync(privateFile.path);
        });

        it("Should delete a public file with it's name", async () => {
            const result = await chai.request(app)
                                        .delete(`/${user1.id}/${publicFile.name}`)
                                        .query({access_token:publicFile.accessToken});

            expect(result).to.have.status(200);
        });

        it("Should delete a private file with it's id", async () => {
            const result = await chai.request(app)
                                        .delete(`/${user1.id}/${privateFile.id}`)
                                        .query({access_token:privateFile.accessToken});

            expect(result).to.have.status(200);
        });

        it("Should not delete a file without accessToken", async () => {
            const result = await chai.request(app)
                                        .delete(`/${user1.id}/${privateFile.id}`);

            expect(result).to.have.status(400);
        });

        it("Should not delete a file with wrong accessToken", async () => {
            const result = await chai.request(app)
                                        .delete(`/${user1.id}/${privateFile.id}`)
                                        .query({access_token:'foo'});

            expect(result).to.have.status(400);
        });

        it("Should return 404 if file does not exist", async () => {
            const result = await chai.request(app)
                                        .delete(`/${user1.id}/foo`)
                                        .query({access_token:publicFile.accessToken});

            expect(result).to.have.status(404);
        });
    })
})