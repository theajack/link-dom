/*
 * @Author: chenzhongsheng
 * @Date: 2024-08-12 17:51:34
 * @Description: Coding something
 */

import {createStore, dom, mount, $} from '../src';

function Counter () {
    const store = createStore({count: 0});
    return dom.button.text($`count is ${store.count}`)
        .click(() => store.count++);
}
mount(Counter(), 'body');

