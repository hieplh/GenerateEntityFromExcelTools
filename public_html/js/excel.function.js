function Upload() {
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
            if (isHaveMandatoryFields(e.target.result)) {
                return;
            }
            ProcessExcel(e.target.result);
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
            ProcessExcel(data);
        };
        reader.readAsArrayBuffer(fileUpload.files[0]);
    }
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
    
    // check key header
    let x = excel.A1.v;
    console.log(x);
    return true;
}

function ProcessExcel(data) {
    //Read all rows from First Sheet into an JSON array.
    let excelRows = XLSX.utils.sheet_to_row_object_array(importExcel(data));

    //Add the data rows from Excel file.
    for (let i = 0; i < excelRows.length; i++) {
        //Add the data row.
        var row = table.insertRow(-1);
        //Add the data cells.
        var cell = row.insertCell(-1);
        cell.innerHTML = excelRows[i].id;
        cell = row.insertCell(-1);
        cell.innerHTML = excelRows[i].name;
        cell = row.insertCell(-1);
        cell.innerHTML = excelRows[i].country;
    }

    var dvExcel = document.getElementById("dvExcel");
    dvExcel.innerHTML = "";
    dvExcel.appendChild(table);
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
    return "import javax.persistence.Column\n;" +
            "import javax.persistence.Entity;\n" +
            "import javax.persistence.Id;\n" +
            "import javax.persistence.Table;\n" +
            "import jp.linkst.util2.lang.JsonObject;\n" +
            "import lombok.AllArgsConstructor;\n" +
            "import lombok.Data;\n" +
            "import lombok.NoArgsConstructor;\n";
}