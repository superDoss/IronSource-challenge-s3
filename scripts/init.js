const fs = require('fs');
const path = require('path');
const __basedir = path.join(__dirname,'../')
const DB = require(path.join(__basedir,'src/db'));
const conf = require(path.join(__basedir,'config'));
const rimraf = require("rimraf");

// remove test files
rimraf.sync(path.join(__basedir,'uploads'));

const db = new DB(conf.connectionString);
const createUsersTable = fs.readFileSync(path.join(__basedir,'db/create_users.sql'),{encoding:'utf8'});
const createFilesTable = fs.readFileSync(path.join(__basedir,'db/create_files.sql'),{encoding:'utf8'});
db._db.exec(createUsersTable);
db._db.exec(createFilesTable);