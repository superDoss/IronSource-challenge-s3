class FilesController{
    constructor(db){
        this.db = db;
    }

    async saveFile(user,file){
        if(user == null || file == null){
            throw new Error('One argument is missing')
        }

        const fileId = await this.db.insertFile(user,file);
        return fileId;
    }
}

module.exports = FilesController;