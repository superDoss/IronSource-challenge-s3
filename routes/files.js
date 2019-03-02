const express = require('express');
const router = express.Router();

//TODO: Change to basedir
const conf = require('../config');
const path = require('path');

const multer = require('multer');

const storage = multer.diskStorage({
    destination:conf.uploadsPath,
    // Make sure file name is unique
    filename:(req,file,cb) => {
        cb(null,Math.random().toString(36).substr(2, 9));
    }
});

const upload = multer({ storage:storage });

//TODO: Change to basedir
const FilesController = require('../src/controllers/files');
const DB = require('../src/db');
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

    const fileId = await filesController.saveFile(user,file);
    res.json({fileId:fileId});
});

module.exports = router;