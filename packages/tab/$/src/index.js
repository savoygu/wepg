/**
* Tab 选项卡
*
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
        // TODO: 初始化
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
    // TODO: 默认参数配置
  };

})(jQuery);
