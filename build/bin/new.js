/* eslint-disable no-console */
'use strict';

console.log();
process.on('exit', () => {
  console.log();
});

if (!process.argv[2]) {
  console.error('[插件名]必填 - Please enter new plugin name');
  process.exit(1);
}

const fs = require('fs');
const path = require('path');
const fileSave = require('file-save');
const PluginName = process.argv[2];
const chineseName = process.argv[3] || PluginName;
const pluginname = PluginName.toLowerCase();
const Package$Path = path.resolve(__dirname, '../../packages/wepg', pluginname, '$');
const PackageNativePath = path.resolve(__dirname, '../../packages/wepg', pluginname, 'native');

const NativeFiles = [
  {
    filename: 'src/index.js',
    content: `/**
* ${PluginName} ${chineseName}
*
*/

export default class ${PluginName}{
  constructor(element, options) {
    var defaultOptions = {
      // TODO: 默认配置参数
    };

    this.settings = Object.assign({}, defaultOptions, options || {});
    this.element = document.querySelector(element);
    this.init();
  }

  init() {
    // TODO: 初始化
  }
}`
  },
  {
    filename: 'src/index.scss',
    content: `@import "sass-bem/bem";

$bem-component-namespace: 'wepg';

@include c(${pluginname}) {}`
  },
  {
    filename: 'package.json',
    content: `{
  "name": "@wepg/${pluginname}",
  "moduleName": "${PluginName}",
  "version": "0.0.0",
  "description": "原生 ${PluginName} 插件",
  "main": "./dist/${pluginname}.js",
  "module": "./dist/${pluginname}.esm.js",
  "jsnext:main": "./dist/${pluginname}.esm.js",
  "unpkg": "./dist/${pluginname}.min.js",
  "author": "savoygu <savoygu@126.com>",
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  },
  "repository": "https://github.com/wepg/wepg/tree/develop/packages/${pluginname}/native",
  "keywords": [
    "wepg",
    "${pluginname}"
  ],
  "files": [
    "dist",
    "src"
  ]
}`
  },
  {
    filename: 'index.html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>原生 ${PluginName} ${chineseName}插件</title>
  <style>
    * {
      margin: 0;
      padding: 0;
    }
    html, body {
      height: 100%;
    }
    body {
      background-color: burlywood;
    }
    h1 {
      padding: 60px 0 20px;
      text-align: center;
      color: white;
    }
  </style>
  <link rel="stylesheet" href="./dist/${pluginname}.css">
</head>
<body>
  <h1>Thanks，开始开发原生 ${PluginName} ${chineseName}插件吧！</h1>
</body>
<script src="./dist/${pluginname}.js"></script>
<script>
  /* eslint-disable */
  new ${PluginName}('#container', {})
  /* eslint-disable */
</script>
</html>`
  }
];

const Files = [
  {
    filename: 'src/index.js',
    content: `/**
* ${PluginName} ${chineseName}
*
*/

(function($) {
  var ${PluginName} = (function() {
    function ${PluginName}(element, options) {
      this.settings = $.extend(true, $.fn.${PluginName}.defaults, options||{});
      this.element = element;
      this.init();
    }

    ${PluginName}.prototype = {
      constructor: ${PluginName},
      init: function() {
        // TODO: 初始化
      }
    };

    return ${PluginName};
  })();

  $.fn.${PluginName} = function(options) {
    return this.each(function () {
      var me = $(this),
        instance = me.data('${PluginName}');
      if (!instance) {
        instance = new ${PluginName}(me, options);
        me.data('${PluginName}', instance);
      }
      if($.type(options) === 'string') return instance[options]();
    });
  };

  $.fn.${PluginName}.defaults = {
    // TODO: 默认参数配置
  };

})(jQuery);`
  },
  {
    filename: 'src/index.scss',
    content: `@import "sass-bem/bem";

$bem-component-namespace: 'wepg';

@include c(${pluginname}) {}`
  },
  {
    filename: `dist/${pluginname}.css`,
    content: ''
  },
  {
    filename: 'package.json',
    content: `{
  "name": "@wepg/${pluginname}-jquery",
  "version": "0.0.0",
  "description": "jQuery ${PluginName} 插件",
  "main": "./dist/${pluginname}.min.js",
  "repository": "https://github.com/wepg/wepg/tree/develop/packages/${pluginname}/$",
  "author": "savoygu <savoygu@126.com>",
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  },
  "keywords": [
    "wepg",
    "${pluginname}",
    "jquery"
  ],
  "files": [
    "dist",
    "src"
  ]
}`
  },
  {
    filename: 'index.html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>jQuery ${PluginName} ${chineseName}插件</title>
  <style>
    * {
      margin: 0;
      padding: 0;
    }
    html, body {
      height: 100%;
    }
    body {
      background-color: burlywood;
    }
    h1 {
      padding: 60px 0 20px;
      text-align: center;
      color: white;
    }
  </style>
  <link rel="stylesheet" href="./dist/${pluginname}.css">
</head>
<body>
  <h1>Thanks，开始开发jQuery ${PluginName} ${chineseName}插件吧！</h1>
</body>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
<script src="./src/index.js"></script>
<script>
  /* eslint-disable */
  $('#container').${PluginName}({})
  /* eslint-disable */
</script>
</html>`
  }
];

const pluginNames = fs.readdirSync(path.resolve(__dirname, '../../packages/wepg'))
  .filter(function(name) { return name.indexOf('.') === -1; });

if (pluginNames.indexOf(pluginname) > -1) {
  console.error('${PluginName} 已存在.');
  process.exit(1);
}

// 创建 plugin
NativeFiles.forEach(nativeFile => {
  fileSave(path.join(PackageNativePath, nativeFile.filename))
    .write(nativeFile.content, 'utf8')
    .end('\n');
});

Files.forEach(file => {
  fileSave(path.join(Package$Path, file.filename))
    .write(file.content, 'utf8')
    .end('\n');
});

console.log('DONE!');
