const cn = require("./cn");
const en = require("./en");
// 迭代对象
function generateObj(obj1, obj2, str) {
    for (let key in obj1) {
        let isChange = false
        if (typeof obj1[key] === 'object') {
            if (typeof obj2[key] !== 'object') {
                console.log("两个对象的 " + key + " 不一致");
                continue;
            }
            str = generateObj(obj1[key], obj2[key]);
            continue;
        }
        // 中文最后是句号，但英文却没有英文点则补充
        if (obj1[key].slice(-1) === "。" && obj2[key].slice(-1) !== ".") {
            obj2[key] += "."
            isChange = true

        }
        // 中文最后不是句号，但英文却有英文点则去掉
        else if (obj1[key].slice(-1) !== "。" && obj2[key].slice(-1) === ".") {
            obj2[key] = obj2[key].slice(0, -1)
            isChange = true
        }
        if (isChange) {
            str = momdifyStr(key, str, obj2[key])
        }
    }
    return str;
}
function momdifyStr(key, str, newStr) {
    // 使用正则表达式匹配对象的value值，并添加句号
    // const regex = /(\s*[^:]+:\s*)["']([^"]+)["']/g;
    const regex = new RegExp(`(\s*${key}\s*:\s*)["']([^"]+)["']`, "g")
    return str.replace(regex, function (match, $1, $2) {
        return $1 + `"${newStr}"`
    });
}

const fs = require('fs');



// 查找字符串中的对象
function findObject(str) {
    let level = 0;
    let startIdx = -1;
    let endIdx = -1;

    for (let i = 0; i < str.length; i++) {
        if (str[i] === '{') {
            level++;
            if (startIdx === -1) {
                startIdx = i;
            }
        } else if (str[i] === '}') {
            level--;
        }

        if (level === 0 && startIdx !== -1) {
            endIdx = i + 1;
            break;
        }
    }

    return str.substring(startIdx, endIdx);
}

function checkFullStop(cnPath, enPath) {
    // 读取原始文件
    fs.readFile(cnPath, 'utf8', (err, data) => {
        if (err) throw err;
        fs.readFile(enPath, 'utf8', (err, data2) => {
            if (err) throw err;
            // 读取文件获得的中文对象字符串
            let cnObjStr = findObject(data);
            let enObjStr = findObject(data2);
            try {
                // 中文对象
                const cnObj = eval('(' + cnObjStr + ')');
                // 英文对象
                const enObj = eval('(' + enObjStr + ')');

                const modifiedData = generateObj(cnObj, enObj, data2)
                // 写入新文件
                fs.writeFile('output.js', modifiedData, 'utf8', (err) => {
                    if (err) throw err;
                    console.log('新文件已生成！');
                });
            } catch (err) {
                console.log("字符串转中文报错：", err);
            }
        })
    });
}

module.exports = checkFullStop;