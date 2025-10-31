
// @needUI=true
// @hideLog=true
// @dep=link-dom,link-dom-render
import { div, ref, mount, join, canvas, collectRef, span, button } from 'link-dom';
import { useRenderer } from 'link-dom-render';

const { ctx, msg } = (function initEnv () {
    const refs = collectRef('canvas');
    const msg = ref('Hello');
    mount(div(
        canvas.ref(refs.canvas).style('border', '1px solid red'),
        div(
            span(join`msg = ${msg}`),
            button('Add !').click(() => msg.value += '!'),
        )
    ), '#app');
    const size = 300;
    const canvasEl = refs.canvas.el;
    const scale = window.devicePixelRatio;
    canvasEl.width = canvasEl.height = size * scale;
    canvasEl.style.width = canvasEl.style.height = `${size}px`;
    canvasEl.style.backgroundColor = '#333';
    const ctx = canvasEl.getContext('2d');
    ctx.font = `${15 * scale}px Microsoft Sans Serif`;
    ctx.fillStyle = '#eee';
    ctx.textBaseline = 'top';
    function loopRender () {
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
        root.render();
        requestAnimationFrame(loopRender);
    }
    setTimeout(loopRender);
    return { ctx, msg };
})();

const root = useRenderer({
    render (element) {
        const parent = element.parentElement || { deep: 0, textLeft: 0 };
        if (!parent.textLeft) parent.textLeft = 10;
        ctx.fillText(element.textContent, parent.textLeft, (parent.deep - 1)  * 15 + 10);
        parent.textLeft += (ctx.measureText(element.textContent).width);
        return el => {el.textLeft = 0;};
    },
});

const App = () => {
    return div(() => `msg = ${msg.value}`);
};

mount(App, root);