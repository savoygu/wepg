/**
 * PageSwitch 全屏滚动
 *
 * 配置参数：
 *    selectors: {
 *       sections: '.sections',
 *       section: '.section',
 *       page: '.pages',
 *       active: '.active'
 *     },
 *     index: 0, // 页面开始的索引
 *     easing: 'ease', // 动画效果
 *     duration: 500, // 动画执行时间
 *     loop: false, // 是否循环切换
 *     pagination: true, // 是否进行分页
 *     keyboard: true, // 是否支持键盘事件
 *     direction: 'vertical', // 滑动方向 vertical, horizontal
 *     callback: '' // 动画执行结束后的回调函数
 *
 * 使用方式：
 *  new PageSwitch('#container', {
 *    direction: 'horizontal',
 *    loop: true
 * })
 */
(function(window, document) {'use strict';
  var defaultOptions = {
    selectors: {
      sections: '.sections',
      section: '.section',
      page: '.pages',
      active: '.active'
    },
    index: 0, // 页面开始的索引
    easing: 'ease', // 动画效果
    duration: 500, // 动画执行时间
    loop: false, // 是否循环切换
    pagination: true, // 是否进行分页
    keyboard: true, // 是否支持键盘事件
    direction: 'vertical', // 滑动方向 vertical, horizontal
    callback: '' // 动画执行结束后的回调函数
  };

  var SPECIAL_CHARS_REGEXP = /([:\-_]+(.))/g;
  var MOZ_HACK_REGEXP = /^moz([A-Z])/;
  var ieVersion = Number(document.documentMode);

  /*说明：获取浏览器前缀 */
  /*实现：判断某个元素的 css 样式是否存在 transition 属性 */
  /*参数：dom 元素 */
  /*返回值：boolean, 有则返回浏览器样式前缀，否则返回 false */
  var _prefix = (function(temp) {
    var aPrefix = ['webkit', 'Moz', 'o', 'ms'],
      props = '';
    for (var i in aPrefix) {
      props = aPrefix[i] + 'Transition';
      if (temp.style[props] !== undefined) {
        return '-' + aPrefix[i].toLowerCase() + '-';
      }
    }
    return false;
  })(document.createElement(PageSwitch));

  /*去除空格 */
  var trim = function (string) {
    return (string || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '');
  };

  /*转换为驼峰标识 */
  var camelCase = function (name) {
    return name.replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
      return offset ? letter.toUpperCase() : letter;
    }).replace(MOZ_HACK_REGEXP, 'Moz$1');
  };

  /*绑定事件 */
  var on = (function () {
    if (document.addEventListener) {
      return function (element, event, handler) {
        if (element && event && handler) {
          element.addEventListener(event, handler, false);
        }
      };
    } else {
      return function (element, event, handler) {
        if (element && event && handler) {
          element.attachEvent('on' + event, handler);
        }
      };
    }
  })();

  /*设置样式 */
  var setStyle = function (element, styleName, value) {
    if (!element || !styleName) return;

    if (typeof styleName === 'object') {
      for (var prop in styleName) {
        if (styleName.hasOwnProperty(prop)) {
          setStyle(element, prop, styleName[prop]);
        }
      }
    } else {
      styleName = camelCase(styleName);
      if (styleName === 'opacity' && ieVersion < 9) {
        element.style.filter = isNaN(value) ? '' : 'alpha(opacity=' + value * 100 + ')';
      } else {
        element.style[styleName] = value;
      }
    }
  };

  /*是否包含 class */
  var hasClass = function (el, cls) {
    if (!el || !cls) return false;
    if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.');
    if (el.classList) {
      return el.classList.contains(cls);
    } else {
      return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }
  };

  /*添加 class */
  var addClass = function (el, cls) {
    if (!el) return;
    var curClass = el.className;
    var classes = (cls || '').split(' ');

    for (var i = 0, len = classes.length; i < len; i++) {
      var clsName = classes[i];
      if (!clsName) continue;

      if (el.classList) { // IE9+
        el.classList.add(clsName);
      } else {
        if (!hasClass(el, clsName)) {
          curClass += ' ' + clsName;
        }
      }
    }
    if (!el.classList) {
      el.className = curClass;
    }
  };

  /*移除 class */
  var removeClass = function (el, cls) {
    if (!el || !cls) return;
    var classes = cls.split(' ');
    var curClass = ' ' + el.className + ' ';

    for (var i = 0, len = classes.length; i < len; i++) {
      var clsName = classes[i];
      if (!clsName) return;

      if (el.classList) {
        el.classList.remove(clsName);
      } else {
        if (hasClass(el, clsName)) {
          curClass = curClass.replace(' ' + clsName + ' ', ' ');
        }
      }
    }
    if (!el.classList) {
      el.className = trim(curClass);
    }
  };

  /*获取 left 和 top 距离 */
  var getOffset = function (el) {
    var box = el.getBoundingClientRect();

    return {
      top: box.top + window.pageYOffset - document.documentElement.clientTop,
      left: box.left + window.pageXOffset - document.documentElement.clientLeft
    };
  };

  var PageSwitch = (function() {
    function PageSwitch(element, options) {
      this.settings = Object.assign({}, defaultOptions, options || {});
      this.element = document.querySelector(element);
      this.init();
    }

    PageSwitch.prototype = {
      constructor: PageSwitch,
      init: function () {
        var me = this;
        me.selectors = me.settings.selectors;
        me.sections = me.element.querySelector(me.selectors.sections);
        me.section = me.sections.querySelectorAll(me.selectors.section);

        me.direction = me.settings.direction === 'vertical' ? true : false;
        me.pagesCount = me.pagesCount();
        me.index = (me.settings.index >= 0 && me.settings.index <  me.pagesCount) ? me.settings.index : 0;

        me.canScroll = true;

        if (!me.direction) {
          me._initLayout();
        }

        if (me.settings.pagination) {
          me._initPaging();
        }

        me._initEvent();
      },
      /*说明：获取滑动页面的数量 */
      pagesCount: function() {
        return this.section.length;
      },
      /*说明：获取滑动的宽度（横屏滑动）或高度（竖屏滑动） */
      switchLength: function() {
        return this.direction ? this.element.clientHeight : this.element.clientWidth;
      },
      /*说明：向前滚动即上一页面 */
      prev: function() {
        var me = this;
        if (me.index > 0) {
          me.index--;
        } else if (me.settings.loop) {
          me.index = me.pagesCount - 1;
        }
        me._scrollPage();
      },
      /*说明：向后滚动即下一页面 */
      next: function() {
        var me = this;
        if (me.index < me.pagesCount - 1) {
          me.index++;
        } else if (me.settings.loop) {
          me.index = 0;
        }
        me._scrollPage();
      },
      /*说明：主要针对横屏情况进行页面布局 */
      _initLayout: function() {
        var me = this;
        var width = (me.pagesCount * 100) + '%',
          cellWidth = (100 / me.pagesCount).toFixed(2) + '%';
        setStyle(me.sections, 'width', width);
        me.section.forEach(function (item) {
          setStyle(item, {
            width: cellWidth,
            float: 'left'
          });
        });
      },
      /*说明：实现分页的dom结构及css样式 */
      _initPaging: function() {
        var me = this,
          page = me.selectors.page,
          pagesClass = page.substring(1);
        me.activeClass = me.selectors.active.substring(1);
        var pageEle = document.createElement('ul');
        addClass(pageEle, pagesClass);
        for(var i = 0; i < me.pagesCount; i++) {
          pageEle.appendChild(document.createElement('li'));
        }
        me.element.appendChild(pageEle);
        var pages = me.element.querySelector(page);
        me.pageItem = pages.querySelectorAll('li');
        addClass(me.pageItem[me.index], me.activeClass);

        if (me.direction) {
          addClass(pages, 'vertical');
        } else {
          addClass(pages, 'horizontal');
        }
      },
      _initEvent: function() {
        var me = this;

        // 点击事件
        on(me.element, 'click', function(e) {
          if (e.target && e.target.tagName !== 'LI') return;

          var pageItem = [].slice.call(me.pageItem);
          me.index = pageItem.indexOf(e.target);
          me._scrollPage();
        });

        // 鼠标事件
        ['DOMMouseScroll', 'mousewheel'].forEach(function(eventName) {
          on(me.element, eventName, function(e) {
            if (me.canScroll) {
              var delta = e.wheelDelta || e.detail;

              if (
                delta > 0 &&
                (me.index !== 0 && !me.settings.loop || me.settings.loop)
              ) {
                me.prev();
              } else if (
                delta < 0 &&
                (me.index < (me.pagesCount - 1) && !me.settings.loop || me.settings.loop)
              ) {
                me.next();
              }
            }
          });
        });

        // 键盘事件
        if (me.settings.keyboard) {
          on(window, 'keydown', function(e) {
            var keyCode = e.keyCode || e.charCode || e.which;
            if (keyCode === 37 || keyCode === 38) {
              me.prev();
            } else if (keyCode === 39 || keyCode === 40) {
              me.next();
            }
          });
        }

        // resize 事件
        on(window, 'resize', function() {
          var currentLength = me.switchLength(),
            currentSection = me.section[me.index],
            offset = me.settings.direction ?
              getOffset(currentSection).top :
              getOffset(currentSection).left;

          if (Math.abs(offset) > currentLength / 2 && me.index < (me.pagesCount - 1)) {
            me.index++;
          }

          if (me.index !== 0) {
            me._scrollPage();
          }
        });

        if (_prefix) {
          ['transitionend', 'webkitTransitionEnd', 'oTransitionEnd', 'otransitionend'].forEach(function(eventName) {
            on(me.sections, eventName, function() {
              me.canScroll = true;
              if (me.settings.callback && typeof me.settings.callback === 'function') {
                me.settings.callback();
              }
            });
          });
        }
      },
      /*说明：滑动动画 */
      _scrollPage: function() {
        var me = this,
          currentSection = me.section[me.index],
          dest = {
            left: currentSection.offsetLeft,
            top: currentSection.offsetTop
          };

        me.canScroll = false;
        if (_prefix) {
          setStyle(me.sections, _prefix + 'transition', 'all ' + me.settings.duration + 'ms ' + me.settings.easing);
          var translate = me.direction ? 'translateY(-' + dest.top + 'px)' : 'translateX(-' + dest.left + 'px)';
          setStyle(me.sections, _prefix + 'transform', translate);
        } else {
          var destination = me.direction ? -dest.top : -dest.left;
          var offset = me.direction ? me.sections.offsetTop : me.sections.offsetLeft;
          var speed = (destination - offset) / (me.settings.duration / 10);

          (function run() {
            if ((speed < 0 && me.sections.offsetLeft > destination) || (speed > 0 && me.sections.offsetLeft < destination)) {
              me.sections.style.left = me.sections.offsetLeft + speed + 'px';
              run.timer = setTimeout(run, 10);
            } else {
              clearTimeout(run.timer);
              me.sections.style.left = destination + 'px';
              me.canScroll = true;
              if (me.settings.callback && typeof me.settings.callback === 'function') {
                me.settings.callback();
              }
            }
          })();
        }

        if (me.settings.pagination) {
          me.pageItem.forEach(function(item) {
            if (hasClass(item, me.activeClass)) {
              removeClass(item, me.activeClass);
            }
          });
          addClass(me.pageItem[me.index], me.activeClass);
        }
      }
    };

    return PageSwitch;
  })();

  window.PageSwitch = PageSwitch;

}(window, document));
