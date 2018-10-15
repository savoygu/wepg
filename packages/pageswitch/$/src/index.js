/**
 * @奇舞团
 *
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
 */
(function($) {'use strict';
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

  var PageSwitch = (function() {
    function PageSwitch (element, options) {
      this.settings = $.extend(true, $.fn.PageSwitch.defaults, options||{});
      this.element = element;
      this.init();
    }

    PageSwitch.prototype = {
      constructor: PageSwitch,
      /*说明：初始化插件 */
      /*实现：初始化dom结构，布局，分页及绑定事件 */
      init: function() {
        var me = this;
        me.selectors = me.settings.selectors;
        me.sections = me.element.find(me.selectors.sections);
        me.section = me.sections.find(me.selectors.section);

        me.direction = me.settings.direction === 'vertical' ? true : false;
        me.pagesCount = me.pagesCount();
        me.index = (me.settings.index >= 0 && me.settings.index < this.pagesCount) ? me.settings.index : 0;

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
        return this.direction ? this.element.height() : this.element.width();
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
        me.sections.width(width);
        me.section.width(cellWidth).css('float', 'left');
      },
      /*说明：实现分页的dom结构及css样式 */
      _initPaging: function () {
        var me = this,
          page = me.selectors.page,
          pagesClass = page.substring(1);
        me.activeClass = me.selectors.active.substring(1);
        var pageHtml = '<ul class='+ pagesClass +'>';
        for (var i = 0; i < me.pagesCount; i++) {
          pageHtml += '<li></li>';
        }
        pageHtml += '</ul>';
        me.element.append(pageHtml);
        var pages = me.element.find(page);
        me.pageItem = pages.find('li');
        me.pageItem.eq(me.index).addClass(me.activeClass);

        if (me.direction) {
          pages.addClass('vertical');
        } else {
          pages.addClass('horizontal');
        }
      },
      /*说明：初始化插件事件式 */
      _initEvent: function() {
        var me = this;

        // 点击事件
        me.element.on('click', me.selectors.page + ' li', function () {
          me.index = $(this).index();
          me._scrollPage();
        });

        // 鼠标事件
        me.element.on('mousewheel DOMMouseScroll', function (e) {
          if (me.canScroll) {
            var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;

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

        // 键盘事件
        if (me.settings.keyboard) {
          $(window).on('keydown', function (e) {
            var keyCode = e.keyCode;
            if (keyCode === 37 || keyCode === 38) {
              me.prev();
            } else if (keyCode === 39 || keyCode === 40) {
              me.next();
            }
          });
        }

        // resize 事件
        $(window).resize(function () {
          var currentLength = me.switchLength(),
            offset = me.settings.direction ?
              me.section.eq(me.index).offset().top :
              me.section.eq(me.index).offset().left;

          if (Math.abs(offset) > currentLength / 2 && me.index < (me.pagesCount - 1)) {
            me.index++;
          }

          if (me.index !== 0) {
            me._scrollPage();
          }
        });

        // transitionEnd 事件
        if (_prefix) {
          me.sections.on('transitionend webkitTransitionEnd oTransitionEnd otransitionend', function () {
            me.canScroll = true;
            if (me.settings.callback && $.type(me.settings.callback) === 'function') {
              me.settings.callback();
            }
          });
        }
      },
      /*说明：滑动动画 */
      _scrollPage: function() {
        var me = this,
          dest = me.section.eq(me.index).position();
        if (!dest) return;

        me.canScroll = false;
        if (_prefix) {
          me.sections.css(_prefix+'transition', 'all ' + me.settings.duration + 'ms ' + me.settings.easing);
          var translate = me.direction ? 'translateY(-' + dest.top + 'px)' : 'translateX(-' + dest.left + 'px)';
          me.sections.css(_prefix + 'transform', translate);
        } else {
          var animateCss = me.direction ? { top: -dest.top } : { left: -dest.left};
          me.sections.animate(animateCss, me.settings.duration, function() {
            me.canScroll = true;
            if (me.settings.callback && $.type(me.settings.callback) === 'function') {
              me.settings.callback();
            }
          });
        }

        if (me.settings.pagination) {
          me.pageItem.eq(me.index).addClass(me.activeClass).siblings('li').removeClass(me.activeClass);
        }
      }
    };

    return PageSwitch;
  })();

  $.fn.PageSwitch = function(options) {
    return this.each(function () {
      var me = $(this),
        instance = me.data('PageSwitch');
      if (!instance) {
        instance = new PageSwitch(me, options);
        me.data('PageSwitch', instance);
      }
      if($.type(options) === 'string') return instance[options]();
    });
  };

  $.fn.PageSwitch.defaults = {
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

}(jQuery));
