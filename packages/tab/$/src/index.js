/**
* Tab 选项卡
*
* 配置参数：
*    selectors: {
*      nav: '.wepg-tab__nav', // tab标签样式
*      pane: '.wepg-tab__pane', // 面板样式
*      active: '.active', // tab标签选中样式
*      current: '.current'  // 面板选中样式
*    },
*    controls: {
*      prev: '.wepg-tab__prev', // 切换到上一个 tab
*      next: '.wepg-tab__next' // 切换到下一个 tab
*    },
*    index: 0, // 默认显示第几个 tab
*    trigger: 'click', // 触发的方式：click, mouseover
*    effect: 'default', // 切换的效果：default, fade
*    autoplay: false, // 是否自动切换
*    interval: 3000 // 自动切换的时间间隔，单位为毫秒
*
* 使用方式：
*    $('#tab1').Tab({
*      autoplay: true
*    })
*/

(function($) {
  var Tab = (function() {
    function Tab(element, options) {
      this.settings = $.extend(true, $.fn.Tab.defaults, options||{});
      this.element = element;
      this.init();
    }

    Tab.prototype = {
      constructor: Tab,
      init: function() {
        // 初始化
        var me = this;
        me.selectors = me.settings.selectors;
        me.navItem = me.element.find(me.selectors.nav);
        me.paneItem = me.element.find(me.selectors.pane);

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
      },
      /*说明：初始化插件事件 */
      _initEvent: function() {
        var me = this;

        if (me.trigger === 'click') {
          me.element.on('click', me.selectors.nav, function() {
            me.index = $(this).index();
            me._switchTab();
          });
        } else if(me.trigger === 'mouseover') {
          me.element.on('mouseover', me.selectors.nav, function() {
            me.index = $(this).index();
            me._switchTab();
          });
        }

        if (me.settings.autoplay) {
          me.element.hover(function () {
            window.clearInterval(me.timer);
          }, function() {
            me._autoPlay();
          });
        }

        me.element.on(me.trigger, me.settings.controls.prev, function() {
          me.index--;
          if(me.index < 0) {
            me.index = me.tabsCount - 1;
          }
          me._switchTab();
        });

        me.element.on(me.trigger, me.settings.controls.next, function() {
          me.index++;
          if (me.index >= me.tabsCount) {
            me.index = 0;
          }
          me._switchTab();
        });
      },
      /*说明：切换 tab */
      _switchTab: function() {
        var me = this;
        me.navItem.eq(me.index).addClass('active').siblings('li').removeClass('active');

        if (me.effect === 'default') {
          me.paneItem.eq(me.index).addClass('current').siblings(me.selectors.pane).removeClass('current');
        } else if (me.effect === 'fade') {
          me.paneItem.eq(me.index).fadeIn().siblings(me.selectors.pane).fadeOut();
        }
      },
      /*说明：自动切换 */
      _autoPlay: function() {
        var me = this;

        me.timer = window.setInterval(function() {
          me.index++;

          if (me.index >= me.tabsCount) {
            me.index = 0;
          }

          me._switchTab();
        }, me.settings.interval);
      }
    };

    return Tab;
  })();

  $.fn.Tab = function(options) {
    return this.each(function () {
      var me = $(this),
        instance = me.data('Tab');
      if (!instance) {
        instance = new Tab(me, options);
        me.data('Tab', instance);
      }
      if($.type(options) === 'string') return instance[options]();
    });
  };

  $.fn.Tab.defaults = {
    // 默认参数配置
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
    interval: 3000 // 自动切换的时间间隔，单位为毫秒
  };

})(jQuery);
