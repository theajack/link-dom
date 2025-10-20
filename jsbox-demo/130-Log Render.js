
// @needUI=true
// @hideLog=true
// @dep=link-dom,link-dom-render
// @title=Custom Renderer
import { div, ref, computed, mount, join, span } from 'link-dom';
import { useRenderer } from 'link-dom-render';
const root = useRenderer({
    render (node) {
        const prefix = new Array(node.deep).fill('  ').join('');
        const text = `${node.innerText}`;
        console.log(`${prefix}${node.tagName || 'text'}: ${text.trim()}`);
    }
});
const App = () => {
    const count = ref(0);
    const countAdd2 = computed(() => count.value + 2);

    setInterval(() => {
        count.value ++;
        console.clear();
        root.render();
    }, 1000);

    return div(
        span(join`count = ${count}`),
        div(join`count + 2 = ${countAdd2}`),
    );
};
mount(App, root);