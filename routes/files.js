const express = require('express');
const router = express.Router();

const conf = require('../config');
const multer = require('multer');
const upload = multer({dest:conf.uploadsPath});

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