/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-22 09:28:56
 * @Description: Coding something
 */
window.jsboxCode = {
    lib: 'https://cdn.jsdelivr.net/npm/link-dom',
    lang: 'javascript',
    needUI: true,
    code: `const {dom, createStore, $, mount} = window.LinkDom;
function Counter () {
    const store = createStore({ count: 0 });
    return dom.button.text($\`count is \${store.count}\`)
        .click(() => store.count++);
}
mount(Counter(), '#jx-app');`
};