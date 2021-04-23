const DEFINATION_TYPE = {
    "Generate": 0,
    "Download": 1,
    "Insert": 2,
    "Update": 3,
    "Delete": 4
};

const DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS = {
    "DB_TABLE": "Database Table Name",
    "DB_COLUMN": "Field Column Name",
    "JAVA_CLASS": "Java Class Name",
    "JAVA_ATTRIBUTE": "Java Attribute Name",
    "JAVA_TYPE": "Data Type",
    "PREFIX": "Prefix",
    "NULLABLE": "Nullable",
    "PRIMARY_KEY": "Primary Key",
    "AUTHOR": "Author",
    "COMMENT": "Comment"
};

function init() {
    Object.freeze(DEFINATION_TYPE);
    Object.freeze(DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS);
}