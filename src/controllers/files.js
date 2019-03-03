const fs = require('fs');


/**
 * @class FilesController
 * controlls any buisness logic of the files
 */
class FilesController{
    constructor(db){
        this.db = db;
    }

    /**
     * Gets a user and a file name and insert to the db
     *
     * @param {string} user
     * @param {string} file
     * @returns {string} fileId
     * @memberof FilesController
     */
    async saveFile(user,file){
        if(user == null || file == null){
            throw new Error('One argument is missing')
        }

        const fileId = await this.db.insertFile(user,file);
        return fileId;
    }

    /**
     * Returns file path from db to download
     *
     * @param {string} user
     * @param {string} file
     * @param {string} accessToken
     * @returns {object}
     * @memberof FilesController
     */
    async downloadFile(user,file,accessToken){
        if(user == null || file == null){
            throw new Error('One argument is missing')
        }

        if(!await this._fileExist(user,file)){
            throw new Error('File does not exist');
        }

        if(await this._isFileDeleted(user,file)){
            throw new Error('File has been deleted');
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
    /**
     * Gets user and file and reutrns metdata
     *
     * @param {string} user
     * @param {string} file
     * @param {string} accessToken
     * @returns {object}
     * @memberof FilesController
     */
    async fileMetadata(user,file,accessToken){
        if(user == null || file == null){
            throw new Error('One argument is missing')
        }

        if(!await this._fileExist(user,file)){
            throw new Error('File does not exist');
        }

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
        
        const fileAccess = await this.db.getFileAccess(user,file);
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
    /**
     * Update file access from public to private and vice versa
     *
     * @param {string} user
     * @param {string} file
     * @param {string} access
     * @param {string} accessToken
     * @returns {string}
     * @memberof FilesController
     */
    async updateFileAccess(user,file,access,accessToken) {
        if(user == null || file == null || access == null){
            throw new Error('One argument is missing')
        }

        if(!await this._fileExist(user,file)){
            throw new Error('File does not exist');
        }

        if(await this._isFileDeleted(user,file)){
            throw new Error('File has been deleted');
        }

        if(access.toLowerCase() === 'public'){
            access = true;
        } else if (access.toLowerCase() === 'private') {
            access = false;
        } else {
            throw new Error('Access value not public or private. value recived: ' + access);
        }

        // User can change access only with a token
        if(accessToken == null){
            throw new Error('Missing access token to change file access');
        } else {
            if(await this.db.verifyAccessToken(user,accessToken)){
                return await this.db.updateFileAccess(user,file,access);
            } else {
                throw new Error('Token is not verified');
            }
        }
    }

    /**
     * Delete a file from db and file system
     *
     * @param {string} user
     * @param {string} file
     * @param {string} accessToken
     * @returns true if file deleted
     * @memberof FilesController
     */
    async deleteFile(user,file,accessToken) {
        if(user == null || file == null){
            throw new Error('One argument is missing')
        }

        if(!await this._fileExist(user,file)){
            throw new Error('File does not exist');
        }

        if(await this._isFileDeleted(user,file)){
            throw new Error('File has already been deleted');
        }

        // User can delete file only with a token
        if(accessToken == null){
            throw new Error('Missing access token to delete private file');
        } else {
            if(await this.db.verifyAccessToken(user,accessToken)){
                const filePath = await this.db.deleteFile(user,file);
                fs.unlinkSync(filePath);
                return true;
            } else {
                throw new Error('Token is not verified');
            }
        }
    }

    /**
     * Check if file exist in db
     * @private
     * @param {string} user
     * @param {string} file
     * @returns {boolean}
     * @memberof FilesController
     */
    async _fileExist(user,file) {
        if(await this.db.verifyFileExist(user,file)){
            return true;
        } else {
            return false;
        }
    }

    /**
     * Check if file has been deleted
     *
     * @param {string} user
     * @param {string} file
     * @returns {boolean}
     * @memberof FilesController
     */
    async _isFileDeleted(user,file) {
        if(await this.db.isFileDeleted(user,file)){
            return true;
        } else {
            return false;
        }
    }
}

module.exports = FilesController;