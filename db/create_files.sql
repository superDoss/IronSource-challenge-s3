DROP TABLE IF EXISTS files; 
CREATE TABLE files (
    id varchar,
    user_id varchar,
    name varchar, 
    size integer,
    path varchar,
    access_token varchar,
    create_date datetime,
    update_date datetime,
    delete_date datetime,
    public boolean);