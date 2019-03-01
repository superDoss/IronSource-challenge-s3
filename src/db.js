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
       }) 
    }
}

module.exports = DB;