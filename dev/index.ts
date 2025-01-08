/*
 * @Author: chenzhongsheng
 * @Date: 2024-08-12 17:51:34
 * @Description: Coding something
 */

import {createStore, dom, mount, computed, watch, ref, style} from '../src';
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

    watch(store.count, (v, old) => {
        console.log('store.count', v, old);
    });

    return dom.div.append(
        dom.button.text(() => `count is ${store.count}; ${22} cx=${countAddX.value} computed=${countAdd1.value} +1=${store.count2 + 1}; a=${store.count}`)
            .click(() => {
                store.count++;
                store.count2++;
            }),
        dom.div.append(() => store.count),
        dom.div.append(() => store.count),
        dom.div.append(countAdd1),
        dom.div.text(() => `count=${store.count}`)
            .show(() => store.count % 2 === 1),
        dom.div.text(() => `count=${store.count}`)
            .style('color', () => `${store.count % 2 === 1 ? 'red' : 'green'}`)
            .style('cursor', () => `${store.count % 2 === 1 ? 'pointer' : 'text'}`)
    );
}

// window.dom = dom;

// const store = createStore({
//     count: 0,
// });

// const countAdd1 = computed(() => store.count + 1);
// const countAddX = computed(() => store.count + countAdd1.value + 1);

// store.count ++;

// console.log(countAdd1.value, countAddX.value);


function Counter2 () {
    const store = createStore({
        count: 0,
    });
    const increase = () => {
        store.count += 1;
    };
    const unsub = store.$sub('count', (v, pv) => {
        console.log(`Subscribe Count Change value=,`, v, `; prevValue=`, pv);
    });
    const countAdd1 = computed(() => store.count + 1);
    return dom.div.append(
        dom.input.type('number').bind(store.count),
        dom.span.text(() => `count=${store.count}; count+1=${countAdd1.value}`),
        dom.button.text('addCount').click(increase),
        dom.button.text('UnSubscribe').click(unsub)
    );
}

function Counter3 () {
    const count = ref(0);

    watch(count, v => {
        console.log(v);
    });

    const countAdd1 = computed(() => {
        return count.value + 1;
    });
    const countAdd2 = computed(() => {
        return countAdd1.value + 1;
    });
    const countSetDemo = computed(() => {
        return count.value + 1;
    }, (v) => {
        count.value = v - 1;
    });
    return dom.div.append(
        dom.input.type('number').bind(count),
        dom.span.text(() => `count=${count.value}; count+1=${countAdd1.value}; count+2=${countAdd2.value}`),
        dom.button.text('addCount').click(() => count.value ++),
        dom.button.text('setComputed').click(() => countSetDemo.value --),
    );

}


mount(Counter(), 'body');
mount(Counter2(), 'body');
mount(Counter3(), 'body');

function test () {
    return dom.div.style({
        color: 'red',
    }).text('test1').append(
        dom.div.text('test2').append(
            window.a = dom.div.text('test3').append(
                dom.div.text('test4')
            )
        )
    );
}

mount(test(), 'body');


function styleReactive () {

    const color = ref('red');

    return dom.div.text('style reactive').style({
        color: color,
        position: () => 'absolute',
    }).append(
        dom.input.bind(color),
        dom.input.bind(color)
    );
}

mount(styleReactive(), 'body');

function reactiveStyle () {

    const color = ref('red');
    const pos = ref('absolute');
    style({
        '.a': {
            position: () => pos.value + 'xx',
            color: color,
            fontSize: 1,
            '.b': {
                color: 'blue',
            },
            '.a-a': {
                color: color,
                fontSize: 2,
            },
        },
        '.b': {
            color: 'blue',
        }
    });
    window.color = color;
    window.pos = pos;
}
reactiveStyle();