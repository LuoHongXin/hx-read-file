## 安装
```
npm install hxread -g
```
## 使用
### 读取目标路径下文件内容的中文
```
hxread [读取文件的路径] [输出的文件名] [支持读取文件的后缀]
```
### 对比目标路径下文件内容是否使用路径2导出的国际化对象文件
```
hxread [读取文件的路径] [国际化文件的路径] [输出的文件名] [支持读取文件的后缀]
```
### 目标路径下的文件内容中文转换成香港繁体字
```
hxread --hk [读取文件的路径] [支持读取文件的后缀]
```
- 读取文件的路径，会遍历递归读取路径上的所有文件
- 输出的文件名，会在执行指令的所在目录下输出生成文件，文件名默认为 output.txt
- 支持读取文件的后缀，不填会默认读取所有文件，填了则默认只读取支持读取文件的后缀的文件，用逗号分割符隔开，例: html,js ，这样就只会读取html和js文件
- 国际化文件的路径，国际化一般就是导出一个对象，可为json文件或js文件，js文件需要module.exports导出国际化对象。

### 读取翻译好的xlsx文件（含中英文），根据翻译后的英文生成变量，输出中文和英文的js对象
```
hxread --transObj [必填，翻译好的xlsx文件的路径] sheetName [读取所在sheet名称] cnName [必填，中文列名] enName [必填，英文列名] sheetIndex [读取所在sheet下标] only['cn':只输出中文,'en':只输出英文,默认'all']
```

### 读取项目中的中文
- 把项目中的国际化中文给注释掉，例如：
```js
 // import zhCN from "***/项目名.es"
// import zhHK from "***/项目名.es"
```
这是为了把已做国际化的中文排除，避免被打包进去。

- 打包构建项目
```
npm run build
```

- 找到输出的dist文件夹，找到里面的js文件夹，然后执行下面的命令，例如：
```
hxread D:\webapp_vue\dist\child\storage\static\js
```

- 最后就会看到一个 output.txt 文件，里面就是被抽取的中文。