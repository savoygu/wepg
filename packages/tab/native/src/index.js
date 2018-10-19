/**
* Tab 选项卡
*
*/

export default class Tab{
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
}
