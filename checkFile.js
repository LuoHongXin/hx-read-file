/*
  读取angular项目的js和html，过滤被注释或未使用的国际化
*/
var path = require('path');
var fs = require('fs');
const uglify = require('uglify-js');
const os = require('os') // os.EOL 换行符常量
// 加载编码转换模块
var iconv = require('iconv-lite');
// 递归遍历对象获取所有key
function getAllKeys(obj) {
  var keys = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'object') {
        var subkeys = getAllKeys(obj[key]);
        keys = keys.concat(subkeys.map(function (subkey) {
          return key + '.' + subkey;
        }));
      } else {
        keys.push(key);
      }
    }
  }
  return keys;
}

// 迭代生成新对象
function generateObject(arr, targetObj) {
  let obj = {};
  arr.forEach((item) => {
    let keys = item.split(".");
    let currentObj = obj;
    keys.forEach((key, idx) => {
      if (idx + 1 === keys.length) {
        currentObj[key] = readValue(keys, targetObj);
      } else if (!currentObj[key]) {
        currentObj[key] = {};
      }
      currentObj = currentObj[key];
    });
  });
  return obj;
}
// 根据路径遍历递归读取值
function readValue(arr, obj = targetObj) {
  var value = obj;
  for (var i = 0; i < arr.length; i++) {
    if (value[arr[i]] !== undefined) {
      value = value[arr[i]];
    } else {
      return undefined;
    }
  }
  return value;
}




// 写入文件内容
function writeFile(str, file) {
  return new Promise(res => {
    if (!file) file = "checkoutput.txt"
    // 把中文转换成字节数组
    var arr = iconv.encode(str + os.EOL, 'gbk');
    // appendFile，如果文件不存在，会自动创建新文件
    // 如果用writeFile，那么会删除旧文件，直接写新文件
    fs.appendFile(file, arr, function (err) {
      if (err)
        console.log("fail " + err);
      else
        console.log("写入文件ok");
      res()
    });
  })
}

/**
 * @description
 * @author luohongxin
 * @date 30/05/2023
 * @param {*} filePath 目标文件路径
 * @param {*} targetObj 国际化对象
 * @param {*} outputName 文件名称+后缀
 * @param {*} includeSuffix 包括的文件类型
 */
function checkFile(filePath, targetObj, outputName, includeSuffix) {
  let numIndex = 0;
  let keysArr = getAllKeys(targetObj); // 目标对象的所有key
  fileDisplay(filePath); // 读取路径下的文件
  const nousekeysArr = [];// 未使用到的对象key路径
  const newkeysArr = [];// 使用到的对象key路径
  const newValuesArr = [];// 使用到的对象值
  let isDone = false;
  let timer = setTimeout(timeExcute, 5 * 1000)
  // 遍历递归读取文件夹路径
  function fileDisplay(filePath) {
    //根据文件路径读取文件，返回文件列表
    fs.readdir(filePath, function (err, files) {
      if (err) {
        console.warn(err)
      } else {
        //遍历读取到的文件列表
        files.forEach(function (filename) {
          //获取当前文件的绝对路径
          var filedir = path.join(filePath, filename);
          //根据文件路径获取文件信息，返回一个fs.Stats对象
          fs.stat(filedir, async function (eror, stats) {
            if (eror) {
              console.warn('获取文件stats失败');
            } else {
              var isFile = stats.isFile();//是文件
              var isDir = stats.isDirectory();//是文件夹
              if (isFile) {
                // 符合后缀的文件才读取
                const nameSplit = filename.split(".")
                const suffix = nameSplit[nameSplit.length - 1]; // 文件后缀
                if (includeSuffix) {
                  for (let index = 0; index < includeSuffix.length; index++) {
                    const targetSuffix = includeSuffix[index];
                    if (targetSuffix === suffix) {
                      await readFile(filedir, outputName)
                      numIndex++;
                      console.log(`校验文件${numIndex}...`);
                      isDone = false;
                    }
                  }
                } else {
                  await readFile(filedir, outputName)
                  numIndex++;
                  console.log(`校验文件${numIndex}...`);
                  isDone = false;
                }
              }
              if (isDir) {
                fileDisplay(filedir);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
              }
            }
          })
        });
      }
    });
  }
  function timeExcute() {
    if (isDone) {
      console.log("开始写入文件");
      keysArr.forEach(i => {
        if (!newkeysArr.includes(i)) {
          nousekeysArr.push(i)
        }
      })
      newkeysArr.forEach(i => {
        let keys = i.split(".");
        const val = readValue(keys, targetObj);
        if (!newValuesArr.includes(val)) {
          newValuesArr.push(val)
        }
      })
      const newObj = generateObject(newkeysArr, targetObj); // 读取路径下的文件使用到的新对象
      writeFile("未使用：" + os.EOL + JSON.stringify(nousekeysArr) + os.EOL, outputName);
      writeFile("已使用：" + os.EOL + JSON.stringify(newkeysArr) + os.EOL, outputName);
      writeFile("已使用的国际化新对象：" + os.EOL + JSON.stringify(newObj) + os.EOL, outputName);
      writeFile("已使用的value值：" + os.EOL + JSON.stringify(newValuesArr) + os.EOL, outputName);
    } else if (timer) {
      clearTimeout(timer)
      timer = setTimeout(timeExcute, 5 * 1000)
    }
    isDone = true;
  }
  // 读取文件内容
  function readFile(file) {
    return new Promise(res => {
      fs.readFile(file, "utf8", async function (err, data) {
        if (err)
          console.log("读取文件fail " + err);
        else {
          let fileContent = "";
          if (file.indexOf(".html") > -1) {
            // html文件去除注释
            fileContent = data.replace(/<!--(.*?)-->/g, '');
          } else if (file.indexOf(".json") > -1) {
            fileContent = data;
          } else if (file.indexOf(".js") > -1) {
            // js文件去除注释
            const minifiedJs = uglify.minify(data, {
              output: {
                comments: false
              }
            });
            fileContent = minifiedJs.code;
          } else {
            fileContent = data;
          }
          keysArr.forEach(key => {
            // 若有使用到
            if (fileContent && fileContent.includes(key)) {
              newkeysArr.push(key)
            }
          })
          // 已经确定使用的就去掉检测
          keysArr = keysArr.filter(key => {
            return !newkeysArr.includes(key)
          })
        }
        res()
      });
    })
  }
}

module.exports = checkFile;