/**
* Tab 选项卡
*
*/
import { on, hasClass, removeClass, addClass, fadeIn, fadeOut } from '@wepg/dom';

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
        next: '.wepg-tab__next' // 切换到下一个 tab
      },
      index: 0, // 默认显示第几个 tab
      trigger: 'click', // 触发的方式：click, mouseover
      effect: 'default', // 切换的效果：default, fade
      autoplay: false, // 是否自动切换
      interval: 3000
    };

    this.settings = Object.assign({}, defaultOptions, options || {});
    this.element = document.querySelector(element);
    this.init();
  }

  init() {
    const me = this;
    me.selectors = me.settings.selectors;
    me.activeClass = me.selectors.active.substring(1);
    me.currentClass = me.selectors.current.substring(1);
    me.navItem = me.element.querySelectorAll(me.selectors.nav);
    me.paneItem = me.element.querySelectorAll(me.selectors.pane);

    me.trigger = (me.settings.trigger === 'click' || me.settings.trigger === 'mouseover') ? me.settings.trigger : 'click';
    me.effect = (me.settings.effect === 'default' || me.settings.effect === 'fade') ? me.settings.effect : 'default';
    me.tabsCount = me.navItem.length;
    me.index = (me.settings.index >= 0 && me.settings.index < me.tabsCount) ? me.settings.index : 0;

    me.timer = null;

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
    const navClass = me.selectors.nav.substring(1);

    if (me.trigger === 'click') {
      on(me.element, 'click', function(e) {
        // if (!hasClass(e.target, navClass) || hasClass(e.target, me.activeClass)) return;
        if (!hasClass(e.target, navClass)) return;

        const navItem = [].slice.call(me.navItem);
        me.index = navItem.indexOf(e.target);
        me._switchTab();
      });
    } else if(me.trigger === 'mouseover') {
      on(me.element, 'mouseover', function(e) {
        // if (!hasClass(e.target, navClass) || hasClass(e.target, me.activeClass)) return;
        if (!hasClass(e.target, navClass)) return;

        const navItem = [].slice.call(me.navItem);
        me.index = navItem.indexOf(e.target);
        me._switchTab();
      });
    }

    if (me.settings.autoplay) {
      on(me.element, 'mouseenter', function() {
        window.clearInterval(me.timer);
      });

      on(me.element, 'mouseleave', function() {
        me._autoPlay();
      });
    }

    on(document.querySelector(me.settings.controls.prev), me.trigger, function() {
      me.index--;
      if(me.index < 0) {
        me.index = me.tabsCount - 1;
      }
      me._switchTab();
    });

    on(document.querySelector(me.settings.controls.next), me.trigger, function() {
      me.index++;
      if (me.index >= me.tabsCount) {
        me.index = 0;
      }
      me._switchTab();
    });
  }

  _switchTab() {
    const me = this;

    me.navItem.forEach(function(item) {
      if (hasClass(item, me.activeClass)) {
        removeClass(item, me.activeClass);
      }
    });

    addClass(me.navItem[me.index], me.activeClass);

    if (me.effect === 'default') {
      me.paneItem.forEach(function(item) {
        if (hasClass(item, me.currentClass)) {
          removeClass(item, me.currentClass);
        }
      });

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
