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

    // TODO: move file access check to separte function
    async downloadFile(user,file,accessToken){
        if(user == null || file == null){
            throw new Error('One argument is missing')
        }

        if(!await this._fileExist(user,file)){
            throw new Error('File does not exist');
        }

        const fileAccess = await this.db.getFileAccess(user,file);
        if(fileAccess.public){
            return await this.db.getFile(user,file);
        } else {
            if(accessToken == null){
                throw new Error('Missing access token for private file');
            } else {
                if(await this.db.verifyAccessToken(user,accessToken)){
                    return await this.db.getFile(user,file);
                } else {
                    throw new Error('Token is not verified');
                }
            }
        }
    }

    async fileMetadata(user,file,accessToken){
        if(user == null || file == null){
            throw new Error('One argument is missing')
        }

        if(!await this._fileExist(user,file)){
            throw new Error('File does not exist');
        }

        const fileAccess = await this.db.getFileAccess(user,file);
        const _fileTransform = (file) => {
            const result = { 
                name:file.name,
                size:file.size,
                created:file.create_date,
                updated:file.update_date,
                deleted:file.delete_date
            }

            Object.keys(result).forEach(key => {
                if (result[key] === null) {
                  delete result[key];
                }
              });

            return result;
        }

        if(fileAccess.public){
            return _fileTransform(await this.db.getFile(user,file));
        } else {
            if(accessToken == null){
                throw new Error('Missing access token for private file');
            } else {
                if(await this.db.verifyAccessToken(user,accessToken)){
                    return _fileTransform(await this.db.getFile(user,file));
                } else {
                    throw new Error('Token is not verified');
                }
            }
        }
    }

    async _fileExist(user,file) {
        if(await this.db.verifyFileExist(user,file)){
            return true;
        } else {
            return false;
        }
    }
}

module.exports = FilesController;