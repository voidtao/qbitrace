const path = require('path');

const { generateTheme, getLessVars } = require('antd-theme-generator');
// const lessPath = './public/assets/styles/variables.less';

const paths = [
  {
    path: './src/style/light.less',
    output: './public/assets/styles/light.less'
  }
];
(async () => {
  for (const p of paths) {
    const lessPath = path.join(__dirname, p.path);
    await generateTheme({
      antDir: path.join(__dirname, './node_modules/ant-design-vue'), // node_modules中antd的路径
      stylesDir: path.join(__dirname, './public/assets/styles'), // styles对应的目录路径
      varFile: lessPath, // less变量的入口文件
      themeVariables: Object.keys(getLessVars(lessPath)), // 您要动态更改的变量列表
      outputFilePath: path.join(__dirname, p.output) // 生成的color.less文件的位置
      // customColorRegexArray: [/^color\(.*\)$/]
    }).then(() => {
      console.log('配置主题成功');
    }).catch(() => {
      console.log('配置主题失败');
    });
  }
})();