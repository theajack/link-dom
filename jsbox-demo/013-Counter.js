/*
 * @Author: chenzhongsheng
 * @Date: 2025-10-02 20:58:47
 * @Description: Coding something
 */
// @needUI=true
// @hideLog=true
// @dep=link-dom
// @desc=Counter Demo

import { div, input, button, ref, mount, join } from 'link-dom';
function Counter () {
    const count = ref(0);
    return div(
        div(join`Count = ${count}`),
        input.bind(count),
        button('Increase').click(() => {
            count.value++;
        }),
    );
}
mount(Counter, '#jx-app');
