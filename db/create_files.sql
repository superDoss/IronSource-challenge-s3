DROP TABLE IF EXISTS files; 
CREATE TABLE files (
    id varchar, 
    name varchar, 
    size integer,
    create_date datetime,
    update_date datetime,
    delete_date datetime, 
    public boolean);