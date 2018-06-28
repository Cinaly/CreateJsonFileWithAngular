//加载http模块
var http = require('http');

var fs = require('fs');
var readlineSync = require('readline-sync');
var path = require('path');//解析需要遍历的文件夹

// Cheerio 是一个Node.js的库， 它可以从html的片断中构建DOM结构，然后提供像jquery一样的css选择器查询
var cheerio = require('cheerio');

// 定义目标地址
var dirPath = readlineSync.question('please input your dictionary?  ');

var jsonStrEn = '{\r';
var jsonArr = [];
getData(dirPath);

function getData(str) {
    if (CheckUrl(str)) {
        http.get(str, function (res) {
            var html = '';
            // 获取页面数据
            res.on('data', function (data) {
                html += data;
            });
            // 数据获取结束
            res.on('end', function () {
                filterHtml(html);
            });
        }).on('error', function () {
            console.log('获取数据出错！');
        });
    } else {
        fileDisplay(str);
    }
}

//文件遍历方法
function fileDisplay(filePath) {
    fs.readdir(filePath, function (err, files) {
        if (err) {
            console.warn(err);
        } else {
            //遍历读取到的文件列表
            for(var i=0;i<files.length;i++){
                var filename= files[i];
                //获取当前文件的绝对路径
                var filedir = path.join(filePath, filename);
                console.log('-----',filedir);
                var data = fs.statSync('./'+ filedir);
                console.log(data.isFile());
                if(data.isFile()){
                    var temp = fs.readFileSync('./'+ filedir);
                    filterHtml(temp);
                }
            }
            
            jsonStrEn = jsonStrEn.substring(0,jsonStrEn.length-2);
            console.log(jsonArr);
            createJsonFile(jsonStrEn+"\r}");
        }
    });
    
}

function CheckUrl(str) {
    var RegUrl = new RegExp();
    RegUrl.compile('^[A-Za-z]+://[A-Za-z0-9-_]+\\.[A-Za-z0-9-_%&\?\/.=]+$');
    if (!RegUrl.test(str)) {
        return false;
    }
    return true;
}

function filterHtml(html) {
    // 沿用JQuery风格，定义$
    var $ = cheerio.load(html);
    fs.writeFile('./en.html', html);
    
    if (!fs.existsSync('./'+dirPath+'/json')) {
        fs.mkdirSync('./'+dirPath+'/json/');
    }
    
    var reg = /\{\{\s*[\'\"].*[\'\"]\s*\|\s*translate\s*\}\}/g;
    var str = html.toString();
    var arr = str.match(reg);
    for(var i=0;i<arr.length;i++){
        var ss = arr[i].replace('{{','').replace('}}','').replace('translate','').replace('|','').trim();
        var ccEn;
        var key = ss.substring(1,ss.length-1);
        if(jsonArr.indexOf(key)==-1){
            jsonArr.push(key);
            ccEn = '  "' + key + '":"' + key + '",' + '\r';
            jsonStrEn += ccEn;
        }
    }
}

function createJsonFile(jsonStrEn) {
    fs.writeFile('./'+dirPath+'/json/en.json',jsonStrEn);
}