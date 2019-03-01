const express = require('express');
const router = express.Router();

//TODO: Change to basedir
const conf = require('../config');
const path = require('path');

const multer = require('multer');

const storage = multer.diskStorage({
    destination:conf.uploadsPath,
    // Make sure file name is uniqe
    filename:(req,file,cb) => {
        cb(null,Math.random().toString(36).substr(2, 9) + `_${file.originalname}`);
    }
});

const upload = multer({ storage:storage });

//TODO: Change to basedir
const FilesController = require('../src/controllers/files');
const filesController = new FilesController();

router.get('/upload',upload.single('file'),async (req,res,next) => {
    file = req.file;
    // TODO: check string for public and private
    file.public = req.query['access'];

    // TODO: Where do i get the user
    const fileId = await filesController.saveFile(user,file)
    res.send(fileId);
})