/*
 * @Author: tackchen
 * @Date: 2025-12-05 22:10:19
 * @Description: Coding something
 */


import { ref, computed, button, join, mount, div } from 'link-dom';
const count = ref(1);
const countAdd1 = computed(() => count.value + 1);
// mount(button.on.mousedown(e => {
//     console.log('mousedonw', e);
// })(
//     join`count is ${count}; countAdd1 is ${countAdd1}`
// ), '#app');
div.on.click;

window.div = div;