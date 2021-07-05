function countTimeExecution() {
    let date = new Date();
    document.getElementById("count_time").innerHTML = date.now().toString();
}

async function upload() {
    console.log("Start");
//    let t0 = performance.now();
//    console.log(t0);
    sampleData = [];
//    sampleData = (await readTextFile("sampleEntity.txt")).split("\r\n");
    var fileUpload = validateExcelFile();
    if (fileUpload === null) {
        return;
    }

    archive = new JSZip();

    let typeMain = getTypeMain();
    let typeSub = getTypeSub();
    let typeOptional = getTypeOptional();
    mapClassPackage = [];
    mapKeyClassPackage = [];
    readExcelFile(fileUpload, typeMain, typeSub, typeOptional);

    console.log("End");
}

function compressFile(filename, data, type) {
    //archive.file(filename + getJavaClassType(), data);
    switch (type) {
        case DEFINATION_TYPE_MAIN.ENTITY:
            archive.folder("entity").file(filename + getJavaClassType(), data);
            break;
        case DEFINATION_TYPE_MAIN.ENTITY_KEY:
            archive.folder("entity_key").file(filename + getJavaClassType(), data);
            break;
        case DEFINATION_TYPE_MAIN.REPOSITORY:
            archive.folder("repository").file(filename + getJavaClassType(), data);
            break;
        case DEFINATION_TYPE_MAIN.SERVICE:
            archive.folder("service").file(filename + getJavaClassType(), data);
            break;
        default:
            break;
    }
}

function download(filename, typeArchive) {
    let size = 0;
    archive.forEach((file) => size += file ? 1 : 0);

    if (size === 0) {
        return;
    }

    let output = filename;
    if (size === 1) {
//        var element = document.createElement('a');
//        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(archive.files[0]));
//        element.setAttribute('download', filename + getJavaClassType());
//        element.style.display = 'none';
//        document.body.appendChild(element);
//        element.click();
//        document.body.removeChild(element);
        output += getJavaClassType();
    } else {
        output += typeArchive;
    }

    archive.generateAsync({type: "blob"})
            .then(function (content) {
                saveAs(content, output);
            });
}

function makeInsertStatement() {
    var fileUpload = validateExcelFile();
    if (fileUpload === null) {
        return;
    }

    let type = getTypeMain();
    readExcelFile(fileUpload, type);
}

function initJavaTypeMapping(data) {
    let excelRows = XLSX.utils.sheet_to_row_object_array(importExcel(data, DEFINATION_SHEET_NAME.CONFIG, 3));

    javaType = [];
    javaLib = [];
    for (let i = 0; i < excelRows.length; i++) {
        javaType[excelRows[i][DEFINATION_COLUMN_EXCEL_FILE.FROM].toLowerCase()] = excelRows[i][DEFINATION_COLUMN_EXCEL_FILE.TO];
        if (excelRows[i][DEFINATION_COLUMN_EXCEL_FILE.LIBRARY]) {
            javaLib[excelRows[i][DEFINATION_COLUMN_EXCEL_FILE.TO]] = excelRows[i][DEFINATION_COLUMN_EXCEL_FILE.LIBRARY];
        }
    }
}

function initJavaPrefixMapping(data) {
    let excelRows = XLSX.utils.sheet_to_row_object_array(importExcel(data, DEFINATION_SHEET_NAME.CONFIG, 3));

    javaPrefix = [];
    for (let i = 0; i < excelRows.length; i++) {
        if (excelRows[i][DEFINATION_COLUMN_EXCEL_FILE.JAVA_TYPE]) {
            javaPrefix[excelRows[i][DEFINATION_COLUMN_EXCEL_FILE.JAVA_TYPE]] = excelRows[i][DEFINATION_COLUMN_EXCEL_FILE.PREFIX];
        }
    }
}

function initNumToGenKeyClass(data) {
    let excelRows = XLSX.utils.sheet_to_row_object_array(importExcel(data, DEFINATION_SHEET_NAME.CONFIG, 3));

    if (excelRows[0][DEFINATION_COLUMN_EXCEL_FILE.NUM_TO_GEN_KEY]) {
        numKeyToGenKeyClass = excelRows[0][DEFINATION_COLUMN_EXCEL_FILE.NUM_TO_GEN_KEY];
    } else {
        numKeyToGenKeyClass = 0;
    }
}

function initTruncatedNum(data) {
    let excelRows = XLSX.utils.sheet_to_row_object_array(importExcel(data, DEFINATION_SHEET_NAME.CONFIG, 3));

    if (excelRows[0][DEFINATION_COLUMN_EXCEL_FILE.TRUNCATED]) {
        truncated = excelRows[0][DEFINATION_COLUMN_EXCEL_FILE.TRUNCATED];
    } else {
        truncated = 0;
    }
}

function validateJavaType(data) {
    let excel = importExcel(data, DEFINATION_SHEET_NAME.CONFIG, 3);
    let error = "";
    // check key header
    error += checkSingleMandatoryField(excel.A1.v, DEFINATION_COLUMN_EXCEL_FILE.FROM, "A1");
    error += checkSingleMandatoryField(excel.B1.v, DEFINATION_COLUMN_EXCEL_FILE.TO, "B1");
    error += checkSingleMandatoryField(excel.C1.v, DEFINATION_COLUMN_EXCEL_FILE.LIBRARY, "C1");
    if (error) {
        alert(error);
        return false;
    }

    return true;
}

function validateExcelFile() {
//Reference the FileUpload element.
    var fileUpload = document.getElementById("fileUpload");
    //Validate whether File is valid Excel file.
    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;
    if (!regex.test(fileUpload.value.toLowerCase())) {
        alert("Please upload a valid Excel file.");
        return null;
    }

// Check browser support HTML5 or not
    if (typeof (FileReader) === "undefined") {
        alert("This browser does not support HTML5.\n Please update to latest browser version");
        return null;
    }

    return fileUpload;
}

function checkSingleMandatoryField(data, field, pos) {
    let error = "";
    try {
        if (data !== field) {
            error += "Missing " + field + " field at " + pos + "\n";
        }
    } catch (err) {
        error += "Missing " + field + " field at " + pos + "\n";
    }
    return error;
}

function checkPrefix(value, prefix) {
    if (prefix) {
        value.unshift(prefix);
    }
    return value;
}

function importExcel(data, sheetname, defaultSheet) {
    //Read the Excel File data.
    let workbook = XLSX.read(data, {
        type: 'binary'
    });
    //Fetch the name of First Sheet.

    // get sheet name of gen entity
    let result = sheetname;
    if (result === "undefined") {
        result = workbook.SheetNames[defaultSheet];
    }
    ;
    return workbook.Sheets[result];
}

function readExcelFile(file, typeMain, typeSub, typeOptional) {
    console.log("Read File");
    var reader = new FileReader();
    //For Browsers other than IE.
    if (reader.readAsBinaryString) {
        reader.onload = function (e) {
            for (let type of typeMain) {
                switch (parseInt(type)) {
                    case DEFINATION_TYPE_MAIN.ENTITY:
                        if (!isHasMandatoryFieldEntity(e.target.result)) {
                            return;
                        }
                        if (!validateJavaType(e.target.result)) {
                            return;
                        }
                        break;
                    case DEFINATION_TYPE_MAIN.REPOSITORY:
                        if (!isHasMandatoryFieldRepo(e.target.result)) {
                            return;
                        }
                        break;
                    case DEFINATION_TYPE_MAIN.SERVICE:
                        return;
                    default :
                        return;
                }
            }


            initJavaTypeMapping(e.target.result);
            initJavaPrefixMapping(e.target.result);
            initNumToGenKeyClass(e.target.result);
            initTruncatedNum(e.target.result);

            let isDownload = typeSub == DEFINATION_TYPE_SUB.DOWNLOAD_FILE ? true : false;
            for (let type of typeMain) {
                switch (parseInt(type)) {
                    case DEFINATION_TYPE_MAIN.ENTITY:
                        processGenEntity(e.target.result, isDownload, typeOptional);
                        break;
                    case DEFINATION_TYPE_MAIN.REPOSITORY:
                        processGenRepository(e.target.result, isDownload);
                        break;
                    case DEFINATION_TYPE_MAIN.SERVICE:
                        break;
                    default :
                        break;
                }
            }

            if (isDownload) {
                let filename = document.getElementById("filename");
                download(filename.value, ".zip");
            }
        };
        reader.readAsBinaryString(file.files[0]);
    } else {
        //For IE Browser.
        reader.onload = function (e) {
            if (!isHasMandatoryFieldEntity(e.target.result)) {
                return;
            }
            if (!validateJavaType(e.target.result)) {
                return;
            }

            var data = "";
            var bytes = new Uint8Array(e.target.result);
            for (var i = 0; i < bytes.byteLength; i++) {
                data += String.fromCharCode(bytes[i]);
            }

            initJavaTypeMapping(e.target.result);
            initJavaPrefixMapping(e.target.result);
            initNumToGenKeyClass(e.target.result);

            let isDownload = typeSub == DEFINATION_TYPE_SUB.DOWNLOAD_FILE ? true : false;
            for (let type of typeMain) {
                switch (parseInt(type)) {
                    case DEFINATION_TYPE_MAIN.ENTITY:
                        processGenEntity(e.target.result, isDownload, typeOptional);
                        break;
                    case DEFINATION_TYPE_MAIN.REPOSITORY:
                        processGenRepository(e.target.result, isDownload);
                        break;
                    case DEFINATION_TYPE_MAIN.SERVICE:
                        break;
                    default :
                        break;
                }
            }

            if (isDownload) {
                let filename = document.getElementById("filename");
                download(filename.value, ".zip");
            }
        };
        reader.readAsArrayBuffer(file.files[0]);
    }
}

async function readTextFile(file) {
    return await fetch(file, {mode: 'no-cors'})
            .then(response => response.text())
            .then(data => {
                return data;
                //sampleData = data.split("\r\n");
            });
}

function isHasMandatoryFieldEntity(data) {
    let excel = importExcel(data, DEFINATION_SHEET_NAME.GEN_ENTITY, 0);
    let error = "";
    // check key header
    error += checkSingleMandatoryField(excel.A1.v, DEFINATION_COLUMN_EXCEL_FILE.DB_TABLE, "A1");
    error += checkSingleMandatoryField(excel.B1.v, DEFINATION_COLUMN_EXCEL_FILE.DB_COLUMN, "B1");
    error += checkSingleMandatoryField(excel.C1.v, DEFINATION_COLUMN_EXCEL_FILE.PACKAGE, "C1");
    error += checkSingleMandatoryField(excel.D1.v, DEFINATION_COLUMN_EXCEL_FILE.PACKAGE_KEY, "D1");
    error += checkSingleMandatoryField(excel.E1.v, DEFINATION_COLUMN_EXCEL_FILE.JAVA_CLASS, "E1");
    error += checkSingleMandatoryField(excel.F1.v, DEFINATION_COLUMN_EXCEL_FILE.JAVA_ATTRIBUTE, "F1");
    error += checkSingleMandatoryField(excel.G1.v, DEFINATION_COLUMN_EXCEL_FILE.JAVA_TYPE, "G1");
    error += checkSingleMandatoryField(excel.H1.v, DEFINATION_COLUMN_EXCEL_FILE.PREFIX, "H1");
    error += checkSingleMandatoryField(excel.I1.v, DEFINATION_COLUMN_EXCEL_FILE.NULLABLE, "I1");
    error += checkSingleMandatoryField(excel.J1.v, DEFINATION_COLUMN_EXCEL_FILE.PRIMARY_KEY, "J1");
    error += checkSingleMandatoryField(excel.K1.v, DEFINATION_COLUMN_EXCEL_FILE.AUTHOR, "K1");
    error += checkSingleMandatoryField(excel.L1.v, DEFINATION_COLUMN_EXCEL_FILE.COMMENT, "L1");
    if (error) {
        alert(error);
        return false;
    }

    return true;
}

function isHasMandatoryFieldRepo(data) {
    let excel = importExcel(data, DEFINATION_SHEET_NAME.GEN_REPOSITORY, 1);
    let error = "";
    // check key header
    error += checkSingleMandatoryField(excel.A1.v, DEFINATION_COLUMN_EXCEL_FILE.PACKAGE, "A1");
    error += checkSingleMandatoryField(excel.B1.v, DEFINATION_COLUMN_EXCEL_FILE.JAVA_CLASS, "B1");
    error += checkSingleMandatoryField(excel.C1.v, DEFINATION_COLUMN_EXCEL_FILE.CLASS_OF_REPO, "C1");
    error += checkSingleMandatoryField(excel.D1.v, DEFINATION_COLUMN_EXCEL_FILE.KEY_CLASS_OF_REPO, "D1");
    if (error) {
        alert(error);
        return false;
    }

    return true;
}

function isEndTable(data, startPos, endPos) {
    let startNameTable = data[startPos][DEFINATION_COLUMN_EXCEL_FILE.JAVA_CLASS];
    let endNameTable = data.length - 1 !== endPos ? data[endPos][DEFINATION_COLUMN_EXCEL_FILE.JAVA_CLASS] : "";
    return startNameTable !== endNameTable;
}

function isPrimaryKey(data, startPos, endPos, isTheLastTable) {
    let indexes = [];
    let count = -1;
    let lengh = isTheLastTable ? endPos + 1 : endPos;
    for (var i = startPos; i < lengh; i++) {
        if (data[i][DEFINATION_COLUMN_EXCEL_FILE.PRIMARY_KEY]) {
            if (data[i][DEFINATION_COLUMN_EXCEL_FILE.PRIMARY_KEY].toString().toLowerCase() === "true" ||
                    data[i][DEFINATION_COLUMN_EXCEL_FILE.PRIMARY_KEY] === 1 ||
                    data[i][DEFINATION_COLUMN_EXCEL_FILE.PRIMARY_KEY].toString().toLowerCase() === "yes") {
                indexes[++count] = i;
            }
        }
    }
    return indexes;
}

function isFoundValueTypeOptional(data, key) {
    for (let i = 0; i < data.length; i++) {
        if (key === parseInt(data[i])) {
            return true;
        }
    }
    return false;
}

function isCreateIdClass(numKey) {
    return numKey >= numKeyToGenKeyClass;
}

function makeCreateClassTemplate(tableName, data) {
    var childDiv = document.createElement('div');
    childDiv.setAttribute('class', 'result');
    var h3 = document.createElement('h3');
    h3.innerHTML = tableName;
    data = data.replaceAll("\n", "<br/>");
    var pre = document.createElement('pre');
    pre.innerHTML = data;
    childDiv.appendChild(h3);
    childDiv.appendChild(pre);
    var parentDiv = document.getElementById('result-container');
    parentDiv.appendChild(childDiv);
}

function makeRawRepository(data, index) {
    let package = "";
    let importLib = "";
    let comment = "";
    let annotation = "";
    let classContent = "";

    package = getPackageRepo(data[index][DEFINATION_COLUMN_EXCEL_FILE.PACKAGE],
            data[index][DEFINATION_COLUMN_EXCEL_FILE.PACKAGE] + ".dao");

    importLib = getRepositoryImport() + getNewLine();
    importLib += getCustomImport(upperCaseCamel(data[index][DEFINATION_COLUMN_EXCEL_FILE.JAVA_CLASS]), false);
    importLib += getCustomImport(upperCaseCamel(data[index][DEFINATION_COLUMN_EXCEL_FILE.JAVA_CLASS] + "Key"), true);

    comment = getNewLine();
    comment += getCommentJapanese(upperCaseCamel(data[index][DEFINATION_COLUMN_EXCEL_FILE.JAVA_CLASS]),
            null,
            data[index][DEFINATION_COLUMN_EXCEL_FILE.AUTHOR],
            data[index][DEFINATION_COLUMN_EXCEL_FILE.COMMENT]);

    annotation = getNewLine();
    annotation += getRepositoryAnnotation();

    var objectClass = data[index][DEFINATION_COLUMN_EXCEL_FILE.JAVA_CLASS];
//    if (objectClass !== undefined && objectClass !== null) {
//        objectClass = data[index][DEFINATION_COLUMN_EXCEL_FILE.CLASS_OF_REPO];
//    } else {
//        objectClass = "N/A";
//    }

    let keyClass = data[index][DEFINATION_COLUMN_EXCEL_FILE.JAVA_CLASS] + "Key";
//    if (keyClass !== undefined && keyClass !== null) {
//        keyClass = objectClass + "Key";
//    } else {
//        keyClass = "N/A";
//    }
    classContent += getInterfaceName(
            upperCaseCamel(data[index][DEFINATION_COLUMN_EXCEL_FILE.JAVA_CLASS]),
            upperCaseCamel(objectClass),
            upperCaseCamel(keyClass));
    classContent += " " + getLeftBraces();
    classContent += getNewLine() + getNewLine();
    classContent += getRightBraces();

    return package + "\n" + importLib + "\n" + comment + annotation + classContent;
}

function makeRawEntity(data, startPos, endPos, isTheLastTable, optional, numKey) {
    let package = "";
    let importLib = "";
    let comment = "";
    let annotation = "";
    let classContent = "";
    let countPK = 0;

    package = getPackage(data[startPos][DEFINATION_COLUMN_EXCEL_FILE.PACKAGE]);

    importLib = getLombokImport() +
            getNewLine() +
            getJsonObjectImport() +
            getNewLine() +
            getPersistenceImport();

    comment = getCommentJapanese(
            upperCaseCamel(data[startPos][DEFINATION_COLUMN_EXCEL_FILE.JAVA_CLASS]),
            data[startPos][DEFINATION_COLUMN_EXCEL_FILE.DB_TABLE],
            data[startPos][DEFINATION_COLUMN_EXCEL_FILE.AUTHOR],
            data[startPos][DEFINATION_COLUMN_EXCEL_FILE.COMMENT]);

    annotation = getLombokAnnotation();
    annotation += getEntityAnnotation();
    annotation += getTableAnnotation(data[startPos][DEFINATION_COLUMN_EXCEL_FILE.DB_TABLE], "public");
    annotation += getNewLine();

    classContent += getClassName(upperCaseCamel(data[startPos][DEFINATION_COLUMN_EXCEL_FILE.JAVA_CLASS]),
            getExtendJsonObject());
    classContent += " " + getLeftBraces();
    classContent += getNewLine() + getNewLine();

    let lengh = isTheLastTable ? endPos + 1 : endPos;
    for (var i = startPos; i < lengh; i++) {
        if (data[i][DEFINATION_COLUMN_EXCEL_FILE.COMMENT_ON_ATTRIBUTE]) {
            classContent += getTab();
            classContent +=  "/* ";
            classContent += data[i][DEFINATION_COLUMN_EXCEL_FILE.COMMENT_ON_ATTRIBUTE];
            classContent +=  " */";
            classContent += getNewLine();
        }
        
        let isKey = false;
        if (data[i][DEFINATION_COLUMN_EXCEL_FILE.PRIMARY_KEY]) {
            if (data[i][DEFINATION_COLUMN_EXCEL_FILE.PRIMARY_KEY].toString().toLowerCase() === "true" ||
                    data[i][DEFINATION_COLUMN_EXCEL_FILE.PRIMARY_KEY] === 1 ||
                    data[i][DEFINATION_COLUMN_EXCEL_FILE.PRIMARY_KEY].toString().toLowerCase() === "yes") {
                classContent += getTab();
                classContent += "@Id";
                classContent += getNewLine();
                isKey = true;
                countPK++;
            }
        }

        classContent += getTab();
        classContent += getColumnAnnotation();
        classContent += getQuotes() + data[i][DEFINATION_COLUMN_EXCEL_FILE.DB_COLUMN] + getQuotes();
        if (!isKey) {
            if (data[i][DEFINATION_COLUMN_EXCEL_FILE.NULLABLE]) {
                if (data[i][DEFINATION_COLUMN_EXCEL_FILE.NULLABLE].toString().toLowerCase() === "false" ||
                        data[i][DEFINATION_COLUMN_EXCEL_FILE.NULLABLE] === 0 ||
                        data[i][DEFINATION_COLUMN_EXCEL_FILE.NULLABLE].toString().toLowerCase() === "no") {
                    classContent += ", nullable = false";
                }
            }
        }

        classContent += getRightParentheses();
        classContent += getNewLine();
        classContent += getTab();
        classContent += getModifier("private");

        let javaType = data[i][DEFINATION_COLUMN_EXCEL_FILE.JAVA_TYPE] !== "undefined" ?
                data[i][DEFINATION_COLUMN_EXCEL_FILE.JAVA_TYPE] : "String";
        javaType = getTypeJava(javaType);
        importLib += addAdditionalImport(importLib, javaType);

        let isTruncated = isFoundValueTypeOptional(optional, DEFINATION_TYPE_SUB.TRUNCATED);
        classContent += javaType + " ";
        if (isFoundValueTypeOptional(optional, DEFINATION_TYPE_SUB.AUTO_PREFIX)) {
            classContent += splitandCamelCaseString(
                    data[i][DEFINATION_COLUMN_EXCEL_FILE.JAVA_ATTRIBUTE],
                    javaPrefix[javaType],
                    /[_ ]+/,
                    isTruncated);
        } else {
            classContent += splitandCamelCaseString(
                    data[i][DEFINATION_COLUMN_EXCEL_FILE.JAVA_ATTRIBUTE],
                    data[i][DEFINATION_COLUMN_EXCEL_FILE.PREFIX],
                    /[_ ]+/,
                    isTruncated);
        }
        classContent += getSemicolon();
        classContent += getNewLine();
        classContent += getNewLine();
    }
    classContent += getRightBraces();
    if (isCreateIdClass(countPK)) {
        importLib += getIdClassImport();
        annotation += getIdClassAnnotation(upperCaseCamel(data[startPos][DEFINATION_COLUMN_EXCEL_FILE.JAVA_CLASS] + "Key"));
        annotation += getNewLine();
    }
    setNumKeyInClass(numKey, countPK);
    mapClassPackage[upperCaseCamel(data[startPos][DEFINATION_COLUMN_EXCEL_FILE.JAVA_CLASS])] = data[startPos][DEFINATION_COLUMN_EXCEL_FILE.PACKAGE];

    return package + "\n" + importLib + "\n" + comment + annotation + classContent;
}

function makeRawKeyEntity(data, indexes, optional) {
    let package = "";
    let importLib = "";
    let comment = "";
    let annotation = "";
    let classContent = "";

    package = getPackageKey(data[indexes[0]][DEFINATION_COLUMN_EXCEL_FILE.PACKAGE_KEY],
            data[indexes[0]][DEFINATION_COLUMN_EXCEL_FILE.PACKAGE] + ".key");

    importLib = getSerializableImport() +
            getNewLine() +
            getLombokImport() +
            getNewLine();

    comment = getCommentJapanese(
            upperCaseCamel(data[indexes[0]][DEFINATION_COLUMN_EXCEL_FILE.JAVA_CLASS]),
            data[indexes[0]][DEFINATION_COLUMN_EXCEL_FILE.DB_TABLE],
            data[indexes[0]][DEFINATION_COLUMN_EXCEL_FILE.AUTHOR],
            data[indexes[0]][DEFINATION_COLUMN_EXCEL_FILE.COMMENT]);

    annotation = getLombokAnnotation();

    classContent += getClassName(upperCaseCamel(data[indexes[0]][DEFINATION_COLUMN_EXCEL_FILE.JAVA_CLASS] + "Key"),
            getImplSerializable());
    classContent += " " + getLeftBraces();
    classContent += getNewLine() + getNewLine();

    classContent += getTab();
    classContent += getSerialVersionUID();
    classContent += getNewLine();
    indexes.forEach(function (index) {
        classContent += getNewLine();
        classContent += getTab();
        classContent += getModifier("private");

        let javaType = data[index][DEFINATION_COLUMN_EXCEL_FILE.JAVA_TYPE] !== "undefined" ?
                data[index][DEFINATION_COLUMN_EXCEL_FILE.JAVA_TYPE] : "String";
        javaType = getTypeJava(javaType);
        importLib += addAdditionalImport(importLib, javaType);

        let isTruncated = isFoundValueTypeOptional(optional, DEFINATION_TYPE_SUB.TRUNCATED);
        classContent += javaType + " ";
        if (isFoundValueTypeOptional(optional, DEFINATION_TYPE_SUB.AUTO_PREFIX)) {
            classContent += splitandCamelCaseString(
                    data[index][DEFINATION_COLUMN_EXCEL_FILE.JAVA_ATTRIBUTE],
                    javaPrefix[javaType],
                    /[_ ]+/,
                    isTruncated);
        } else {
            classContent += splitandCamelCaseString(
                    data[index][DEFINATION_COLUMN_EXCEL_FILE.JAVA_ATTRIBUTE],
                    data[index][DEFINATION_COLUMN_EXCEL_FILE.PREFIX],
                    /[_ ]+/,
                    isTruncated);
        }

        classContent += getSemicolon();
        classContent += getNewLine();
    });
    classContent += getRightBraces();

    if (data[indexes[0]][DEFINATION_COLUMN_EXCEL_FILE.PACKAGE_KEY]) {
        mapKeyClassPackage[upperCaseCamel(data[indexes[0]][DEFINATION_COLUMN_EXCEL_FILE.JAVA_CLASS] + "Key")] = data[indexes[0]][DEFINATION_COLUMN_EXCEL_FILE.PACKAGE_KEY];
    } else {
        mapKeyClassPackage[upperCaseCamel(data[indexes[0]][DEFINATION_COLUMN_EXCEL_FILE.JAVA_CLASS] + "Key")] = data[indexes[0]][DEFINATION_COLUMN_EXCEL_FILE.PACKAGE] + ".key";
    }


    return package + "\n" + importLib + "\n" + comment + annotation + classContent;
}

function processGenEntity(data, isDownload, optional) {
    //Read all rows from First Sheet into an JSON array.  
    console.log("Process Entity");
    let excelRows = XLSX.utils.sheet_to_row_object_array(importExcel(data, DEFINATION_SHEET_NAME.GEN_ENTITY, 0));
    let startPos = -1;
    let endPos = -1;
    let isTheLastTable = false;
    let rawClass;
    let rawKeyClass;
    //Add the data rows from Excel file.
    for (let i = 0; i < excelRows.length; i++) {
        if (startPos === -1 && endPos === -1) {
            startPos = i;
        } else {
            endPos = i;
            if (isEndTable(excelRows, startPos, endPos)) {
                if (excelRows.length - 1 === endPos) {
                    isTheLastTable = true;
                }
                var numKey = {
                    "num": 0
                };
                rawClass = makeRawEntity(excelRows, startPos, endPos, isTheLastTable, optional, numKey);

                if (numKey.num >= numKeyToGenKeyClass) {
                    let indexes = isPrimaryKey(excelRows, startPos, endPos, isTheLastTable);
                    if (indexes.length > 0) {
                        rawKeyClass = makeRawKeyEntity(excelRows, indexes, optional);
                    }
                }

                //let isDownload = document.getElementById("downloadFile");
                if (isDownload) {
                    compressFile(splitandCamelCaseString(excelRows[startPos][DEFINATION_COLUMN_EXCEL_FILE.JAVA_CLASS], "", /[_ ]+/), rawClass, DEFINATION_TYPE_MAIN.ENTITY);
                    if (numKeyToGenKeyClass > 0 && numKey.num >= numKeyToGenKeyClass) {
                        compressFile(splitandCamelCaseString(excelRows[startPos][DEFINATION_COLUMN_EXCEL_FILE.JAVA_CLASS] + "Key", "", /[_ ]+/), rawKeyClass, DEFINATION_TYPE_MAIN.ENTITY_KEY);
                    }
                }

//                makeCreateClassTemplate(splitandCamelCaseString(excelRows[startPos][DEFINATION_COLUMN_EXCEL_FILE.JAVA_CLASS], "", /[_ ]+/), rawClass);
//                if (numKey.num >= numKeyToGenKeyClass) {
//                    makeCreateClassTemplate(splitandCamelCaseString(excelRows[startPos][DEFINATION_COLUMN_EXCEL_FILE.JAVA_CLASS] + "Key", "", /[_ ]+/), rawKeyClass);
//                }
//                console.log(result + "\n");

                startPos = endPos;
            }
        }
    }
    return true;
}

function processGenRepository(data, isDownload) {
    //Read all rows from First Sheet into an JSON array.
    console.log("Process Repo");
    let excelRows = XLSX.utils.sheet_to_row_object_array(importExcel(data, DEFINATION_SHEET_NAME.GEN_REPOSITORY, 1));
    let rawClass = null;
    //Add the data rows from Excel file.
    for (let i = 0; i < excelRows.length; i++) {
        if (sampleData.indexOf(excelRows[i][DEFINATION_COLUMN_EXCEL_FILE.JAVA_CLASS] + "Key") !== -1) {
            rawClass = makeRawRepository(excelRows, i);

            if (isDownload) {
                compressFile(getOnlyClassName(upperCaseCamel(excelRows[i][DEFINATION_COLUMN_EXCEL_FILE.JAVA_CLASS]),
                        "I",
                        "Repository"), rawClass, DEFINATION_TYPE_MAIN.REPOSITORY);
            }
        }
//                makeCreateClassTemplate(splitandCamelCaseString(excelRows[startPos][DEFINATION_COLUMN_EXCEL_FILE.JAVA_CLASS], "", /[_ ]+/), rawClass);
//                if (numKey.num >= numKeyToGenKeyClass) {
//                    makeCreateClassTemplate(splitandCamelCaseString(excelRows[startPos][DEFINATION_COLUMN_EXCEL_FILE.JAVA_CLASS] + "Key", "", /[_ ]+/), rawKeyClass);
//                }
//                console.log(result + "\n");
    }
    return true;
}

function getLeftParentheses() {
    return "(";
}

function getRightParentheses() {
    return ")";
}

function getLeftBraces() {
    return "{";
}

function getRightBraces() {
    return "}";
}

function getQuotes() {
    return "\"";
}

function getSemicolon() {
    return ";";
}

function getComma() {
    return ",";
}

function getNewLine() {
    return "\n";
}

function getTab() {
    return "\t";
}

function getPackage(packageName) {
    return "package " + packageName + getSemicolon() + "\n";
}

function getPackageKey(packageName, defaultPackageName) {
    if (packageName) {
        return getPackage(packageName);
    } else {
        return getPackage(defaultPackageName);
    }
}

function getPackageRepo(packageName, defaultPackageName) {
    if (packageName) {
        return getPackage(packageName);
    } else {
        return getPackage(defaultPackageName);
    }
}

function getPackageService(packageName, defaultPackageName) {
    if (packageName) {
        return getPackage(packageName);
    } else {
        return getPackage(defaultPackageName);
    }
}

function getJsonObjectImport() {
    return "import jp.linkst.util2.lang.JsonObject;\n";
}

function getSerializableImport() {
    return "import java.io.Serializable;\n";
}

function getLombokImport() {
    return  "import lombok.AllArgsConstructor;\n" +
            "import lombok.Data;\n" +
            "import lombok.NoArgsConstructor;\n" +
            "import lombok.EqualsAndHashCode;\n";
}

function getPersistenceImport() {
    return  "import javax.persistence.Entity;\n" +
            "import javax.persistence.Table;\n" +
            "import javax.persistence.Column;\n" +
            "import javax.persistence.Id;\n";
}

function getRepositoryImport() {
    return "import org.springframework.stereotype.Repository;\n" +
            "import org.springframework.data.jpa.repository.JpaRepository;\n";
}

function getIdClassImport() {
    return "import javax.persistence.IdClass;\n";
}

function getCustomImport(clazz, isKeyClass) {
    if (isKeyClass) {
//        if (mapKeyClassPackage[clazz]) {
//            return "import " + mapKeyClassPackage[clazz] + "." + clazz + ";\n";
//        } else {
//            return "";
//        }
        return "import taplatform.entity.key" + clazz + getSemicolon() + getNewLine();
    } else {
//        if (mapClassPackage[clazz]) {
//            return "import " + mapClassPackage[clazz] + "." + clazz + ";\n";
//        } else {
//            return "";
//        }
        return "import taplatform.entity." + clazz + getSemicolon() + getNewLine();
    }
}

function getIdClassAnnotation(value) {
    return "@IdClass(value = " + value + ".class)";
}

function getEntityAnnotation() {
    return "@Entity\n";
}

function getLombokAnnotation() {
    return "@Data\n" +
            "@EqualsAndHashCode(callSuper = true)\n" +
            "@AllArgsConstructor\n" +
            "@NoArgsConstructor\n";
}

function getRepositoryAnnotation() {
    return "@Repository\n";
}

function getClassName(className, seriable) {
    let result = "public class " + className;
    if (seriable !== "underfined" || seriable !== null) {
        result += seriable;
    }
    return result;
}

function getInterfaceName(className, objectClass, objectKey) {
    let result = "public interface " + "I" + className + "Repository";
    result += " extends JpaRepository<";

    if (objectClass !== "undefined" || objectClass !== null) {
        result += objectClass + ", ";
    } else {

    }

    if (objectKey !== "undefined" || objectKey !== null) {
        result += objectKey + ">";
    } else {

    }
    return result;
}

function getOnlyClassName(className, prefix, postfix) {
    let result = "";
    if (prefix !== "undefined" && prefix !== null) {
        result += prefix;
    }
    result += className;
    if (postfix !== "undefined" && postfix !== null) {
        result += postfix;
    }
    return result;
}

function getModifier(modifier) {
    return modifier + " ";
}

function getSchemaTable(schemaName) {
    return getComma() + " schema = " + getQuotes() + schemaName + getQuotes();
}

function getTableAnnotation(tableName, schemaName) {
    let result = "@Table(name = " + getQuotes() + tableName + getQuotes();
    if (schemaName !== "underfined" || schemaName !== null) {
        result += getSchemaTable(schemaName);
    }
    result += getRightParentheses();
    return result;
}

function getColumnAnnotation() {
    return "@Column(name = ";
}

function getExtendJsonObject() {
    return " extends JsonObject";
}

function getImplSerializable() {
    return " implements Serializable";
}

function getSerialVersionUID() {
    return "private static final long serialVersionUID = 1L;";
}

function getJavaClassType() {
    return ".java";
}

function getImplementOfByJapanese() {
    return ab2str(str2ab("の実装"));
}

function getAddCommentByJapanses() {
    return ab2str(str2ab("コメントを追記する"));
}

function getCommentJapanese(javaClass, dbTable, author, comment) {
    let result = "/**\n" +
            "*\n" +
            "* " + javaClass + " " + getImplementOfByJapanese() + "<br/>\n";
    if (dbTable !== null) {
        result += "* " + dbTable + "\n";
    }
    result += "* <p>\n" +
            "* " + getAddCommentByJapanses() + "\n";
    if (comment) {
        result += "* " + comment + "\n";
    }
    result += "* </p>\n" +
            "* @author " + author + "\n" +
            "*/\n";
    return  result;
}

function getTypeMain() {
    let result = [];
    let checkbox = document.getElementsByClassName("main_function");
    for (let i = 0; i < checkbox.length; i++) {
        if (checkbox[i].type === "checkbox") {
            if (checkbox[i].checked) {
                result.push(checkbox[i].value);
            }
        }
    }
    return result;
}

function getTypeSub() {
    let result = [];
    let checkbox = document.getElementsByClassName("sub_function");
    for (let i = 0; i < checkbox.length; i++) {
        if (checkbox[i].type === "checkbox") {
            if (checkbox[i].checked) {
                result.push(checkbox[i].value);
            }
        }
    }
    return result;
}

function getTypeOptional() {
    let result = [];
    let checkbox = document.getElementsByClassName("optional_function");
    for (let i = 0; i < checkbox.length; i++) {
        if (checkbox[i].checked) {
            result.push(checkbox[i].value);
        }
    }
    return result;
}

function getTypeJava(inputType) {
    let output;
    if (!inputType) {
        return "String";
    }

    if (javaType[inputType.toLowerCase()]) {
        output = javaType[inputType.toLowerCase()];
    } else {
        output = inputType;
    }
    return output;
}

function setNumKeyInClass(dest, num) {
    dest.num = num;
}

function addAdditionalImport(sourceImport, typeJava) {
    if (javaLib[typeJava]) {
        if (!sourceImport.includes(javaLib[typeJava])) {
            return "import " + javaLib[typeJava] + getSemicolon() + "\n";
        }
    }
    return "";
}

function upperCaseString(value) {
    return value.substring(0, 1).toUpperCase() + value.substring(1);
}

function truncatedString(value) {
    return value.substring(0, truncated);
}

function splitandCamelCaseString(value, prefix, delimiter, truncated) {
    let arr = checkPrefix(value.split(delimiter), prefix);
    let result = "";
    let isFirstLetter = true;

    if (truncated) {
        arr.forEach(function (v) {
            v = truncatedString(v);
        });
    }

    for (let i = 0; i < arr.length; i++) {
        if (isFirstLetter) {
            result += arr[i];
            isFirstLetter = false;
        } else {
            result += upperCaseString(arr[i]);
        }
    }
    return result;
}

function upperCaseCamel(value) {
    return splitandCamelCaseString(value, "", /[_ ]+/);
}

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function str2ab(str) {
    var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function saveAs(blob, filename) {
    if (typeof navigator.msSaveOrOpenBlob !== 'undefined') {
        return navigator.msSaveOrOpenBlob(blob, fileName);
    } else if (typeof navigator.msSaveBlob !== 'undefined') {
        return navigator.msSaveBlob(blob, fileName);
    } else {
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        elem.style = 'display:none;opacity:0;color:transparent;';
        (document.body || document.documentElement).appendChild(elem);
        if (typeof elem.click === 'function') {
            elem.click();
        } else {
            elem.target = '_blank';
            elem.dispatchEvent(new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            }));
        }
        URL.revokeObjectURL(elem.href);
    }
}