/*
 * @Author: chenzhongsheng
 * @Date: 2024-08-12 17:51:34
 * @Description: Coding something
 */

import {createStore, dom, mount, computed, watch} from '../src';

function Counter () {
    const store = createStore({
        count: 0,
        count2: 3
    });

    const countAdd1 = computed(() => store.count + 1);
    const countAddX = computed(() => store.count + countAdd1.value + 1);
    countAdd1.sub((v: any) => {
        console.log(v, countAdd1.value);
    });

    return dom.div.append(
        dom.button.text(() => `count is ${store.count}; ${22} cx=${countAddX.value} computed=${countAdd1.value} +1=${() => store.count2 + 1}; a=${store.count}`)
            .click(() => {
                store.count++;
                store.count2++;
            }),
        dom.div.append(() => store.count),
        dom.div.append(() => store.count),
        dom.div.append(countAdd1),
        dom.div.text(() => `count=${store.count}`)
            .show(() => `${store.count % 2 === 1 ? 'block' : 'none'}`),
        dom.div.text(() => `count=${store.count}`)
            .style('color', () => `${store.count % 2 === 1 ? 'red' : 'green'}`)
            .style('cursor', () => `${store.count % 2 === 1 ? 'pointer' : 'text'}`)
    );
}
mount(Counter(), 'body');

window.dom = dom;

const store = createStore({
    count: 0,
});

const countAdd1 = computed(() => store.count + 1);
const countAddX = computed(() => store.count + countAdd1.value + 1);

store.count ++;

console.log(countAdd1.value, countAddX.value);


