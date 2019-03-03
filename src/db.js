const sqlite3 = require('sqlite3').verbose();

class DB{
    constructor(connection){
        this._db = new sqlite3.Database(connection);
    }

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