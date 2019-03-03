const sqlite3 = require('sqlite3').verbose();
/**
 * Class to represent action in front of the database
 *
 * @class DB
 */
class DB{
    constructor(connection){
        this._db = new sqlite3.Database(connection);
    }
    
    /**
     * Insert file to db
     *
     * @param {object} user
     * @param {object} file
     * @returns {Promise}
     * @memberof DB
     */
    async insertFile(user,file){
        const  statment = `INSERT INTO files (id,user_id,name,size,path,create_date,public) 
                            VALUES (?,?,?,?,?,?,?)`;
        const params = [
            file.filename,
            user.id,
            file.originalname,
            file.size,
            file.path,
            new Date().toISOString(),
            file.public
        ];

       return new Promise((resolve,reject) => {
            this._db.run(statment,params,(err) => {
                if(err){
                    reject(err);
                } else {
                    resolve(file.filename);
                }
            })
       }); 
    }

    /**
     * Get file current access from db
     *
     * @param {string} user
     * @param {string} file
     * @returns {Promise{object}}
     * @memberof DB
     */
    async getFileAccess(user,file){
        const statment = `SELECT public FROM files
                          WHERE user_id=? AND (id=? OR name=?)`;
        
        const params = [user,file,file];

        return new Promise((resolve,reject) => {
            this._db.get(statment,params,(err,row) => {
                if(err){
                    reject(err);
                } if (row === undefined){
                    reject('No rows returned');
                } else {
                    const isPublic  = row['public'];
                    if(isPublic){
                        resolve({public:true});
                    } else {
                        resolve({public:false});
                    }
                }
            })
        });
    }
    
    /**
     *  Get file metadata from db
     *
     * @param {string} user
     * @param {string} file
     * @returns {Promise{object}}
     * @memberof DB
     */
    async getFile(user,file) {
        const statment = `SELECT id,user_id,name,size,path,create_date,update_date,delete_date,public FROM files
                          WHERE user_id=? AND (id=? OR name=?)`;

        const params = [user,file,file];

        return new Promise((resolve,reject) => {
            this._db.get(statment,params,(err,file) => {
                if(err){
                    reject(err);
                }  else if(file === undefined) {
                    reject('No rows returned')
                } else {
                    resolve(file);
                }
            })
        })
    }
    
    /**
     *  Update file access in db
     *
     * @param {string} user
     * @param {string} file
     * @param {boolean} access
     * @returns {Promise{object}}
     * @memberof DB
     */
    async updateFileAccess(user,file,access) {
        const statment = `UPDATE files SET public=?,update_date=? WHERE user_id=? AND (id=? OR name=?)`;
        const params = [access,new Date().toISOString(),user,file,file];

        return new Promise((resolve,reject) => {
            this._db.run(statment,params,(err) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(access);
                }
            })
        })
    }
    
    /**
     *  Change file status to be deleted
     *
     * @param {string} user
     * @param {string} file
     * @returns {Promise}
     * @memberof DB
     */
    async deleteFile(user,file) {
        const statment = `UPDATE files SET delete_date=? WHERE user_id=? AND (id=? OR name=?)`;
        const params = [new Date().toISOString(),user,file,file];
        const fileResult = await this.getFile(user,file);

        return new Promise((resolve,reject) => {
            this._db.run(statment,params,(err) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(fileResult.path);
                }
            })
        })
    }

    /**
     * Verify that access token is correct
     *
     * @param {string} user
     * @param {string} accessToken
     * @returns {Promise{boolean}}
     * @memberof DB
     */
    async verifyAccessToken(user,accessToken) {
        const statment = `SELECT access_token FROM users WHERE id=?`;
        const params = [user];

        return new Promise((resolve,reject) => {
            this._db.get(statment,params,(err,row) => {
                if(err){
                    reject(err);
                }  else if(row === undefined) {
                    reject('No rows returned')
                } else {
                    const token = row['access_token'];
                    
                    if(token === accessToken){
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }
            })
        })
    }

    /**
     * Check if file exist in db
     *
     * @param {string} user
     * @param {string} file
     * @returns {boolean}
     * @memberof DB
     */
    async verifyFileExist(user,file){
        const statment = `SELECT id FROM files WHERE user_id=? AND (id=? OR name=?)`;
        const params = [user,file,file];

        return new Promise((resolve,reject) => {
            this._db.get(statment,params,(err,row) => {
                if(err){
                    reject(err);
                } else {
                    if(row){
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }
            })
        }) 
    }

    /**
     * Check if file have been deleted
     *
     * @param {string} user
     * @param {string} file
     * @returns {boolean}
     * @memberof DB
     */
    async isFileDeleted(user,file) {
        const statment = `SELECT id,delete_date FROM files WHERE user_id=? AND (id=? OR name=?) AND delete_date IS NOT NULL`;
        const params = [user,file,file];

        return new Promise((resolve,reject) => {
            this._db.get(statment,params,(err,row) => {
                if(err){
                    reject(err);
                } else {
                    if(row){
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }
            })
        }) 
    }
}

module.exports = DB;