/*
* 滚动条封装jQuery版 version 1.0.1 使用说明 -->
*
* 同时需要引入 jq 和 jq-mousewheel插件
*
* *******************
* HTML结构：
* 1. 整体大盒子
* 2. 文本盒子
* 3. 滚动条盒子
* 4. 滚动条
*e.g.
* <div id="wrap"> 整体大盒子
*   <div id="txt">...</div> 文本盒子
*   <div id="bar"> 滚动条盒子
*       <div class="scroll"></div> 滚动条
*   </div>
* </div>
*
* ********************
* 样式：
* 1. 大盒子  定位 (position) overflow: hidden;
* 2. 文本盒子 定位 ( position: absolute; )
* 3. 滚动条盒子 定位 ( position: absolute; )
* 4. 滚动条 定位 ( position: absolute; )
*
* ********************
* 参数：
* 1. $wrap 为 整体大盒子
* 2. txt 为 文本区盒子
* 3. bar 为 滚动区
* 4. scroll 为 滚动条
* 5. time 为 动画时长
* e.g.
* $wrap.scrollbar({
    txt : $txt,
    bar : $bar,
    scroll : $scroll,
    time : 300 // 可选
* });
* */

$.fn.extend({
    scrollbar : function scrollbar( data ) {
        var $txt = data.txt,
            $bar = data.bar,
            $scroll = data.scroll,
            time = data.time || 300;

        var txtH = $txt.outerHeight(), // 文本内容的绝对高
            wrapH = this.height(),  // 外部盒子的高度
            tTop = $txt.position().top, // 文本最初的top值
            sTop = $scroll.position().top, // 滚动条最初的top值
            scrollH = wrapH*wrapH/txtH, // 滚动条的高度
            scrollRange = wrapH-scrollH, // 滚动条滚动的范围
            txtRange = txtH-wrapH, // 文本区滚动的范围
            sDan = scrollH/txtH*wrapH; // 用于计算 在滚轮事件中 滚动条的 top值

        // 判断是否要出现 滚动栏
        if( txtH > wrapH ) {
            // 滚动条的高度
            $scroll.height(scrollH);
            // 拖拽滚动条
            $scroll.mousedown(function (ev) {
                var y = sTop - ev.clientY;
                $(document).mousemove(function (ev) {
                    var y1 = ev.clientY;
                    sTop = y1 + y;
                    sTop = cala($scroll, sTop, scrollRange, 1);
                    $scroll.css("top", sTop);
                    // 文本内容滚动同比例的高度
                    tTop = -sTop / scrollRange * txtRange;
                    tTop = cala($txt, tTop, -txtRange, 0);
                    $txt.css("top",tTop);
                    return false;
                });
                $(document).mouseup(function () {
                    $(this).off("mousemove mouseup");
                });
            });
            // 点击滚动区域
            $bar.click(function (ev) {
                var bTop = $(this).offset().top,
                    y = ev.pageY - bTop,
                    dH = sTop + scrollH;   // 滚动栏中 滚动条底部 距离 滚动栏顶部 的数值
                // 如果 大于 dH，则向下滚动 滚动条，大于 dTop，则向上滚动 滚动条
                sTop = y>=dH ? sTop+scrollH : y<=sTop?sTop-scrollH:sTop;
                sTop = cala( $scroll, sTop, scrollRange, 1 );
                $scroll.animate({
                    top : sTop
                },time);
                // 文本内容滚动同比例的高度
                tTop = -sTop / scrollRange * txtRange;
                tTop = cala( $txt, tTop, -txtRange, 0 );
                $txt.animate({
                    top : tTop
                },time);
            });
            // 内容区滚轮事件
            $txt.mousewheel(function (ev,d) {
                tTop += scrollH*d;  // 滚轮滚动一次，文本内容 top 上滚或下滚 滚动条的高度
                tTop = cala( $(this), tTop, -txtRange, 0 );
                $(this).css("top", tTop);
                sTop += sDan*-d;  // 滚轮滚动一次，滚动条 top 上滚或下滚 与文本内容同比例的高度
                sTop = cala( $scroll, sTop, scrollRange, 1 );
                $scroll.css("top", sTop);
                return false;
            });
        } else {
            $bar.remove();
        }

        // 处理 元素position top值 的 max 和 min 函数
        function cala(obj,t,h,i) {
            t = Math[['min','max'][i]]( 0,t );
            t = Math[['max','min'][i]]( t,h );
            return t;
        }
    }
});