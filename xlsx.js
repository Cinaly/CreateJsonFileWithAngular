var xl = require('xlsx');
var fs = require('fs');
// workbook 对象，指的是整份 Excel 文档。我们在使用 js-xlsx 读取 Excel 文档之后就会获得 workbook 对象。
var workbook = xl.readFile('./H5页面翻译.xlsx');
// 获取 Excel 中所有表名
const sheetNames = workbook.SheetNames; // 返回 ['sheet1', 'sheet2']

// 根据表名获取对应某张表
const worksheet = workbook.Sheets[sheetNames[0]];
//返回json数据
var jsonData = xl.utils.sheet_to_json(worksheet);

var length = jsonData.length;
var jsonNameArr = [];
var jsonObj = {};
for (var i = 0; i < length; i++) {
    for (var item in jsonData[i]) {
        if (jsonNameArr.indexOf(item) == -1) {
            jsonNameArr.push(item);
            jsonObj[item] = {};
        }
    }
}

for (var i = 0; i < length; i++) {
    var jsonKey = jsonData[i]['EN'];
    var jsonValue = jsonData[i]['EN'];
    jsonValue = jsonValue.replace(/\bX\b/g, '{value}');
    
    jsonObj['EN'][jsonKey] = jsonValue;
    if (jsonData[i]['AR']) {
        jsonObj['AR'][jsonKey] = jsonData[i]['AR'].replace(/\bX\b/g, '{value}');
    }
    if (jsonData[i]['FR']) {
        jsonObj['FR'][jsonKey] = jsonData[i]['FR'].replace(/\bX\b/g, '{value}');
    }
    if (jsonData[i]['TR']) {
        jsonObj['TR'][jsonKey] = jsonData[i]['TR'].replace(/\bX\b/g, '{value}');
    }
    if (jsonData[i]['ID']) {
        jsonObj['ID'][jsonKey] = jsonData[i]['ID'].replace(/\bX\b/g, '{value}');
    }
    if (jsonData[i]['RU']) {
        jsonObj['RU'][jsonKey] = jsonData[i]['RU'].replace(/\bX\b/g, '{value}');
    }
}

console.log(jsonObj['EN']);


fs.writeFile('./json/en.json', JSON.stringify(jsonObj['EN'], null, 4));
if (jsonObj['AR']) {
    fs.writeFile('./json/ar.json', JSON.stringify(jsonObj['AR'], null, 4));
}
if (jsonObj['FR']) {
    fs.writeFile('./json/fr.json', JSON.stringify(jsonObj['FR'], null, 4));
}
if (jsonObj['TR']) {
    fs.writeFile('./json/tr.json', JSON.stringify(jsonObj['TR'], null, 4));
}
if (jsonObj['ID']) {
    fs.writeFile('./json/id.json', JSON.stringify(jsonObj['ID'], null, 4));
}
if (jsonObj['RU']) {
    fs.writeFile('./json/ru.json', JSON.stringify(jsonObj['RU'], null, 4));
}
fs.writeFile('./json/test.json', JSON.stringify(jsonData, null, 4));