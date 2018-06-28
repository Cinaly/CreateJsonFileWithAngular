//加载http模块
var http = require('http');

var fs = require('fs');
var readlineSync = require('readline-sync');

// Cheerio 是一个Node.js的库， 它可以从html的片断中构建DOM结构，然后提供像jquery一样的css选择器查询
var cheerio = require('cheerio');

var version = readlineSync.question('please input the version?(v1 or v2)');

// 定义目标地址
var url_release = 'http://172.31.12.154:3006/v1/and_server/host/release.html';
var url_beta = 'http://172.31.12.154:3006/v1/and_server/host/beta.html';
var url_dev = 'http://172.31.12.154:3006/v1/and_server/host/test.html';

if (version == 'v1') {
    if (!fs.existsSync(version)) { //判断是否存在v1或v2文件夹
        fs.mkdirSync("./" + version + "/"); //创建v1或v2文件夹
    }
    getData(url_release, 'v1', 'release');
    getData(url_beta, 'v1', 'beta');
    getData(url_dev, 'v1', 'dev');

} else if (version == 'v2') {
    if (!fs.existsSync(version)) {
        fs.mkdirSync("./" + version + "/");
    }
    getData(url_release, 'v2', 'release');
    getData(url_beta, 'v2', 'beta');
    getData(url_dev, 'v2', 'dev');
} else if (version == 'all') {
    if (!fs.existsSync('v1')) {
        fs.mkdirSync("./v1/");
    }
    if (!fs.existsSync('v2')) {
        fs.mkdirSync("./v2/");
    }
    getData(url_release, 'v1', 'release');
    getData(url_beta, 'v1', 'beta');
    getData(url_dev, 'v1', 'dev');
    getData(url_release, 'v2', 'release');
    getData(url_beta, 'v2', 'beta');
    getData(url_dev, 'v2', 'dev');
}

function getData(url, version, env) {
    http.get(url, function (res) {
        var html = '';
        // 获取页面数据
        res.on('data', function (data) {
            html += data;
        });
        // 数据获取结束
        res.on('end', function () {
            filterHtml(html, version, env);
        });
    }).on('error', function () {
        console.log('获取数据出错！');
    });
}

function filterHtml(html, version, env) {
    // 沿用JQuery风格，定义$
    var $ = cheerio.load(html);

    //获取host表格信息
    var hostList = $('.page-inner table tbody');

    if (version == 'v1') {
        var hostContent = "window._SITE = [];\n\n";
        var isFirstJollychic = true;
        var isFirstNimini = true;
        var isFirstMarkavip = true;

        var $trList = hostList.find('tr');

        for (var i = 0; i < $trList.length; i++) {
            if ($($trList[i]).text().indexOf('---') == -1) {
                var $tdList = $($trList[i]).find('td');
                for (var j = 1; j < $tdList.length; j++) {
                    if ($($tdList[1]).text() == 'jollychic') {
                        if (isFirstJollychic) {
                            isFirstJollychic = false;
                            hostContent += "window._SITE['jolly'] = {\n";
                            hostContent += "    PROTOCOL: 'jollychic://',\n";
                            hostContent += "    HOST : {\n";
                        } else {
                            for (var j = 1; j < $tdList.length; j++) {
                                if (j == 2) {
                                    hostContent += "        " + $($tdList[j]).text() + " : ";
                                }
                                if (j == 3) {
                                    hostContent += "'" + $($tdList[j]).text() + "', ";
                                }
                                if (j == 4) {
                                    hostContent += "// " + $($tdList[j]).text() + "\n";
                                }
                            }
                        }
                    }

                    if ($($tdList[1]).text() == 'nimini') {
                        if (isFirstNimini) {
                            isFirstNimini = false;
                            hostContent += "    }\n";
                            hostContent += "}\n\n\n";
                            hostContent += "window._SITE['nimini'] = {\n";
                            hostContent += "    PROTOCOL: 'nimini://',\n";
                            hostContent += "    HOST : {\n";
                        } else {
                            for (var j = 1; j < $tdList.length; j++) {
                                if (j == 2) {
                                    hostContent += "        " + $($tdList[j]).text() + " : ";
                                }
                                if (j == 3) {
                                    hostContent += "'" + $($tdList[j]).text() + "', ";
                                }
                                if (j == 4) {
                                    hostContent += "// " + $($tdList[j]).text() + "\n";
                                }
                            }
                        }
                    }

                    if ($($tdList[1]).text() == 'markavip') {
                        if (isFirstMarkavip) {
                            isFirstMarkavip = false;
                            hostContent += "    }\n";
                            hostContent += "}\n\n\n";
                            hostContent += "window._SITE['marka'] = {\n";
                            hostContent += "    PROTOCOL: 'markavip://',\n";
                            hostContent += "    HOST : {\n";
                        } else {
                            for (var j = 1; j < $tdList.length; j++) {
                                console.log($($tdList[j]).text());
                                if (j == 2) {
                                    hostContent += "        " + $($tdList[j]).text() + " : ";
                                }
                                if (j == 3) {
                                    hostContent += "'" + $($tdList[j]).text() + "', ";
                                }
                                if (j == 4) {
                                    hostContent += "// " + $($tdList[j]).text() + "\n";
                                }
                            }
                        }
                    }

                }
                if (i == $trList.length - 1) {
                    hostContent += "    }\n";
                    hostContent += "}\n";
                }
            }
        }
        fs.writeFile('./' + version + '/' + 'host-config-' + env + '.js', hostContent); //将数据写入文件
    } else if (version == 'v2') {
        var isFirstJollychic = true;
        var isFirstNimini = true;
        var isFirstMarkavip = true;
        var jsonContent = {   //v2的host的json格式对象
            "common": {},
            "jolly": {},
            "nimini": {},
            "mvip": {}
        };
        var protocol = "export const PROTOCOL = {\n";
        var $trList = hostList.find('tr');
        for (var i = 0; i < $trList.length; i++) {
            if ($($trList[i]).text().indexOf('---') == -1) {
                var $tdList = $($trList[i]).find('td');
                for (var j = 1; j < $tdList.length; j++) {
                    if ($($tdList[1]).text() == 'jollychic') {
                        if (isFirstJollychic) {
                            isFirstJollychic = false;
                            protocol += "    'jolly' : '" + $($tdList[1]).text() + "://',\n";
                        }
                        jsonContent['jolly'][$($tdList[2]).text()] = $($tdList[3]).text();
                    }

                    if ($($tdList[1]).text() == 'nimini') {
                        if (isFirstNimini) {
                            isFirstNimini = false;
                            protocol += "    'nimini' : '" + $($tdList[1]).text() + "://',\n";
                        }
                        jsonContent['nimini'][$($tdList[2]).text()] = $($tdList[3]).text();
                    }

                    if ($($tdList[1]).text() == 'markavip') {
                        if (isFirstMarkavip) {
                            isFirstMarkavip = false;
                            protocol += "    'mvip' : '" + $($tdList[1]).text() + "://'\n";
                        }
                        jsonContent['mvip'][$($tdList[2]).text()] = $($tdList[3]).text();
                    }
                }
            }
        }
        protocol += "};\n";
        fs.writeFile('./' + version + '/' + env + ".json", JSON.stringify(jsonContent));
        fs.writeFile('./' + version + '/' + 'protocol.config.js', protocol);
    }
}