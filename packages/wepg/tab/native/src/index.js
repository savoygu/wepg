/**
* Tab 选项卡
*
*/
import { on, delegate, removeClass, removeAllClass, addClass, fadeIn, fadeOut } from '@wepg/dom';
import { assign } from '@wepg/utils';

export default class Tab{
  constructor(element, options) {
    const defaultOptions = {
      selectors: {
        nav: '.wepg-tab__nav',
        pane: '.wepg-tab__pane',
        active: '.active',
        current: '.current'
      },
      controls: {
        prev: '.wepg-tab__prev', // 切换到上一个 tab
        next: '.wepg-tab__next', // 切换到下一个 tab
        trigger: 'click'
      },
      index: 0, // 默认显示第几个 tab
      trigger: 'click', // 触发的方式：click, mouseover
      effect: 'default', // 切换的效果：default, fade
      autoplay: false, // 是否自动切换
      interval: 3000, // 切换间隔时长，单位 ms
      tabPosition: 'top' // 标签位置：top, right, bottom, left
    };

    this.settings = assign({}, defaultOptions, options || {});
    this.element = document.querySelector(element);
    this.init();
  }

  init() {
    const me = this;
    me.selectors = me.settings.selectors;
    me.controls = me.settings.controls;
    me.activeClass = me.selectors.active.substring(1);
    me.currentClass = me.selectors.current.substring(1);
    me.navItem = me.element.querySelectorAll(me.selectors.nav);
    me.paneItem = me.element.querySelectorAll(me.selectors.pane);

    me.trigger = (me.settings.trigger === 'click' || me.settings.trigger === 'mouseover') ? me.settings.trigger : 'click';
    me.effect = (me.settings.effect === 'default' || me.settings.effect === 'fade') ? me.settings.effect : 'default';
    me.tabsCount = me.navItem.length;
    me.index = (me.settings.index >= 0 && me.settings.index < me.tabsCount) ? me.settings.index : 0;

    me.timer = null;

    addClass(me.element, `is-${me.settings.tabPosition}`);

    me._initEvent();

    if (me.index > 0) {
      me._switchTab();
    }

    if (me.settings.autoplay) {
      me._autoPlay();
    }
  }

  _initEvent() {
    const me = this;

    delegate(me.element, me.selectors.nav, me.trigger, function(e) {
      const navItem = [].slice.call(me.navItem);
      me.index = navItem.indexOf(e.target);
      me._switchTab();
    });

    if (me.settings.autoplay) {
      on(me.element, 'mouseenter', function() {
        window.clearInterval(me.timer);
      });

      on(me.element, 'mouseleave', function() {
        me._autoPlay();
      });
    }

    delegate(me.element, me.controls.prev, me.controls.trigger, function() {
      me.index--;
      if(me.index < 0) {
        me.index = me.tabsCount - 1;
      }
      me._switchTab();
    });

    delegate(me.element, me.controls.next, me.controls.trigger, function() {
      me.index++;
      if (me.index >= me.tabsCount) {
        me.index = 0;
      }
      me._switchTab();
    });
  }

  _switchTab() {
    const me = this;

    removeAllClass(me.navItem, me.activeClass);
    addClass(me.navItem[me.index], me.activeClass);

    if (me.effect === 'default') {
      removeAllClass(me.paneItem, me.currentClass);
      addClass(me.paneItem[me.index], me.currentClass);
    } else if (me.effect === 'fade') {
      me.paneItem.forEach(function(item, index) {
        if (me.index === index) {
          fadeIn(me.paneItem[me.index]);
          addClass(me.paneItem[me.index], me.currentClass);
        } else {
          fadeOut(item);
          removeClass(item, me.currentClass);
        }
      });
    }
  }

  _autoPlay() {
    const me = this;

    me.timer = window.setInterval(function() {
      me.index++;

      if (me.index >= me.tabsCount) {
        me.index = 0;
      }

      me._switchTab();
    }, me.settings.interval);
  }
}
