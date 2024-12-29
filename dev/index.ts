/*
 * @Author: chenzhongsheng
 * @Date: 2024-08-12 17:51:34
 * @Description: Coding something
 */

import {createStore, dom, mount, $, computed, watch, raw} from '../src';

function Counter () {
    const store = createStore({
        count: 0,
        count2: 3
    });

    const countAdd1 = computed(() => store.count + 1);
    countAdd1.sub((v: any) => {
        console.log(v, countAdd1.value);
    });

    return dom.div.append(
        dom.button.text($`count is ${store.count}; ${raw(22)} computed=${countAdd1} +1=${() => store.count2 + 1}; a=${store.count}`)
            .click(() => {
                store.count++;
                store.count2++;
            }),
        dom.div.append($`${store.count}`),
        dom.div.append(() => store.count),
        dom.div.append(countAdd1)
    );
}
mount(Counter(), 'body');


