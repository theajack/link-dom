/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-27 10:02:55
 * @Description: Coding something
 */

// @needUI=true
// @hideLog=true
// @dep=link-dom,link-dom-render
import { dom, ref, mount, join, collectRef  } from 'link-dom';
import { useRenderer } from 'link-dom-render';

const { ctx, msg } = (function initEnv () {
    const refs = collectRef('canvas');
    const msg = ref('Hello');
    mount(dom.div.children(
        dom.canvas.ref(refs.canvas).style('border', '1px solid red'),
        dom.div.children(
            dom.span.text(join`msg = ${msg}`),
            dom.button.text('Add !').click(() => msg.value += '!'),
        )
    ), '#jx-app');
    const size = 300;
    const canvas = refs.canvas.el;
    const scale = window.devicePixelRatio;
    canvas.width = canvas.height = size * scale;
    canvas.style.width = canvas.style.height = `${size}px`;
    canvas.style.backgroundColor = '#333';
    const ctx = canvas.getContext('2d');
    ctx.font = `${15 * scale}px Microsoft Sans Serif`;
    ctx.fillStyle = '#eee';
    ctx.textBaseline = 'top';
    function loopRender () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        root.render();
        requestAnimationFrame(loopRender);
    }
    setTimeout(loopRender);
    return { ctx, msg };
})();

const root = useRenderer({
    render (element) {
        // 此处仅为一个简单的例子，如果需要更复杂的渲染，需要自己实现CustomElement计算布局
        ctx.fillText(element.textContent, 0, 0);
    },
});

const App = () => {
    return dom.div.text(() => `msg = ${msg.value}`);
};

mount(App, root);