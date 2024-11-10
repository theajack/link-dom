/*
 * @Author: chenzhongsheng
 * @Date: 2024-08-12 17:51:34
 * @Description: Coding something
 */

// import {createStore, dom, mount, react} from '../src';
import {createStore, dom, mount, react, style} from '../npm';
style({
    '.a': {
        di
    }
});
function main () {
    const store = createStore({count: 0});

    dom.div.style({
        display: ''
    });

    return dom.button.text(react`count is ${store.count}`)
        .click(() => store.count++);
}

mount(main(), 'body');