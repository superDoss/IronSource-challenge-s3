class FilesController{
    constructor(db){
        this.db = db;
    }

    saveFile(user,file){
        if(user == null || file == null){
            throw new Error('One argument is missing')
        }

        const fileId = db.insertFile(user,file);
        return fileId;
    }
}

module.exports = FilesController;