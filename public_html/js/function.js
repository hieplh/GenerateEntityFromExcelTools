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

function isHaveMandatoryFields(data) {
    let excel = importExcel(data);
    let error = "";

    // check key header
    try {
        if (excel.A1.v !== "Table Name") {
            error += "Missing Table Name field at A1\n";
        }
    } catch (err) {
        error += "Missing Table Name field at A1\n";
    }

    try {
        if (excel.B1.v !== "Logical Name") {
            error += "Missing Logical Name field at B1\n";
        }
    } catch (err) {
        error += "Missing Logical Name field at B1\n";
    }

    try {
        if (excel.C1.v !== "Physical Name") {
            error += "Missing Physical Name field at C1\n";
        }
    } catch (err) {
        error += "Missing Physical Name field at C1\n";
    }

    try {
        if (excel.D1.v !== "Data Type") {
            error += "Missing Data Type field at D1\n";
        }
    } catch (err) {
        error += "Missing Data Type field at D1\n";
    }

    try {
        if (excel.E1.v !== "Nullable") {
            error += "Missing Nullable field at E1\n";
        }
    } catch (err) {
        error += "Missing Nullable field at E1\n";
    }

    try {
        if (excel.F1.v !== "Primary Key") {
            error += "Missing Primary Key field at F1\n";
        }
    } catch (err) {
        error += "Missing Primary Key field at F1\n";
    }

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
                download(excelRows[startPos]["Table Name"], result);
                makeCreateClassTemplate(excelRows[startPos]["Table Name"], result);

                startPos = endPos;
                console.log(result + "\n");
            }
        }
    }

//    var dvExcel = document.getElementById("dvExcel");
//    dvExcel.innerHTML = "";
//    dvExcel.appendChild(table);
}

function isEndTable(data, startPos, endPos) {
    let startNameTable = data[startPos]["Table Name"];
    let endNameTable = data.length - 1 !== endPos ? data[endPos]["Table Name"] : "";
    return startNameTable !== endNameTable;
}

function makeRawClass(data, startPos, endPos, isTheLastTable) {
    let result = "";
    result += getCommonImport() + getNewLine();
    result += getInitClass();
    result += data[startPos]["Table Name"];
    result += getImplSeriable();
    result += " " + getLeftBraces();
    result += getNewLine() + getNewLine();

    let lengh = isTheLastTable ? endPos + 1 : endPos;
    for (var i = startPos; i < lengh; i++) {
        if (data[i]["Primary Key"] || data[i]["Primary Key"].toString().length !== 0) {
            if (data[i]["Primary Key"].toString().toLowerCase() == "true" ||
                    data[i]["Primary Key"] == 1 || data[i]["Primary Key"].toString().toLowerCase() == "yes") {
                result += "@Id";
                result += getNewLine();
            }
        }

        result += getColumnAnnotation();
        result += getQuotes() + data[i]["Physical Name"] + getQuotes();
        if (data[i]["Nullable"] || data[i]["Nullable"].toString().length !== 0) {
            if (data[i]["Nullable"].toString().toLowerCase() == "true" ||
                    data[i]["Nullable"] == 1 || data[i]["Nullable"].toString().toLowerCase() == "yes") {
                result += ", nullable = true";
            }
        }
        result += getRightParentheses();
        result += getNewLine();

        result += getModifier();
        result += data[i]["Data Type"] + " ";
        result += data[i]["Physical Name"];
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

function getColumnAnnotation() {
    return "@Column(name = ";
}

function getImplSeriable() {
    return " extends JsonObject";
}

function getJavaClassType() {
    return ".java";
}