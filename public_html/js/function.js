var archive = new JSZip();

function upload() {
    var fileUpload = validateExcelFile();
    if (fileUpload === null) {
        return;
    }

    let type = getTypeCheckbox();
    readExcelFile(fileUpload, type);
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

function getTypeCheckbox() {
    var checkbox = document.getElementsByTagName("input");
    for (let i = 0; i < checkbox.length; i++) {
        if (checkbox[i].type === "checkbox") {
            if (checkbox[i].checked) {
                return checkbox[i].value;
            }
        }
    }
    return DEFINATION_TYPE.Generate;
}

function addAdditionalImport(typeJava) {
    if (javaLib[typeJava]) {
        return "import " + javaLib[typeJava] + getSemicolon() + "\n";
    }
    return "";
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
    addAdditionalImport(output);
    return output;
}

function readExcelFile(file, type) {
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
                    let isDownload = type == DEFINATION_TYPE.Download ? true : false;
                    processExcel(e.target.result, isDownload);
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
                    let isDownload = type == DEFINATION_TYPE.Download ? true : false;
                    processExcel(data, isDownload);
                    break;
            }
        };
        reader.readAsArrayBuffer(file.files[0]);
    }
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

function isHaveMandatoryFields(data) {
    let excel = importExcel(data, DEFINATION_SHEET_NAME.GEN_ENTITY);
    let error = "";
    // check key header
    error += checkSingleMandatoryField(excel.A1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.DB_TABLE, "A1");
    error += checkSingleMandatoryField(excel.B1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.DB_COLUMN, "B1");
    error += checkSingleMandatoryField(excel.C1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PACKAGE, "C1");
    error += checkSingleMandatoryField(excel.D1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_CLASS, "D1");
    error += checkSingleMandatoryField(excel.E1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_ATTRIBUTE, "E1");
    error += checkSingleMandatoryField(excel.F1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_TYPE, "F1");
    error += checkSingleMandatoryField(excel.G1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PREFIX, "G1");
    error += checkSingleMandatoryField(excel.H1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.NULLABLE, "H1");
    error += checkSingleMandatoryField(excel.I1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PRIMARY_KEY, "I1");
    error += checkSingleMandatoryField(excel.J1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.AUTHOR, "J1");
    error += checkSingleMandatoryField(excel.K1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.COMMENT, "K1");
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
    let lengh = isTheLastTable ? endPos + 1 : endPos;
    for (var i = startPos; i < lengh; i++) {
        if (data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PRIMARY_KEY]) {
            if (data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PRIMARY_KEY].toString().toLowerCase() === "true" ||
                    data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PRIMARY_KEY] === 1 ||
                    data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PRIMARY_KEY].toString().toLowerCase() === "yes") {
                return true;
            }
        }
    }
    return false;
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

function makeRawClass(data, startPos, endPos, isTheLastTable) {
    let package = "";
    let importLib = "";
    let comment = "";
    let annotation = "";
    let classContent = "";

    package = getPackage(data[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PACKAGE]);

    importLib = getCommonImport() + getNewLine();

    comment = getCommentJapanese(
            splitandCamelCaseString(data[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_CLASS], "", /[_ ]+/),
            data[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.DB_TABLE],
            data[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.AUTHOR],
            data[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.COMMENT]);

    annotation = getInitAnnotationClass();
    annotation += getTableAnnotation() + getQuotes() + data[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.DB_TABLE] + getQuotes();
    annotation += getSchemaTable() + getRightParentheses();
    annotation += getNewLine();

    classContent += getInitClass();
    classContent += splitandCamelCaseString(data[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_CLASS], "", /[_ ]+/);
    classContent += getImplSeriable();
    classContent += " " + getLeftBraces();
    classContent += getNewLine() + getNewLine();

    let lengh = isTheLastTable ? endPos + 1 : endPos;
    for (var i = startPos; i < lengh; i++) {
        if (data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PRIMARY_KEY]) {
            if (data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PRIMARY_KEY].toString().toLowerCase() === "true" ||
                    data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PRIMARY_KEY] === 1 ||
                    data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PRIMARY_KEY].toString().toLowerCase() === "yes") {
                classContent += getTab();
                classContent += "@Id";
                classContent += getNewLine();
            }
        }

        classContent += getTab();
        classContent += getColumnAnnotation();
        classContent += getQuotes() + data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.DB_COLUMN] + getQuotes();
        if (data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.NULLABLE]) {
            if (data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.NULLABLE].toString().toLowerCase() === "true" ||
                    data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.NULLABLE] === 1 ||
                    data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.NULLABLE].toString().toLowerCase() === "yes") {
                classContent += ", nullable = true";
            }
        }
        classContent += getRightParentheses();
        classContent += getNewLine();
        classContent += getTab();
        classContent += getModifier();

        let javaType = data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_TYPE] !== "undefined" ?
                data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_TYPE] : "String";
        javaType = getTypeJava(javaType);
        importLib += addAdditionalImport(javaType);

        classContent += javaType + " ";
        classContent += splitandCamelCaseString(
                data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_ATTRIBUTE],
                data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PREFIX],
                /[_ ]+/);
        classContent += getSemicolon();
        classContent += getNewLine();
        classContent += getNewLine();
    }
    classContent += getRightBraces();

    return package + "\n" + importLib + "\n" + comment + annotation + classContent;
}

function makeRawKeyClass(data, indexes, isTheLastTable) {
    let package = "";
    let importLib = "";
    let comment = "";
    let annotation = "";
    let classContent = "";

    package = getPackage(data[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PACKAGE]);

    importLib = getCommonImport() + getNewLine();

    comment = getCommentJapanese(
            splitandCamelCaseString(data[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_CLASS], "", /[_ ]+/),
            data[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.DB_TABLE],
            data[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.AUTHOR],
            data[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.COMMENT]);

    annotation = getInitAnnotationClass();
    annotation += getTableAnnotation() + getQuotes() + data[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.DB_TABLE] + getQuotes();
    annotation += getSchemaTable() + getRightParentheses();
    annotation += getNewLine();

    classContent += getInitClass();
    classContent += splitandCamelCaseString(data[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_CLASS], "", /[_ ]+/);
    classContent += getImplSeriable();
    classContent += " " + getLeftBraces();
    classContent += getNewLine() + getNewLine();

    let lengh = isTheLastTable ? endPos + 1 : endPos;
    for (var i = startPos; i < lengh; i++) {
        if (data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PRIMARY_KEY]) {
            if (data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PRIMARY_KEY].toString().toLowerCase() === "true" ||
                    data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PRIMARY_KEY] === 1 ||
                    data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PRIMARY_KEY].toString().toLowerCase() === "yes") {
                classContent += getTab();
                classContent += "@Id";
                classContent += getNewLine();
            }
        }

        classContent += getTab();
        classContent += getColumnAnnotation();
        classContent += getQuotes() + data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.DB_COLUMN] + getQuotes();
        if (data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.NULLABLE]) {
            if (data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.NULLABLE].toString().toLowerCase() === "true" ||
                    data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.NULLABLE] === 1 ||
                    data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.NULLABLE].toString().toLowerCase() === "yes") {
                classContent += ", nullable = true";
            }
        }
        classContent += getRightParentheses();
        classContent += getNewLine();
        classContent += getTab();
        classContent += getModifier();

        let javaType = data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_TYPE] !== "undefined" ?
                data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_TYPE] : "String";
        javaType = getTypeJava(javaType);
        importLib += addAdditionalImport(javaType);

        classContent += javaType + " ";
        classContent += splitandCamelCaseString(
                data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_ATTRIBUTE],
                data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PREFIX],
                /[_ ]+/);
        classContent += getSemicolon();
        classContent += getNewLine();
        classContent += getNewLine();
    }
    classContent += getRightBraces();

    indexes.forEach(function (index) {

    });

    return package + "\n" + importLib + "\n" + comment + annotation + classContent;
}

function processExcel(data, isDownload) {
    //Read all rows from First Sheet into an JSON array.
    let excelRows = XLSX.utils.sheet_to_row_object_array(importExcel(data, DEFINATION_SHEET_NAME.GEN_ENTITY));
    let startPos = -1;
    let endPos = -1;
    let isTheLastTable = false;
    let result;
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
                result = makeRawClass(excelRows, startPos, endPos, isTheLastTable);
                //let isDownload = document.getElementById("downloadFile");
                if (isDownload) {
                    compressFile(splitandCamelCaseString(excelRows[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_CLASS], "", /[_ ]+/), result);
                }

                //makeCreateClassTemplate(splitandCamelCaseString(excelRows[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_CLASS], "", /[_ ]+/), result);
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

function getCommonImport() {
    return "import javax.persistence.Column;\n" +
            "import javax.persistence.Entity;\n" +
            "import javax.persistence.Id;\n" +
            "import javax.persistence.Table;\n\n" +
            "import jp.linkst.util2.lang.JsonObject;\n\n" +
            "import lombok.AllArgsConstructor;\n" +
            "import lombok.Data;\n" +
            "import lombok.NoArgsConstructor;\n";
}

function getInitClass() {
    return "public class ";
}

function getModifier() {
    return "private ";
}

function getInitAnnotationClass() {
    return "@Entity\n" +
            "@Data\n" +
            "@EqualsAndHashCode(callSuper = true)\n" +
            "@AllArgsConstructor\n" +
            "@NoArgsConstructor\n";
}

function getSchemaTable() {
    return getComma() + " schema = " + getQuotes() + "public" + getQuotes();
}

function getTableAnnotation() {
    return "@Table(name = ";
}

function getColumnAnnotation() {
    return "@Column(name = ";
}

function getImplSeriable() {
    return " extends JsonObject";
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

function upperCaseString(value) {
    return value.substring(0, 1).toUpperCase() + value.substring(1);
}

function checkPrefix(value, prefix) {
    if (prefix) {
        value.unshift(prefix);
    }
    return value;
}

function splitandCamelCaseString(value, prefix, delimiter) {
    let arr = checkPrefix(value.split(delimiter), prefix);
    let result = "";
    let isFirstLetter = true;
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