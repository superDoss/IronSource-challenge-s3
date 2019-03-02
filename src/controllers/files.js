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

    async downloadFile(user,file,accessToken){
        if(user == null || file == null){
            throw new Error('One argument is missing')
        }

        const fileAccess = await db.getFileAccess(user,file);
        if(fileAccess.public){
            return await db.getFilePath(user,file);
        } else {
            if(accessToken == null){
                throw new Error('Missing access token for private file');
            } else {
                if(await db.verifyAccessToken(user,accessToken)){
                    return await db.getFilePath(user,file);
                } else {
                    throw new Error('Token is not verified');
                }
            }
        }

    }
}

module.exports = FilesController;