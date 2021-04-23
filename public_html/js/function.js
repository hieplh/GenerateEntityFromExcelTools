function upload() {
    var fileUpload = validateExcelFile();
    if (fileUpload === null) {
        return;
    }

    let type = getType();
    readExcelFile(fileUpload, type);
}

function download(filename, text) {
    console.log(filename);
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename + getJavaClassType());

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function makeInsertStatement() {
    var fileUpload = validateExcelFile();
    if (fileUpload === null) {
        return;
    }

    let type = getType();
    readExcelFile(fileUpload, type);
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

function getType() {
    var checkbox = document.getElementsByTagName("input");
    for (let i = 0; i < checkbox.length; i++) {
        if (checkbox[i].type === "checkbox") {
            return checkbox[i].value;
        }
    }
    return DEFINATION_TYPE.Generate;
}

function readExcelFile(file, type) {
    var reader = new FileReader();
    //For Browsers other than IE.
    if (reader.readAsBinaryString) {
        reader.onload = function (e) {
//            switch (type) {
//                case DEFINATION_TYPE.Insert:
//                    alert("This function will be available soon!!!");
//                    return;
//                default :
//                    if (!isHaveMandatoryFields(e.target.result)) {
//                        return;
//                    }
//
//                    let isDownload = type == DEFINATION_TYPE.Download ? true : false;
//                    processExcel(e.target.result, isDownload);
//                    break;
//            }
            processExcel(e.target.result, null);
        };
        reader.readAsBinaryString(file.files[0]);
    } else {
        //For IE Browser.
        reader.onload = function (e) {
//            switch (type) {
//                case DEFINATION_TYPE.Insert:
//                    alert("This function will be available soon!!!");
//                    return;
//                default :
//                    var data = "";
//                    var bytes = new Uint8Array(e.target.result);
//                    for (var i = 0; i < bytes.byteLength; i++) {
//                        data += String.fromCharCode(bytes[i]);
//                    }
//
//                    let isDownload = type == DEFINATION_TYPE.Download ? true : false;
//                    processExcel(data, isDownload);
//            }
            processExcel(e.target.result, null);
        };
        reader.readAsArrayBuffer(file.files[0]);
    }
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

function importExcel(data) {
    //Read the Excel File data.
    let workbook = XLSX.read(data, {
        type: 'binary'
    });
    //Fetch the name of First Sheet.
    let firstSheet = workbook.SheetNames[0];
    return workbook.Sheets[firstSheet];
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
    let excel = importExcel(data);
    let error = "";

    // check key header
    error += checkSingleMandatoryField(excel.A1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.DB_TABLE, "A1");
    error += checkSingleMandatoryField(excel.B1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_CLASS, "B1");
    error += checkSingleMandatoryField(excel.C1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.DB_COLUMN, "C1");
    error += checkSingleMandatoryField(excel.D1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_ATTRIBUTE, "D1");
    error += checkSingleMandatoryField(excel.E1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_TYPE, "E1");
    error += checkSingleMandatoryField(excel.F1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PREFIX, "F1");
    error += checkSingleMandatoryField(excel.G1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.NULLABLE, "G1");
    error += checkSingleMandatoryField(excel.H1.v, DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PRIMARY_KEY, "H1");

    if (error) {
        alert(error);
        return false;
    }

    return true;
}

function processExcel(data, isDownload) {
    //Read all rows from First Sheet into an JSON array.
    let excelRows = XLSX.utils.sheet_to_row_object_array(importExcel(data));
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

                let isDownload = document.getElementById("downloadFile");
                if (isDownload.checked) {
                    download(splitandCamelCaseString(excelRows[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_CLASS], "", /[_ ]+/), result);
                }

                makeCreateClassTemplate(splitandCamelCaseString(excelRows[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_CLASS], "", /[_ ]+/), result);
                console.log(result + "\n");

                startPos = endPos;
            }
        }
    }
}

function isEndTable(data, startPos, endPos) {
    let startNameTable = data[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_CLASS];
    let endNameTable = data.length - 1 !== endPos ? data[endPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_CLASS] : "";
    return startNameTable !== endNameTable;
}

function makeRawClass(data, startPos, endPos, isTheLastTable) {
    let result = "";
    result += getCommonImport() + getNewLine();
    result += getCommentJapanese(
            splitandCamelCaseString(data[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_CLASS], "", /[_ ]+/),
            data[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.DB_TABLE],
            data[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.AUTHOR],
            data[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.COMMENT]);
    result += getInitAnnotationClass();
    result += getTableAnnotation() + getQuotes() + data[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.DB_TABLE] + getQuotes();
    result += getSchemaTable() + getRightParentheses();
    result += getNewLine();
    result += getInitClass();
    result += splitandCamelCaseString(data[startPos][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_CLASS], "", /[_ ]+/);
    result += getImplSeriable();
    result += " " + getLeftBraces();
    result += getNewLine() + getNewLine();

    let lengh = isTheLastTable ? endPos + 1 : endPos;
    for (var i = startPos; i < lengh; i++) {
        if (data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PRIMARY_KEY]) {
            if (data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PRIMARY_KEY].toString().toLowerCase() === "true" ||
                    data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PRIMARY_KEY] === 1 ||
                    data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PRIMARY_KEY].toString().toLowerCase() === "yes") {
                result += "@Id";
                result += getNewLine();
            }
        }

        result += getColumnAnnotation();
        result += getQuotes() + data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.DB_COLUMN] + getQuotes();
        if (data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.NULLABLE]) {
            if (data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.NULLABLE].toString().toLowerCase() === "true" ||
                    data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.NULLABLE] === 1 ||
                    data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.NULLABLE].toString().toLowerCase() === "yes") {
                result += ", nullable = true";
            }
        }
        result += getRightParentheses();
        result += getNewLine();

        result += getModifier();
        result += data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_TYPE] + " ";
        result += splitandCamelCaseString(
                data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.JAVA_ATTRIBUTE],
                data[i][DEFINATION_COLUMN_GEN_ENTITY_JAVA_CLASS.PREFIX],
                /[_ ]+/);
        result += getSemicolon();
        result += getNewLine();
        result += getNewLine();
    }

    result += getRightBraces();
    return result;
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
    return "の実装";
}

function getAddCommentByJapanses() {
    return "コメントを追記する";
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