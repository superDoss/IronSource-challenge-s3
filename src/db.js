const sqlite3 = require('sqlite3').verbose();

class DB{
    //TODO: intialize db testing
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
        
        const params = [user.id,file.filename,file.originalname];

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

    async getFilePath(user,file) {
        const statment = `SELECT path FROM files
                          WHERE user_id=? AND (id=? OR name=?)`;

        const params = [user.id,file.filename,file.originalname];

        return new Promise((resolve,reject) => {
            this._db.get(statment,params,(err,row) => {
                if(err){
                    reject(err);
                }  else if(row === undefined) {
                    reject('No rows returned')
                } else {
                    resolve(row['path']);
                }
            })
        })
    }

    async verifyAccessToken(user,accessToken) {
        const statment = `SELECT access_token FROM users WHERE id=?`;
        const params = [user.id];

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
        const params = [user.id,file.filename,file.originalname];

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