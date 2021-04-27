var javaType = [];
var javaLib = [];
var truncated;
var numKeyToGenKeyClass;
const archive = new JSZip();

const DEFINATION_TYPE = {
    "Generate": 0,
    "Download": 1,
    "Insert": 2,
    "Update": 3,
    "Delete": 4
};

const DEFINATION_TYPE_SUB = {
    "AUTO_PREFIX": 0,
    "TRUNCATED": 1
};

const DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS = {
    "DB_TABLE": "Database Table Name",
    "DB_COLUMN": "Field Column Name",
    "PACKAGE": "Package",
    "PACKAGE_KEY": "Package Key",
    "JAVA_CLASS": "Java Class Name",
    "JAVA_ATTRIBUTE": "Java Attribute Name",
    "JAVA_TYPE": "Data Type",
    "PREFIX": "Prefix",
    "NULLABLE": "Nullable",
    "PRIMARY_KEY": "Primary Key",
    "AUTHOR": "Author",
    "COMMENT": "Comment",
    "FROM": "From",
    "TO": "To",
    "LIBRARY": "Library",
    "TRUNCATED": "Truncated Num",
    "NUM_TO_GEN_KEY": "Num of PK to Gen Key Class"
};

const DEFINATION_SHEET_NAME = {
    "GEN_ENTITY": "GenEntity",
    "JAVA_TYPE_MAPPING": "DataTypeMapping"
};

function init() {
    Object.freeze(DEFINATION_TYPE);
    Object.freeze(DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS);
    Object.freeze(DEFINATION_TYPE_SUB);
}