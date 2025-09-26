/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-26 17:14:10
 * @Description: Coding something
 */
// @needUI=true
// @hideLog=true
// @dep=link-dom
// @desc=Counter Demo

import { dom, ref, mount, join } from 'link-dom';
function Counter () {
    const count = ref(0);
    return dom.div.children(
        dom.div.text(join`Count = ${count}`),
        dom.input.bind(count),
        dom.button.text('Increase').click(() => {
            count.value++;
        }),
    );
}
mount(Counter, '#jx-app');