function upload() {
    //Reference the FileUpload element.
    var fileUpload = document.getElementById("fileUpload");
    //Validate whether File is valid Excel file.
    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;
    if (!regex.test(fileUpload.value.toLowerCase())) {
        alert("Please upload a valid Excel file.");
        return;
    }

    // Check browser support HTML5 or not
    if (typeof (FileReader) == "undefined") {
        alert("This browser does not support HTML5.\n Please update to latest browser version");
        return;
    }

    var reader = new FileReader();
    //For Browsers other than IE.
    if (reader.readAsBinaryString) {
        reader.onload = function (e) {
            if (!isHaveMandatoryFields(e.target.result)) {
                return;
            }

            processExcel(e.target.result);
        };
        reader.readAsBinaryString(fileUpload.files[0]);
    } else {
        //For IE Browser.
        reader.onload = function (e) {
            var data = "";
            var bytes = new Uint8Array(e.target.result);
            for (var i = 0; i < bytes.byteLength; i++) {
                data += String.fromCharCode(bytes[i]);
            }
            processExcel(data);
        };
        reader.readAsArrayBuffer(fileUpload.files[0]);
    }
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename + getJavaClassType());

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function makeCreateClassTemplate(tableName, data) {
    var childDiv = document.createElement('div');
    childDiv.setAttribute('class', 'result');

    var h3 = document.createElement('h3');
    h3.innerHTML = tableName;

    data = data.replaceAll("\n", "<br/>");
    var p = document.createElement('p');
    p.innerHTML = data;

    childDiv.appendChild(h3);
    childDiv.appendChild(p);

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
    error += checkSingleMandatoryField(excel.A1.v, "Logical Table Name", "A1");
    error += checkSingleMandatoryField(excel.B1.v, "Physical Table Name", "B1");
    error += checkSingleMandatoryField(excel.C1.v, "Logical Column Name", "C1");
    error += checkSingleMandatoryField(excel.D1.v, "Physical Column Name", "D1");
    error += checkSingleMandatoryField(excel.E1.v, "Data Type", "E1");
    error += checkSingleMandatoryField(excel.F1.v, "Prefix", "F1");
    error += checkSingleMandatoryField(excel.G1.v, "Nullable", "G1");
    error += checkSingleMandatoryField(excel.H1.v, "Primary Key", "H1");

    if (error) {
        alert(error);
        return false;
    }

    return true;
}

function processExcel(data) {
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
                    download(excelRows[startPos]["Physical Table Name"], result);
                }

                makeCreateClassTemplate(excelRows[startPos]["Physical Table Name"], result);
                console.log(result + "\n");

                startPos = endPos;
            }
        }
    }

//    var dvExcel = document.getElementById("dvExcel");
//    dvExcel.innerHTML = "";
//    dvExcel.appendChild(table);
}

function isEndTable(data, startPos, endPos) {
    let startNameTable = data[startPos]["Physical Table Name"];
    let endNameTable = data.length - 1 !== endPos ? data[endPos]["Physical Table Name"] : "";
    return startNameTable !== endNameTable;
}

function makeRawClass(data, startPos, endPos, isTheLastTable) {
    let result = "";
    result += getCommonImport() + getNewLine();
    result += getInitAnnotationClass();
    result += getTableAnnotation() + getQuotes() + data[startPos]["Logical Table Name"] + getQuotes();
    result += getSchemaTable() + getRightParentheses();
    result += getNewLine();
    result += getInitClass();
    result += splitandCamelCaseString(data[startPos]["Physical Table Name"], "", /[_ ]+/);
    result += getImplSeriable();
    result += " " + getLeftBraces();
    result += getNewLine() + getNewLine();

    let lengh = isTheLastTable ? endPos + 1 : endPos;
    for (var i = startPos; i < lengh; i++) {
        if (data[i]["Primary Key"]) {
            if (data[i]["Primary Key"].toString().toLowerCase() === "true" ||
                    data[i]["Primary Key"] === 1 || data[i]["Primary Key"].toString().toLowerCase() === "yes") {
                result += "@Id";
                result += getNewLine();
            }
        }

        result += getColumnAnnotation();
        result += getQuotes() + data[i]["Logical Column Name"] + getQuotes();
        if (data[i]["Nullable"]) {
            if (data[i]["Nullable"].toString().toLowerCase() === "true" ||
                    data[i]["Nullable"] === 1 || data[i]["Nullable"].toString().toLowerCase() === "yes") {
                result += ", nullable = true";
            }
        }
        result += getRightParentheses();
        result += getNewLine();

        result += getModifier();
        result += data[i]["Data Type"] + " ";
        result += splitandCamelCaseString(data[i]["Physical Column Name"], data[i]["Prefix"], /[_ ]+/);
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
    console.log(arr);
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