var javaType = [];
var javaLib = [];
var truncated;
var numKeyToGenKeyClass;
var archive;
var mapClassPackage;
var mapKeyClassPackage;
var sampleData;

const DEFINATION_TYPE_MAIN = {
    "ENTITY" : 1,
    "REPOSITORY": 2,
    "SERVICE": 3,
    "INSERT": 4
};

const DEFINATION_TYPE_SUB = {
    "DISPLAY_RAW_DATA": 0,
    "DOWNLOAD_FILE": 1
};

const DEFINATION_TYPE_OPTIONAL = {
    "AUTO_PREFIX": 0,
    "TRUNCATED": 1
};

const DEFINATION_COLUMN_EXCEL_FILE = {
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
    "NUM_TO_GEN_KEY": "Num of PK to Gen Key Class",
    "CLASS_OF_REPO": "Object Class",
    "KEY_CLASS_OF_REPO": "Object Key Class",
    "PACKAGE_SERVICE": "Package Service",
    "SERVICE": "Service"
};

const DEFINATION_SHEET_NAME = {
    "GEN_ENTITY": "GenEntity",
    "GEN_REPOSITORY": "GenRepo",
    "GEN_SERVICE": "GenService",
    "CONFIG": "Config"
};

function init() {
    Object.freeze(DEFINATION_TYPE_MAIN);
    Object.freeze(DEFINATION_COLUMN_EXCEL_FILE);
    Object.freeze(DEFINATION_TYPE_OPTIONAL);
}