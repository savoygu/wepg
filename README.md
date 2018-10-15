# 说明文档

## 项目诞生

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

## 插件开发

### 闭包的作用

```js
(function($) {
  // do something
})(jQuery)
```

1. 避免全局依赖
2. 避免第三方插件的破坏
3. 兼容 jQuery 操作符 $ 和 jQuery 对象

### 开发方式

类级别组件开发：

> 即给 jQuery 命令空间下添加新的全局函数，也成为静态方法。

```js
jQuery.myPlugin = function () {
  // do something
}
```

例如：`$.ajax()`、`$.extend()`

对象级别组件开发：

> 即挂在 jQuery 原型下的方法，这样通过选择器获取的 jQuery 对象实例也能共享该方法，也称为动态方法。

```js
$.fn.myPlugin = function () {
  // do something
}
// 这里 $.fn === $.prototype
```

例如：addClass()、attr()等，需要创建实例来调用

### 链式调用

```js
$.fn.myPlugin = function () {
  return this.each(function () {
    // do something
  })
}
```

代码说明：

- return this 返回当前对象，来维护插件的链式调用
- each 循环实现每个元素的访问

### 单例模式

```js
$.fn.myPlugin = function () {
  var me = $(this),
    instance = me.data('myPlugin')
  if (!instance) {
    me.data('myPlugin', (instance = new myPlugin()))
  }
}
```

代码说明：

- 如果实例存在则不再重新创建实例
- 利用 data() 来存放插件对象的实例

### 事件委托

语法：`on(events[, selector][, data], handler(eventObject))`

描述：在选定的元素上绑定一个或多个事件处理函数

- events 一个或多个空格分割的是事件类型，例如 click keydown。
- selector 一个选择器字符串，用于过滤出被选中的元素中能触发时间的后代元素，如果为 null，那么被选中的元素总是能触发事件。
- 事件触发时，要传递给处理函数的 event.data。
- handler(eventObject) 事件触发时，执行的函数。

优点：委托事件不仅可以给未创建的后代元素绑定事件外，当需要监视很多元素的时候，委托事件的开销更小。

### 绑定鼠标滚轮事件

- JS事件有很多需要兼容的地方，鼠标滚轮事件显然也有额外的差异。包括 IE6 浏览器在内都使用 mousewheel，而只有火狐浏览器使用 DOMMouseScroll。
- `$(document).on('mouseWheel DOMMouseScroll', handler)`

### 如何判断鼠标滚轮方向

- 其他浏览器通过 wheelDelta 属性来判断，但是火狐浏览器没有这个属性，可以通过 detail 这个属性来判断。
- 开发中可以发现每次向下滚动时，wheelDelta 都是 -120，但是 detail 确实 3，火狐浏览器方向判断的数值正负与其他浏览器是相反的。

## 绑定键盘事件 keydown

说明：keydown 事件发生在键盘的键被按下的时候。

原生 js 中判断按下了哪个键是存在兼容问题的：

- IE 只有 keyCode 属性
- FireFox 中有个 which 和 charCode 属性
- Opera 中有 keyCode 和 which 属性等

幸运的是 jQuey 已经解决了这个兼容性的问题。

jQuery 中通过 .witch 属性和 .keyCode 属性来确定按下了哪个键：

- arrow left 37
- arrow up 38
- arrow right 39
- arrow down 40

### transitionend

说明：transitionend 事件会在 CSS transition 结束后触发。

### 滑动动画

转换 Transform

- 转换方式
  - 旋转 rotate 例如：`transform: rotate(45deg)`
  - 缩放 scale 例如：`transform: scale(2, 0.5)`
  - 移动 translate 例如：`transform: translate(100px, -50px)`
  - 扭曲 skew 例如：`transform: skew(45deg, 45deg)`
  - 矩阵变形 `matrix(<number>, <number>, <number>, <number>, <number>, <number>)`

动画平滑过渡 Transtion

- 属性
  - transition-property: 设置过渡效果的 CSS 尚需经的名称，例如：background, color 或者 all。
  - transiton-duration: 完成过渡效果需要的事件，以s/ms为单位
  - transition-timing-function: 规定速度效果的速度曲线，例如：linear, ease, ease-in, ease-out, ease-in-out, cubic-bezier
  - transition-delay: 延迟时间，以 s/ms 为单位
  - transition：`<transition-property> <transition-duration> <transition-timing-function> <transition-delay>`

### 如何判断浏览器是否支持某个 CSS 属性

- 实现思路
  - 通过判断某个 element 的 style 中是否存在某个 css 属性。

- 实现代码

```js
(function (temp) {
  if (temp.style['transition'] !== undefined) {
    return true;
  }
  return false
})(document.createElement('div))
```

### `.animate()`

语法：`.animate(properties[, duration][, easing][, complete])`

描述：根据-组 CSS 属性，指定自定义动画

- properties 一个 CSS属性和值的对象，动画将根据这组对象移动。
- duration 一个字符串或者数字决定动画运行时间。（slow, normal, fast) ms 为单位。
- easing 表示动画使用哪种移动函数，linear 和 swing，默认 swing。
- complete 在动画完成时执行的函数。
