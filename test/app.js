const chai = require('chai');
chai.use(require('chai-http'));

const { should,expect } = chai;
const path = require('path');
const __basedir = path.join(__dirname,'../');

const server = require(path.join(__basedir,'app'));

describe('End to end server test',() => {
    describe('Upload file',() => {
        it('Should upload a public file',async () => {
            const result = await chai.request(server)
                .post('qAzef32F/file')
                .query({access:'public'})
                .attach('file',path.join(__dirname,'resources/test.json'));
            
            result.should.have.status(200);
            result.body.should.be.a('object');
            result.body.should.have.property(fileId);
        });
        it('Should upload a private file',() => {});
        it('Should return error if user does not exist',() => {});

    });
});