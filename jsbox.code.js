/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-22 09:28:56
 * @Description: Coding something
 */
window.jsboxCode = {
    lib: 'https://cdn.jsdelivr.net/npm/link-dom',
    lang: 'javascript',
    needUI: true,
    code: `var {dom, ref, mount} = window.LinkDom;
function Counter () {
    const count = ref(0);
    return dom.button.text(() => \`count is \${count.value}\`)
        .click(() => count.value++);
}
mount(Counter(), '#jx-app');`
};