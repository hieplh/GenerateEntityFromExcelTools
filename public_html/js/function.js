function countTimeExecution() {
    let date = new Date();
    document.getElementById("count_time").innerHTML = date.now().toString();
}

function upload() {
    let t0 = performance.now();
    console.log(t0);
    
    var fileUpload = validateExcelFile();
    if (fileUpload === null) {
        return;
    }

    let type = getTypeCheckbox();
    let optional = getTypeOptional();
    readExcelFile(fileUpload, type, optional);
    
    let t1 = performance.now();
    console.log(t1);
}

function compressFile(filename, data) {
    archive.file(filename + getJavaClassType(), data);
}

function download(filename, typeArchive) {
    let size = 0;
    archive.forEach((file) => size += file ? 1 : 0);

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

    let type = getTypeCheckbox();
    readExcelFile(fileUpload, type);
}

function initJavaTypeMapping(data) {
    let excelRows = XLSX.utils.sheet_to_row_object_array(importExcel(data, DEFINATION_SHEET_NAME.JAVA_TYPE_MAPPING));

    javaType = [];
    javaLib = [];
    for (let i = 0; i < excelRows.length; i++) {
        javaType[excelRows[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.FROM].toLowerCase()] = excelRows[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.TO];
        if (excelRows[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.LIBRARY]) {
            javaLib[excelRows[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.TO]] = excelRows[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.LIBRARY];
        }
    }
}

function initJavaPrefixMapping(data) {
    let excelRows = XLSX.utils.sheet_to_row_object_array(importExcel(data, DEFINATION_SHEET_NAME.JAVA_TYPE_MAPPING));

    javaPrefix = [];
    for (let i = 0; i < excelRows.length; i++) {
        if (excelRows[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_TYPE]) {
            javaPrefix[excelRows[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_TYPE]] = excelRows[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PREFIX];
        }
    }
}

function initNumToGenKeyClass(data) {
    let excelRows = XLSX.utils.sheet_to_row_object_array(importExcel(data, DEFINATION_SHEET_NAME.JAVA_TYPE_MAPPING));

    if (excelRows[0][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.NUM_TO_GEN_KEY]) {
        numKeyToGenKeyClass = excelRows[0][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.NUM_TO_GEN_KEY];
    } else {
        numKeyToGenKeyClass = 0;
    }
}

function initTruncatedNum(data) {
    let excelRows = XLSX.utils.sheet_to_row_object_array(importExcel(data, DEFINATION_SHEET_NAME.JAVA_TYPE_MAPPING));

    if (excelRows[0][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.TRUNCATED]) {
        truncated = excelRows[0][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.TRUNCATED];
    } else {
        truncated = 0;
    }
}

function validateJavaType(data) {
    let excel = importExcel(data, DEFINATION_SHEET_NAME.JAVA_TYPE_MAPPING);
    let error = "";
    // check key header
    error += checkSingleMandatoryField(excel.A1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.FROM, "A1");
    error += checkSingleMandatoryField(excel.B1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.TO, "B1");
    error += checkSingleMandatoryField(excel.C1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.LIBRARY, "C1");
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

function importExcel(data, sheetname) {
//Read the Excel File data.
    let workbook = XLSX.read(data, {
        type: 'binary'
    });
    //Fetch the name of First Sheet.

    // get sheet name of gen entity
    let result = sheetname;
    if (result === "undefined") {
        result = workbook.SheetNames[0];
    }
    return workbook.Sheets[result];
}

function readExcelFile(file, type, optional) {
    var reader = new FileReader();
    //For Browsers other than IE.
    if (reader.readAsBinaryString) {
        reader.onload = function (e) {
            switch (parseInt(type)) {
                case DEFINATION_TYPE.Insert:
                    alert("This function will be available soon!!!");
                    return;
                default :
                    if (!isHaveMandatoryFields(e.target.result)) {
                        return;
                    }
                    if (!validateJavaType(e.target.result)) {
                        return;
                    }

                    initJavaTypeMapping(e.target.result);
                    initJavaPrefixMapping(e.target.result);
                    initNumToGenKeyClass(e.target.result);
                    initTruncatedNum(e.target.result);
                    let isDownload = type == DEFINATION_TYPE.Download ? true : false;
                    processExcel(e.target.result, isDownload, optional);
                    break;
            }
        };
        reader.readAsBinaryString(file.files[0]);
    } else {
        //For IE Browser.
        reader.onload = function (e) {
            switch (type) {
                case DEFINATION_TYPE.Insert:
                    alert("This function will be available soon!!!");
                    return;
                default :
                    if (!isHaveMandatoryFields(e.target.result)) {
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
                    let isDownload = type == DEFINATION_TYPE.Download ? true : false;
                    processExcel(data, isDownload, optional);
                    break;
            }
        };
        reader.readAsArrayBuffer(file.files[0]);
    }
}

function isHaveMandatoryFields(data) {
    let excel = importExcel(data, DEFINATION_SHEET_NAME.GEN_ENTITY);
    let error = "";
    // check key header
    error += checkSingleMandatoryField(excel.A1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.DB_TABLE, "A1");
    error += checkSingleMandatoryField(excel.B1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.DB_COLUMN, "B1");
    error += checkSingleMandatoryField(excel.C1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PACKAGE, "C1");
    error += checkSingleMandatoryField(excel.D1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PACKAGE_KEY, "D1");
    error += checkSingleMandatoryField(excel.E1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_CLASS, "E1");
    error += checkSingleMandatoryField(excel.F1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_ATTRIBUTE, "F1");
    error += checkSingleMandatoryField(excel.G1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_TYPE, "G1");
    error += checkSingleMandatoryField(excel.H1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PREFIX, "H1");
    error += checkSingleMandatoryField(excel.I1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.NULLABLE, "I1");
    error += checkSingleMandatoryField(excel.J1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PRIMARY_KEY, "J1");
    error += checkSingleMandatoryField(excel.K1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.AUTHOR, "K1");
    error += checkSingleMandatoryField(excel.L1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.COMMENT, "L1");
    if (error) {
        alert(error);
        return false;
    }

    return true;
}

function isEndTable(data, startPos, endPos) {
    let startNameTable = data[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_CLASS];
    let endNameTable = data.length - 1 !== endPos ? data[endPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_CLASS] : "";
    return startNameTable !== endNameTable;
}

function isPrimaryKey(data, startPos, endPos, isTheLastTable) {
    let indexes = [];
    let count = -1;
    let lengh = isTheLastTable ? endPos + 1 : endPos;
    for (var i = startPos; i < lengh; i++) {
        if (data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PRIMARY_KEY]) {
            if (data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PRIMARY_KEY].toString().toLowerCase() === "true" ||
                    data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PRIMARY_KEY] === 1 ||
                    data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PRIMARY_KEY].toString().toLowerCase() === "yes") {
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

function makeRawClass(data, startPos, endPos, isTheLastTable, optional, numKey) {
    let package = "";
    let importLib = "";
    let comment = "";
    let annotation = "";
    let classContent = "";
    let countPK = 0;

    package = getPackage(data[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PACKAGE]);

    importLib = getLombokImport() +
            getNewLine() +
            getJsonObjectImport() +
            getNewLine() +
            getPersistenceImport();

    comment = getNewLine();
    comment += getCommentJapanese(
            splitandCamelCaseString(data[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_CLASS], "", /[_ ]+/),
            data[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.DB_TABLE],
            data[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.AUTHOR],
            data[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.COMMENT]);

    annotation = getLombokAnnotation();
    annotation += getEntityAnnotation();
    annotation += getTableAnnotation(data[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.DB_TABLE], "public");
    annotation += getNewLine();

    classContent += getClassName(
            splitandCamelCaseString(data[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_CLASS], "", /[_ ]+/),
            getExtendJsonObject());
    classContent += " " + getLeftBraces();
    classContent += getNewLine() + getNewLine();

    let lengh = isTheLastTable ? endPos + 1 : endPos;
    for (var i = startPos; i < lengh; i++) {
        let isKey = false;
        if (data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PRIMARY_KEY]) {
            if (data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PRIMARY_KEY].toString().toLowerCase() === "true" ||
                    data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PRIMARY_KEY] === 1 ||
                    data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PRIMARY_KEY].toString().toLowerCase() === "yes") {
                classContent += getTab();
                classContent += "@Id";
                classContent += getNewLine();
                isKey = true;
                countPK++;
            }
        }

        classContent += getTab();
        classContent += getColumnAnnotation();
        classContent += getQuotes() + data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.DB_COLUMN] + getQuotes();
        if (!isKey) {
            if (data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.NULLABLE]) {
                if (data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.NULLABLE].toString().toLowerCase() === "true" ||
                        data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.NULLABLE] === 1 ||
                        data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.NULLABLE].toString().toLowerCase() === "yes") {
                    classContent += ", nullable = true";
                }
            }
        }

        classContent += getRightParentheses();
        classContent += getNewLine();
        classContent += getTab();
        classContent += getModifier("private");

        let javaType = data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_TYPE] !== "undefined" ?
                data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_TYPE] : "String";
        javaType = getTypeJava(javaType);
        importLib += addAdditionalImport(importLib, javaType);

        let isTruncated = isFoundValueTypeOptional(optional, DEFINATION_TYPE_SUB.TRUNCATED);
        classContent += javaType + " ";
        if (isFoundValueTypeOptional(optional, DEFINATION_TYPE_SUB.AUTO_PREFIX)) {
            classContent += splitandCamelCaseString(
                    data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_ATTRIBUTE],
                    javaPrefix[javaType],
                    /[_ ]+/,
                    isTruncated);
        } else {
            classContent += splitandCamelCaseString(
                    data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_ATTRIBUTE],
                    data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PREFIX],
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
        annotation += getIdClassAnnotation(splitandCamelCaseString(data[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_CLASS] + "Key", "", /[_ ]+/));
        annotation += getNewLine();
    }
    setNumKeyInClass(numKey, countPK);

    return package + "\n" + importLib + "\n" + comment + annotation + classContent;
}

function makeRawKeyClass(data, indexes, optional) {
    let package = "";
    let importLib = "";
    let comment = "";
    let annotation = "";
    let classContent = "";

    package = getPackageKey(data[indexes[0]][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PACKAGE_KEY],
            data[indexes[0]][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PACKAGE] + ".key");

    importLib = getSerializableImport() +
            getNewLine() +
            getLombokImport() +
            getNewLine();

    comment = getCommentJapanese(
            splitandCamelCaseString(data[indexes[0]][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_CLASS], "", /[_ ]+/),
            data[indexes[0]][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.DB_TABLE],
            data[indexes[0]][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.AUTHOR],
            data[indexes[0]][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.COMMENT]);

    annotation = getLombokAnnotation();

    classContent += getClassName(splitandCamelCaseString(data[indexes[0]][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_CLASS] + "Key", "", /[_ ]+/),
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

        let javaType = data[index][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_TYPE] !== "undefined" ?
                data[index][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_TYPE] : "String";
        javaType = getTypeJava(javaType);
        importLib += addAdditionalImport(importLib, javaType);

        let isTruncated = isFoundValueTypeOptional(optional, DEFINATION_TYPE_SUB.TRUNCATED);
        classContent += javaType + " ";
        if (isFoundValueTypeOptional(optional, DEFINATION_TYPE_SUB.AUTO_PREFIX)) {
            classContent += splitandCamelCaseString(
                    data[index][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_ATTRIBUTE],
                    javaPrefix[javaType],
                    /[_ ]+/,
                    isTruncated);
        } else {
            classContent += splitandCamelCaseString(
                    data[index][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_ATTRIBUTE],
                    data[index][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PREFIX],
                    /[_ ]+/,
                    isTruncated);
        }

        classContent += getSemicolon();
        classContent += getNewLine();
    });
    classContent += getRightBraces();

    return package + "\n" + importLib + "\n" + comment + annotation + classContent;
}

function processExcel(data, isDownload, optional) {
    //Read all rows from First Sheet into an JSON array.
    let excelRows = XLSX.utils.sheet_to_row_object_array(importExcel(data, DEFINATION_SHEET_NAME.GEN_ENTITY));
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
                rawClass = makeRawClass(excelRows, startPos, endPos, isTheLastTable, optional, numKey);

                if (numKey.num >= numKeyToGenKeyClass) {
                    let indexes = isPrimaryKey(excelRows, startPos, endPos, isTheLastTable);
                    rawKeyClass = makeRawKeyClass(excelRows, indexes, optional);
                }

                //let isDownload = document.getElementById("downloadFile");
                if (isDownload) {
                    compressFile(splitandCamelCaseString(excelRows[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_CLASS], "", /[_ ]+/), rawClass);
                    if (numKey.num >= numKeyToGenKeyClass) {
                        compressFile(splitandCamelCaseString(excelRows[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_CLASS] + "Key", "", /[_ ]+/), rawKeyClass);
                    }
                }

//                makeCreateClassTemplate(splitandCamelCaseString(excelRows[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_CLASS], "", /[_ ]+/), rawClass);
//                if (numKey.num >= numKeyToGenKeyClass) {
//                    makeCreateClassTemplate(splitandCamelCaseString(excelRows[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_CLASS] + "Key", "", /[_ ]+/), rawKeyClass);
//                }
//                console.log(result + "\n");

                startPos = endPos;
            }
        }
    }

    if (isDownload) {
        download("Generated Entity", ".zip");
    }
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

function getIdClassImport() {
    return "import javax.persistence.IdClass;\n";
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

function getClassName(className, seriable) {
    let result = "public class " + className;
    if (seriable !== "underfined" || seriable !== null) {
        result += seriable;
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
            "* " + javaClass + " " + getImplementOfByJapanese() + "<br/>\n" +
            "* " + dbTable + "\n" +
            "* <p>\n" +
            "* " + getAddCommentByJapanses() + "\n";
    if (comment) {
        result += "* " + comment + "\n";
    }
    result += "* </p>\n" +
            "* @author " + author + "\n" +
            "*/\n";
    return  result;
}

function getTypeCheckbox() {
    var checkbox = document.getElementsByClassName("main_function");
    for (let i = 0; i < checkbox.length; i++) {
        if (checkbox[i].type === "checkbox") {
            if (checkbox[i].checked) {
                return checkbox[i].value;
            }
        }
    }
    return DEFINATION_TYPE.Generate;
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

function getTypeOptional() {
    let result = [];
    let count = -1;
    let checkbox = document.getElementsByClassName("sub_function");
    for (let i = 0; i < checkbox.length; i++) {
        if (checkbox[i].checked) {
            result[++count] = checkbox[i].value;
        }
    }
    return result;
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
    console.log(truncated);
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