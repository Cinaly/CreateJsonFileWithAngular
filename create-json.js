var fs = require('fs');
var readlineSync = require('readline-sync');
var path = require('path');//解析需要遍历的文件夹

// 定义目标地址
var dirPath = readlineSync.question('please input your dictionary?  ');

if(!dirPath){
    console.log('文件夹名字不能为空!!');
    return false;
}
var jsonStrEn = '{\r'; // 写入到json文件里的内容
var jsonArr = [];  //创建一个数组用来存json的key字段

fileDisplay(dirPath);

//文件遍历方法
function fileDisplay(filePath) {
    fs.readdir(filePath, function (err, files) {
        if (err) {
            console.log('不存在该文件夹!!');
        } else {
            //遍历读取到的文件列表
            for(var i=0;i<files.length;i++){
                var filename= files[i];
                //获取当前文件的绝对路径
                var filedir = path.join(filePath, filename);
                console.log('-----',filedir);
                var data = fs.statSync(filedir); //同步读取文件的状态
                if(data.isFile()){ //判断是否是文件
                    var temp = fs.readFileSync(filedir); //同步读取文件内容
                    filterHtml(temp);
                }
            }
            
            jsonStrEn = jsonStrEn.substring(0,jsonStrEn.length-2); //去掉末尾的,号和换行
            console.log(jsonArr);
            fs.writeFile('./'+dirPath+'/json/en.json',jsonStrEn+"\r}");  //将内容写入json文件
        }
    });
}

function filterHtml(html) {
    //判断是否存在文件夹
    if (!fs.existsSync('./'+dirPath+'/json')) {
        fs.mkdirSync('./'+dirPath+'/json/');
    }
    
    var reg = /\{\{\s*[\'\"][^{}|]*[\'\"]\s*\|\s*translate\s*\}\}/g; //正则查找{{ 'XXX' | translate }}
    var str = html.toString();
    var arr = str.match(reg); //找到所有匹配的内容
    if(arr&&arr.length>0){
        for(var i=0;i<arr.length;i++){  //将匹配到的内容进行遍历
            var ss = arr[i].replace('{{','').replace('}}','').replace('translate','').replace('|','')
                .replace('\n','').replace('\r','').replace(/\t+/g,' ').trim(); //将{{,}},|,translate,换行符,制表符 替换掉,并去掉空格
            var ccEn;
            var key = ss.substring(1,ss.length-1); //去掉首末单双引号
            if(jsonArr.indexOf(key)==-1){ //判断是否已经存在该key
                jsonArr.push(key);
                ccEn = '  "' + key + '":"' + key + '",' + '\r';  //字符串拼接成正确的json字符串
                jsonStrEn += ccEn;
            }
        }
    }
}