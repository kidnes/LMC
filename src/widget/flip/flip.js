/**
 * @file 页面翻页组件
 * @import extend/touch.js, extend/event.ortchange.js, core/widget.js
 * @module GMU
 */
(function( gmu, $, undefined ) {
    var cssPrefix = $.fx.cssPrefix,
        transitionEnd = $.fx.transitionEnd,

        // todo 检测3d是否支持。
        translateZ = ' translateZ(0)';
    
    /**
     * 页面翻页组件
     *
     * @class Slider
     * @constructor Html部分
     * ```html
     * <div id="slider">
     *   <div>
     *       <a href="http://www.baidu.com/"><img lazyload="image1.png"></a>
     *       <p>1,让Coron的太阳把自己晒黑—小天</p>
     *   </div>
     *   <div>
     *       <a href="http://www.baidu.com/"><img lazyload="image2.png"></a>
     *       <p>2,让Coron的太阳把自己晒黑—小天</p>
     *   </div>
     *   <div>
     *       <a href="http://www.baidu.com/"><img lazyload="image3.png"></a>
     *       <p>3,让Coron的太阳把自己晒黑—小天</p>
     *   </div>
     *   <div>
     *       <a href="http://www.baidu.com/"><img lazyload="image4.png"></a>
     *       <p>4,让Coron的太阳把自己晒黑—小天</p>
     *   </div>
     * </div>
     * ```
     *
     * javascript部分
     * ```javascript
     * $('#slider').slider();
     * ```
     * @param {dom | zepto | selector} [el] 用来初始化Slider的元素
     * @param {Object} [options] 组件配置项。具体参数请查看[Options](#GMU:Slider:options)
     * @grammar $( el ).slider( options ) => zepto
     * @grammar new gmu.Slider( el, options ) => instance
     */
    gmu.define( 'Flip', {

        options: {

            /**
             * @property {Boolean} [loop=true] 是否连续滑动
             * @namespace options
             */
            loop: true,
            
            /**
             * @property {Number} [speed=400] 动画执行速度
             * @namespace options
             */
            speed: 400,

            /**
             * @property {Number} [index=0] 初始位置
             * @namespace options
             */
            index: 0,

            selector: { }
        },

        _create: function() {
            var me = this,
                $el = me.getEl(),
                opts = me._options;

            me.index = opts.index;

            me._initWidth( $el );

            // 初始dom结构
            me._initDom( $el, opts );

            //初始事件
            me._initEvent( $el );
        },

        _initEvent: function( $el ) {
            var _eventHandler = $.proxy( this._eventHandler, this );

            $el.on( 'touchstart mousedown touchmove mousemove touchend mouseup', _eventHandler );
        },

        _eventHandler: function( e ) {
            // console.log('_eventHandler:',e.type)
            switch ( e.type ) {
                case 'touchstart':
                case 'mousedown':
                    this._touchStart( e );
                    break;
                case 'touchmove':
                case 'mousemove':
                    this._touchMove( e );
                    break;
                case 'touchend':
                case 'mouseup':
                    this._touchEnd( e );
                    break;
            }
        },

        _touchStart: function( e ) {
            console.log('start')
            var me = this,
                opts = me._options,
                touch = e.touches ? e.touches[0] : e;

            if ( !opts.loop && this.index >= this.items.length - 1 ) return;

            $.extend( me._options, {
                pageY:      touch.pageY,
                S:          true,      //isStarted
                M:          false,      //isMoving
                D:          null,       //direction
                Y:          0           //vertical moved
            });


            me.trigger('flipStart');
        },

        _touchMove: function( e ) {
            e.stopPropagation();
            e.preventDefault();
            console.log('touchmove');

            if ( !this._options.S ) return;
            
            var me = this,
                opts = me._options,
                touch = e.touches ? e.touches[0] : e,
                Y = touch.pageY - opts.pageY,
                index = me.index,
                moveIndex = me.moveIndex,
                item = me.items[ index ],
                moveItem,
                direction;

            if ( isNaN( Y )) return;
            if ( !opts.loop && this.index >= this.items.length - 1 ) return;

            if (moveIndex >= 0) moveItem = me.items[ moveIndex ];

            if ( !opts.D ) {
                console.log('opts.D', opts.D);
                opts.D = Y > 0 ? 'up' : 'down' ;
                
                var len = me.items.length;

                moveIndex = opts.D == 'down' ? index + 1 : index - 1;
                if ( moveIndex < 0 ) moveIndex = len - 1;
                else if ( moveIndex >= len) moveIndex = 0;

                moveItem = me.items[ moveIndex ];

                me.moveIndex = moveIndex;

                me._insertItem( opts );

                opts.M = true;
            }

            opts.Y = Y;

            direction = opts.D == 'down' ? 1 : -1;

            
            me._translate( moveItem[0], me.height * direction + Y, 0, translateZ );
            me._translate( item[0],  Y / 5, 0 );
        },

        _touchEnd: function( e ) {
            var me = this,
                opts = me._options,
                index = me.index,
                moveIndex = me.moveIndex,
                item = me.items[ index ],
                moveItem = me.items[ moveIndex ];

            console.log('end:', opts.M);
            
            opts.S = false;

            if ( !opts.M ) return;

            opts.M = false;

            if ( !opts.loop && this.index >= this.items.length - 1 ) return;

            if ( !moveItem ) {
                me._translate( item[0], 0, opts.speed ); 
                return;
            }

            var isChange = Math.abs( opts.Y ) > me.height / 10,
                direction = opts.D == 'down' ? 1 : -1,
                pos = isChange ? -1 * direction * me.height / 5 : 0,
                movePos = isChange ? 0 : direction * me.height;

            ( isChange ? item : moveItem).on( transitionEnd + me.eventNs,
                    $.proxy( me._tansitionEnd, me ));

            if ( isChange ) {
                me.index += direction;
                if ( me.index < 0 ) me.index += me.items.length;
                else if ( me.index >= me.items.length ) me.index = 0;
                console.log('index:'+me.index);
            }

            me._translate( moveItem[0], movePos, opts.speed, translateZ ); 
            me._translate( item[0], pos, opts.speed ); 

            opts.D = null;
        },

         _tansitionEnd: function( e ) {
            console.log('_tansitionEnd');
            var target = e.target;

            $(target).off( transitionEnd + this.eventNs );

            target.parentNode.removeChild(target);
            
            this.trigger( 'flipend', this.index );
        },

        _initDom: function( $el, opts ) {
            var items = this.items = [ ],
                container = $el;

            if ( !opts.items ) opts.items = container.children();

            container.html('');

        
            if ( typeof opts.items[ 0 ] == 'string' ||  ~opts.items[ 0 ].length ) {
                for (var i = 0, len = opts.items.length; i < len; i++) {
                    items.push( $( opts.items[ i ] ) );
                }
            } else {
                items = opts.items;
            }
            
            container.append( items[ 0 ] );

            this.trigger( 'done.dom', $el, opts );
        },

        // 根据items里面的数据挨个render插入到container中
        _insertItem: function( opts ) {
            var me = this,
                container = me.getEl(),
                moveIndex = me.moveIndex;
            
            var item = me.items[ moveIndex ],
                pos;

            switch ( opts.D ) {
                case 'down':
                    me._translate( item[ 0 ], me.height, 0);
                    break;
                case 'up':
                    me._translate( item[ 0 ], -1 * me.height, 0);
                    break;
            }

            container.append( item );
        },

        _initWidth: function( $el, force ) {
            var me = this,
                width;

            // width没有变化不需要重排
            if ( !force && (width = $el.width()) === me.width ) {
                return;
            }

            me.width = width;
            me.height = $el.height();
            me.trigger( 'width.change' );
        },

        _translate: function( dom, dist, speed, translateZ ) {
            var style = dom.style;

            if ( !style ) {
                return false;
            }

            style.cssText += cssPrefix + 'transition-duration:' + speed + 
                    'ms;' + cssPrefix + 'transform: translate(0, ' + 
                    dist + 'px)' + ( translateZ || '' ) + ';';
        },

        flipTo: function( to, speed ) {
            var me = this,
                opts = me._options,
                len = me.items.length,
                index = me.index,
                item = me.items[ index ],
                moveItem;

            opts.D = to > index ? 'down' : 'up';

            var direction = opts.D == 'down' ? 1 : -1;

            if ( to >= len ) to = 0;
            else if ( to < 0 ) to = len - 1;
            
            moveItem = me.items[ to ];

            me.moveIndex = to;

            me._insertItem( opts );

            item.on( transitionEnd + me.eventNs,
                    $.proxy( me._tansitionEnd, me ));

            setTimeout( function() {
                me._translate( moveItem[0], 0, speed, translateZ ); 
                me._translate( item[0], -1 * direction * me.height / 5, speed );
            }, 100 );
            

            me.index = to;
        },

        /**
         * 切换到上一个slide
         * @method prev
         * @chainable
         * @return {self} 返回本身
         */
        prev: function() {
            
            if ( this._options.loop || this.index > 0 ) {
                this.flipTo( this.index - 1, this._options.speed );
            }

            return this;
        },

        /**
         * 切换到下一个slide
         * @method next
         * @chainable
         * @return {self} 返回本身
         */
        next: function() {
            
            if ( this._options.loop || this.index + 1 < this.length ) {
                this.flipTo( this.index + 1, this._options.speed );
            }

            return this;
        },

        /**
         * 返回当前显示的第几个slide
         * @method getIndex
         * @chainable
         * @return {Number} 当前的silde序号
         */
        getIndex: function() {
            return this.index;
        },

        /**
         * 销毁组件
         * @method destroy
         */
        destroy: function() {
            this._container.off( this.eventNs );
            $( window ).off( 'ortchange' + this.eventNs );
            return this.$super( 'destroy' );
        }
        
        /**
         * @event ready
         * @param {Event} e gmu.Event对象
         * @description 当组件初始化完后触发。
         */

        /**
         * @event done.dom
         * @param {Event} e gmu.Event对象
         * @param {Zepto} $el slider元素
         * @param {Object} opts 组件初始化时的配置项
         * @description DOM创建完成后触发
         */
        
        /**
         * @event width.change
         * @param {Event} e gmu.Event对象
         * @description slider容器宽度发生变化时触发
         */
        
        /**
         * @event slideend
         * @param {Event} e gmu.Event对象
         * @param {Number} index 当前slide的序号
         * @description slide切换完成后触发
         */
        
        /**
         * @event slide
         * @param {Event} e gmu.Event对象
         * @param {Number} to 目标slide的序号
         * @param {Number} from 当前slide的序号
         * @description slide切换时触发（如果切换时有动画，此事件触发时，slide不一定已经完成切换）
         */
        
        /**
         * @event destroy
         * @param {Event} e gmu.Event对象
         * @description 组件在销毁的时候触发
         */
    } );

})( gmu, gmu.$ );