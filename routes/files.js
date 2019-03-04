const express = require('express');
const router = express.Router();

const path = require('path');
const __basedir = path.join(__dirname,'../')
const conf = require(path.join(__basedir,'config'));

const shortUUID = require('short-uuid');
const multer = require('multer');

const storage = multer.diskStorage({
    destination:conf.uploadsPath,
    // Make sure file name is unique
    filename:(req,file,cb) => {
        cb(null,shortUUID.generate());
    }
});

const upload = multer({ storage:storage });

const FilesController = require(path.join(__basedir,'src/controllers/files'));
const DB = require(path.join(__basedir,'src/db'));
const db = new DB(conf.connectionString);
const filesController = new FilesController(db);


router.post('/:userId/file',upload.single('file'),async (req,res,next) => {
    
    const file = req.file;

    const { access }  = req.query;
    const { userId }  = req.params;
    
    if(access && access.toLowerCase() === 'public'){
        file.public = true;
    } else {
        file.public = false;
    }

    const user = {
        id:userId
    };

    const fileResult = await filesController.saveFile(user,file);
    res.json(fileResult);
});

router.get('/:userId/:file',async (req,res,next) => {
    const { userId,file } = req.params;
    const { access_token,metadata } = req.query;

    if(metadata && metadata === 'true'){
        try{
            const fileMeta = await filesController.fileMetadata(userId,file,access_token);
            res.json(fileMeta);
        } catch (err) {
            res.status(404).end(err.message);
        }
    } else {
        try{
            const fileResult = await filesController.downloadFile(userId,file,access_token);
            res.status(200)
                .download(fileResult.path,fileResult.name,{ dotfiles:'allow' });
        } catch (err) {
            switch(err.message){
                case('File does not exist' || 'File has been deleted'):
                    res.status(404).end(err.message);
                    return;
                case('Missing access token for private file' || 'Token is not verified'):
                    res.status(400).end(err.message);
                    return;
            }
            
        }
    }
});

router.put('/:userId/:file',async (req,res,next) => {
    const { userId,file } = req.params;
    const { access_token,access } = req.query;

    try{
        const result = await filesController.updateFileAccess(userId,file,access,access_token);
        res.status(200).end(access);
        
    } catch (err) {
        res.status(400).end(err.message);
    }
})

router.delete('/:userId/:file',async (req,res,next) => {
    const { userId,file } = req.params;
    const { access_token } = req.query;

    try{
        const result = await filesController.deleteFile(userId,file,access_token);
        if(result){
            res.status(200).end();
        } else {
            res.status(400).end();
        }
    } catch (err) {
        if(err.message === 'File has been deleted' || err.message === 'File does not exist'){
            res.status(404).end('File not found');
        } else {
            res.status(400).end(err.message);
        }
    }
})

module.exports = router;