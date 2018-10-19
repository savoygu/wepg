# 说明文档

## 安装

全屏滚动：PageSwitch

```bash
# 原生 JavaScript
npm install @wepg/pageswitch

# jQuery
npm install @wepg/pageswitch-jquery
```

## 新建插件开发结构

例如：开发一个轮播图插件

```bash
# Carousel 会作为全局对象，所以首字符必须大写
npm run new -- Carousel 轮播图
```

## 运行与构建

```bash
# 开发 jQuery tab 插件
name=tab npm run dev:$

# 开发原生 js tab插件
name=tab npm run dev:native

# 构建 jQuery 插件
npm run build:$

# 构建原生 js 插件
npm run build:native

# 构建所有 js 插件
npm run build
```

## 项目搭建

1. 创建 git 项目，然后 clone 到本地

```bash
git clone
```

2. 初始化 package.json 文件

```bash
npm init
```

3. 创建 `.editorconfig` 文件

```bash
# 安装 editorconfig-cli
npm install -g editorconfig-cli

# 初始化配置
ec init
```

4. 创建 `.eslintrc.json` 文件

```
# 安装 eslint
npm install eslint --save-dev

# 初始化配置
npx eslint --init
```
