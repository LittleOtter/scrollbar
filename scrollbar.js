
/*
* 语法为 es5
* 滚动条封装 version 1.0.1 使用说明 -->
*
* *******************
* 结构：
* 1. 整体大盒子
* 2. 文本盒子
* 3. 滚动条盒子
* 4. 滚动条
*e.g.
* <div id="wrap">
*   <div id="txt">...</div>
*   <div id="bar">
*       <div class="scroll"></div>
*   </div>
* </div>
*
* ********************
* 样式：
* 1. 大盒子  position: relative; overflow: hidden;
* 2. 文本盒子 position: absolute;
* 3. 滚动条盒子 position: absolute;
* 4. 滚动条 position: absolute;
*
* ********************
* 参数：
* 1. wrap 为 整体大盒子
* 2. txtBox 为 文本区盒子
* 3. bar 为 滚动区
* 4. scroll 为 滚动条
* 5. 是否禁止选中事件
* 6. 动画时长
* 7. 动画方式
* e.g.
* scrollbar({
    wrap : oWrap,
    txtBox : oTxt,
    bar : oBar,
    scroll : oScroll,
    flag : false, // 可选
    time : 300, // 可选
    aniType : "easeIn" // 可选
* });
* */

function scrollbar( /*wrap, txtBox, bar, scroll , flag, time, aniType*/ data ) {
    window.requestAnimationFrame = window.requestAnimationFrame || function (fn){
        return setTimeout( fn,1000/60 );
    }; // requestAnimationFrame 兼容

    var wrap = data.wrap,
        txtBox = data.txtBox,
        bar = data.bar,
        scroll = data.scroll,
        flag = data.flag,
        time = data.time || 300,
        aniType = data.aniType || "linear";

    var txtH = txtBox.scrollHeight, // 文本内容的绝对高
        wrapH = wrap.clientHeight,  // 外部盒子的高度
        scrollH = wrapH*wrapH/txtH, // 根据内容多少决定滚动条的高度
        scrollTopR = wrapH-scrollH,   // 滚动条的top值的范围
        txtTopR = txtH-wrapH,   // 文本区的top值的范围
        tTop = txtBox.offsetTop,   // 文本最初的top值
        sTop = scroll.offsetTop,  // 滚动条最初的top值
        sDan = scrollH/txtH*wrapH; // 用于计算 在滚轮事件中 滚动条的 top值

    if ( scrollH < wrapH ) {
        scroll.style.height = scrollH + 'px'; // 设置滚动条高度

        /*--------- 拖拽滚动条 --------*/
        addEvent(scroll, 'mousedown', function (ev) {
            ev = ev || window.event;
            var y = sTop - ev.clientY;

            var eFn1 = addEvent(document, 'mousemove', function (ev) { // 鼠标移动事件监听
                ev = ev || window.event;
                var y1 = ev.clientY;

                sTop = y1 + y;  // 原式为 clientY(新)-clientY(旧)+dTop 即拖拽后 滚动条 的 top值
                sTop = cala(scroll, sTop, scrollTopR, 1);   // 限制 元素的top值 的 min 和 max值
                scroll.style.top = sTop + 'px';
                // 文本内容滚动同比例的高度
                tTop = -sTop / scrollTopR * txtTopR;
                tTop = cala(txtBox, tTop, -txtTopR, 0);
                txtBox.style.top = tTop + 'px';
            });

            var eFn2 = addEvent(document, 'mouseup', function (ev) {
                removeEvent(document, 'mousemove', eFn1);
                removeEvent(document, 'mouseup', eFn2);
            });
        });
        
        /*--------- 点击滚动区 --------*/
        addEvent(bar,'click',function (ev) {
            ev = ev || window.event;
            var cTop = document.body.scrollTop || document.documentElement.scrollTop, // 获取文档已滚动的距离
                wrapFinalTop = finalOffsetTop(wrap),   // 获得 盒子对象 距离 文档顶部 的数值
                y = ev.clientY + cTop - wrapFinalTop, // 获取点击时，鼠标 在滚动栏 的位置
                dH = sTop + scrollH;   // 滚动栏中 滚动条底部 距离 滚动栏顶部 的数值
            // 如果 大于 dH，则向下滚动 滚动条，大于 dTop，则向上滚动 滚动条
            sTop = y>=dH ? sTop+scrollH : y<=sTop?sTop-scrollH:sTop;
            sTop = cala( scroll, sTop, scrollTopR, 1 );
            ani( scroll, "top", sTop, time, aniType );
            // 文本内容滚动同比例的高度
            tTop = -sTop / scrollTopR * txtTopR;
            tTop = cala( txtBox, tTop, -txtTopR, 0 );
            ani( txtBox, "top", tTop, time, aniType );
        });
        
        /*--------- 内容区滚轮事件 --------*/
        addEvent(txtBox,'mousewheel',function (ev){ // 滚轮事件
            tTop += scrollH*ev.scrollNum;  // 滚轮滚动一次，文本内容 top 上滚或下滚 滚动条的高度
            tTop = cala( txtBox, tTop, -txtTopR, 0 );
            txtBox.style.top = tTop + 'px';
            sTop += sDan*-ev.scrollNum;  // 滚轮滚动一次，滚动条 top 上滚或下滚 与文本内容同比例的高度
            sTop = cala( scroll, sTop, scrollTopR, 1 );
            scroll.style.top = sTop + 'px';
        });
    }else {
        wrap.removeChild(bar);
    }

    // 处理 元素position top值 的 max 和 min 函数
    function cala(obj,t,h,i) {
        t = Math[['min','max'][i]]( 0,t );
        t = Math[['max','min'][i]]( t,h );
        return t;
    }
    // 禁止选中事件
    flag && (document.addEventListener ? wrap.addEventListener("selectstart",function(ev){ev=ev||window.event;ev.preventDefault();})
        : wrap.attachEvent("onselectstart",function(){return false;}));

    // 事件监听兼容函数
    function addEvent(obj,type,eFn) {
        if (obj.addEventListener) {
            obj.addEventListener(type,fn);
            type === "mousewheel" && obj.addEventListener("DOMMouseScroll",fn);
        }else {
            obj.attachEvent('on'+type,fn);
        }

        function fn(ev) {   // 事件函数
            ev = ev || window.event;
            ev.scrollNum = ev.wheelDelta/120 || -ev.detail/3;
            eFn.call(obj,ev);
            ev.preventDefault && ev.preventDefault();   // 阻止默认滚轮事件 非IE
            return false;   // 阻止默认滚轮事件 IE
        }
        return fn;
    }
    // 移除事件监听兼容函数
    function removeEvent (obj,type,eFn) {
        if (obj.removeEventListener) {
            obj.removeEventListener(type,eFn);
            type === "mousewheel" && obj.addEventListener("DOMMouseScroll",eFn);
        }else {
            obj.detachEvent('on'+type,eFn);
        }
    }
    // 获取 定位对象 距离文档顶部的距离
    function finalOffsetTop(obj) {
        var sum = 0;
        while ( obj!==document.body ) {
            sum += obj.offsetTop;
            obj = obj.offsetParent;
        }
        return sum;
    }
    // 运动
    function ani( obj, attr, target, d, fn ){
        var Tween = {
                linear: function (t, b, c, d){  //匀速
                    return c*t/d + b;   //  t/d = prop;
                },
                easeIn: function(t, b, c, d){  //加速曲线
                    return c*(t/=d)*t + b;
                },
                easeOut: function(t, b, c, d){  //减速曲线
                    return -c *(t/=d)*(t-2) + b;
                },
                easeBoth: function(t, b, c, d){  //加速减速曲线
                    if ((t/=d/2) < 1) {
                        return c/2*t*t + b;
                    }
                    return -c/2 * ((--t)*(t-2) - 1) + b;
                }
            },
            sTime = new Date, // 初始时间 t0
            b = parseFloat( getInitStyleValue(obj)[attr] ), // 初始状态 s0
            c = parseFloat( target ) - b, // 变化值 s-s0
            TweenFn = Tween[fn]; // 运动曲线

        (function move() {
            var t = new Date - sTime; // 经过多长时间 tx-t0
            t>=d ? t=d : requestAnimationFrame(move);
            obj.style[attr] = TweenFn(t,b,c,d) + 'px'; // 当前状态 sx 并赋值给属性
        })();
        function getInitStyleValue(obj){ return obj.CurrentStyle || getComputedStyle(obj); }
    }
}