/**
 * @file 图片轮播剪头按钮
 * @import widget/flip/flip.js
 */
(function( gmu, $, undefined ) {
    $.extend( true, gmu.Flip, {

        template: {
            prev: '<span class="l-ui-arrow-prev l-ui-arrow"></span>',
            next: '<span class="l-ui-arrow-next l-ui-arrow"></span>'
        },

        options: {
            /**
             * @property {Boolean} [arrow=true] 是否显示点
             * @namespace options
             * @for Slider
             * @uses Slider.arrow
             */
            arrow: true,

            /**
             * @property {Object} [select={prev:'.ui-slider-pre',next:'.ui-slider-next'}] 上一张和下一张按钮的选择器
             * @namespace options
             * @for Slider
             * @uses Slider.arrow
             */
            select: {
                prev: '.l-ui-arrow-prev',    // 上一张按钮选择器
                next: '.l-ui-arrow-next'    // 下一张按钮选择器
            }
        }
    } );

    /**
     * 图片轮播剪头按钮
     * @class arrow
     * @namespace Flip
     * @pluginfor Flip
     */
    gmu.Flip.option( 'arrow', true, function() {
        var me = this,
            arr = [ 'prev', 'next' ];

        this.on( 'done.dom', function( e, $el, opts ) {
            var selector = opts.selector,
                container = $el.parent();

            arr.forEach(function( name ) {
                var item = container.find( selector[ name ] );
                item.length || container.append( item = $( me.tpl2html( name ) ) );
                me[ '_' + name ] = item;
            });
        } );

        this.on( 'ready', function() {
            arr.forEach(function( name ) {
                me[ '_' + name ].on( 'touchstart', function() {
                    me[ name ].call( me );
                } );
            });
        } );

        this.on( 'destroy', function() {
            me._prev.off( me.eventNs );
            me._next.off( me.eventNs );
        } );
    } );
})( gmu, gmu.$ );