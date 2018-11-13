/**
 * PageSwitch 全屏滚动
 *
 * 配置参数：
 *    selectors: {
 *       sections: '.wepg-pageswitch__sections',
 *       section: '.swepg-pageswitch__ection',
 *       page: '.wepg-pageswitch__pages',
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
 *    new PageSwitch('#container', {
 *      direction: 'horizontal',
 *      loop: true
 *    })
 */
import { _prefix, on, delegate, addClass, setStyle, getOffset, removeAllClass } from '@wepg/dom';
import { assign } from '@wepg/utils';

export default class PageSwitch{
  constructor(element, options) {
    var defaultOptions = {
      selectors: {
        sections: '.wepg-pageswitch__sections',
        section: '.wepg-pageswitch__section',
        page: '.wepg-pageswitch__pages',
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

    this.settings = assign({}, defaultOptions, options || {});
    this.element = document.querySelector(element);
    this.init();
  }

  init() {
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
  }

  /*说明：获取滑动页面的数量 */
  pagesCount() {
    return this.section.length;
  }

  /*说明：获取滑动的宽度（横屏滑动）或高度（竖屏滑动） */
  switchLength() {
    return this.direction ? this.element.clientHeight : this.element.clientWidth;
  }

  /*说明：向前滚动即上一页面 */
  prev() {
    var me = this;
    if (me.index > 0) {
      me.index--;
    } else if (me.settings.loop) {
      me.index = me.pagesCount - 1;
    }
    me._scrollPage();
  }

  /*说明：向后滚动即下一页面 */
  next() {
    var me = this;
    if (me.index < me.pagesCount - 1) {
      me.index++;
    } else if (me.settings.loop) {
      me.index = 0;
    }
    me._scrollPage();
  }

  /*说明：主要针对横屏情况进行页面布局 */
  _initLayout() {
    var me = this;
    var width = (me.pagesCount * 100) + '%',
      cellWidth = (100 / me.pagesCount).toFixed(2) + '%';
    setStyle(me.sections, 'width', width);
    me.section.forEach(function(item) {
      setStyle(item, {
        width: cellWidth,
        float: 'left'
      });
    });
  }

  /*说明：实现分页的dom结构及css样式 */
  _initPaging() {
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
  }

  _initEvent() {
    var me = this;

    // 点击事件
    delegate(me.element, `${me.selectors.page} li`, 'click', function(e) {
      var pageItem = [].slice.call(me.pageItem);
      me.index = pageItem.indexOf(e.target);
      me._scrollPage();
    });

    // 鼠标事件
    on(me.element, ['DOMMouseScroll', 'mousewheel'], function(e) {
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
      on(me.sections, ['transitionend', 'webkitTransitionEnd', 'oTransitionEnd', 'otransitionend'], function() {
        me.canScroll = true;
        if (me.settings.callback && typeof me.settings.callback === 'function') {
          me.settings.callback();
        }
      });
    }
  }

  /*说明：滑动动画 */
  _scrollPage() {
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
      removeAllClass(me.pageItem, me.activeClass);
      addClass(me.pageItem[me.index], me.activeClass);
    }
  }
}
