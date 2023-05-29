/*
	读取翻译好的xlsx文件，根据英文翻译生成对象key，输出中文和英文value的对象
*/
const xlsx = require('xlsx');
const fs = require('fs');
const os = require('os') // os.EOL 换行符常量
// 读取xlsx文件
const workbook = xlsx.readFile('translate.xlsx');
const sheetName = workbook.SheetNames[12];
const worksheet = workbook.Sheets[sheetName];
const jsonData = xlsx.utils.sheet_to_json(worksheet);

 const stopwords = [
    'a', 'an', 'and', 'at', 'for', 'in', 'is', 'of', 'the', 'to', 'was', 'were', 'after'
  ];
  // 介词
const prepositions = [
  'about', 'above', 'across', 'after', 'against', 'among', 'around',
  'at', 'before', 'behind', 'below', 'beneath', 'beside', 'between',
  'beyond', 'by', 'down', 'during', 'except', 'for', 'from', 'in',
  'inside', 'into', 'near', 'of', 'off', 'on', 'onto', 'out', 'outside',
  'over', 'past', 'since', 'through', 'to', 'toward', 'under', 'until',
  'up', 'upon', 'with', 'within', 'without'
];
// 连词
const conjunctions = [
  'and', 'but', 'for', 'nor', 'or', 'so', 'yet', 'after', 'although',
  'as', 'because', 'before', 'if', 'once', 'since', 'than', 'that',
  'though', 'unless', 'until', 'when', 'where', 'whether', 'while'
];
// 副词
const adverbs = [
  'about', 'above', 'absolutely', 'actually', 'again', 'almost',
  'also', 'altogether', 'always', 'anyway', 'anywhere', 'apart',
  'approximately', 'around', 'as', 'back', 'badly', 'before',
  'certainly', 'chiefly', 'clearly', 'close', 'completely', 'consequently',
  'definitely', 'directly', 'doubtless', 'down', 'due', 'easily',
  'else', 'especially', 'essentially', 'even', 'ever', 'exactly',
  'fair', 'firstly', 'flat', 'for', 'forward', 'further',
  'furthermore', 'generally', 'hard', 'here', 'high', 'hopefully',
  'however', 'ill', 'in', 'indeed', 'instead', 'just', 'last',
  'late', 'least', 'left', 'less', 'likely', 'literally',
  'mainly', 'meanwhile', 'moreover', 'mostly', 'much', 'nearly',
  'necessarily', 'never', 'nevertheless', 'next', 'no', 'normally',
  'now', 'obviously', 'off', 'often', 'only', 'openly',
  'originally', 'out', 'particularly', 'perhaps', 'possibly',
  'probably', 'properly', 'quickly', 'rarely', 'rather', 'really',
  'right', 'round', 'seemingly', 'seriously', 'shortly', 'similarly',
  'simply', 'since', 'slightly', 'slowly', 'so', 'soon', 'specifically',
  'still', 'strongly', 'surely', 'then', 'there', 'thereby',
  'therefore', 'thus', 'together', 'too', 'truly', 'under', 'undoubtedly',
  'unfortunately', 'up', 'usually', 'very', 'well', 'wholly', 'widely',
  'wisely', 'yet'
];	
const stopwords2 = prepositions.concat(conjunctions).concat(adverbs)
// 根据输入的字符串生成变量名
function generateVariableName(text) {
  const regex = /[0-9a-zA-Z]+/g;
  text = text+""
  let words2 = text.match(regex);
  if (!words2) {
    return '';
  }

  let keyword = '';
  // 过滤介词副词连词这些
  let words = words2.filter(word => {
	return stopwords.indexOf(word) === -1 && stopwords2.indexOf(word) === -1
  })
  if (words.length > 10) { // 如果单词超过10个，只返回每个单词的首字母
	for (let i = 0; i < words.length; i++) {
      keyword += words[i].charAt(0);
    }
    return keyword += 'Text';;
  } 
  for (let i = 0; i < words.length; i++) {
    let word = words[i].toLowerCase();
    if (keyword) {
        keyword += word.charAt(0).toUpperCase() + word.slice(1);
    } else {
        keyword = word.charAt(0).toLowerCase() + word.slice(1);
    }
  }
  return keyword;
}
const data = {};
// 整理数据并导出
jsonData.forEach((item) => {
	const key = generateVariableName(item["英文版V1\n（长句仅首单词首字母大写，词组首字母大写）"])
	//data[key] = item["中文版"]
	data[key] = item["英文版V1\n（长句仅首单词首字母大写，词组首字母大写）"]
});
const outputData = `${JSON.stringify(data)};`;
// 输出到文件
fs.writeFileSync('output.js', outputData);