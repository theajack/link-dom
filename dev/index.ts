/*
 * @Author: chenzhongsheng
 * @Date: 2024-08-12 17:51:34
 * @Description: Coding something
 */

import {createStore, dom, mount, computed, watch, ref, style, collectRef, join, ctrl, reactive} from '../src';
window.dom = dom;
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
        dom.div.append(
            dom.span.text(join`[use join]count=${count}; count+1=${countAdd1}; count+2=${countAdd2}`),
        ),
        dom.span.text(() => `count=${count.value}; count+1=${countAdd1.value}; count+2=${countAdd2.value}`),
        dom.button.text('addCount').click(() => count.value ++),
        dom.button.text('setComputed').click(() => countSetDemo.value --),
    );

}

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


function styleReactive () {

    const color = ref('red');
    const size = ref(10);

    return dom.div.append(
        dom.div.text('style reactive').style({
            color: color,
            fontSize: () => `${size.value}px`,
            position: () => 'relative',
        }),
        dom.div.text('[use join]style reactive').style({
            color: color,
            fontSize: join`${size}px`,
            position: () => 'relative',
        }),
        dom.div.text('[use join2]style reactive').style({
            color: color,
            fontSize: join`${() => size.value}px`,
            position: () => 'relative',
        }).append(
            dom.input.bind(color),
            dom.input.bind(color),
            dom.input.bind(size)
        )
    );
}

function reactiveStyle () {
    const color = ref('red');
    const pos = ref('absolute');
    style({
        '.a': {
            // position: () => pos.value + 'xx',
            position: join`${pos}xx`,
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


function testList () {
    const list = ref([{
        content: '1',
        isDone: false,
    }, {
        content: '2',
        isDone: false,
    }]);

    window._list = list;

    const content = ref('2');
    window._content = content;
    

    // return dom.div.append(
    //     dom.div.append(
    //         dom.input.bind(content),
    //         dom.button.text('add').click(() => {
    //             list.value.push({
    //                 content: content.value,
    //                 isDone: false,
    //             });
    //         }),
    //     ),
    //     dom.div.append(
    //         ctrl.for(list, (item, index) => [
    //             dom.div.text(`${index}: ${item.content} ${item.isDone}`),
    //         ]),
    //         ctrl.if(content, () => {
    //             return dom.div.text('1');
    //         }).else(() => {
    //             return dom.div.text('2');
    //         }),
    //         // ctrl.switch(content,  {
    //         //     '1': () => {
    //         //         return dom.div.text('1');
    //         //     },
    //         //     '2': () => {
    //         //         return dom.div.text('2');
    //         //     }
    //         // }),
    //         // ctrl.show(content, () => {
    //         //     return dom.div.text('show');
    //         // }),
    //     )
    // );
}

// mount(Counter(), 'body');
// mount(Counter2(), 'body');
// mount(Counter3(), 'body');
// mount(test(), 'body');
// mount(styleReactive(), 'body');

// reactiveStyle();


// mount(Counter(), 'body');


function CounterDeep () {
    const store = reactive({
        count: 0,
        count2: 3
    });
    const countAdd1 = computed(() => store.count + 1);
    // const countAddX = computed(() => store.count + countAdd1.value + 1);
    countAdd1.sub((v: any) => {
        console.log(v, countAdd1.value);
    });

    watch(store.count, (v, old) => {
        console.log('store.count', v, old);
    });
    return dom.div.append(
        dom.button.text(() => `count is ${store.count}; ${22} computed=${countAdd1.value} +1=${store.count2 + 1}; a=${store.count}`)
            .click(() => {
                store.count++;
                store.count2++;
            }),
        // dom.button.text(() => `count is ${store.count}; ${22} cx=${countAddX.value} computed=${countAdd1.value} +1=${store.count2 + 1}; a=${store.count}`)
        //     .click(() => {
        //         store.count++;
        //         store.count2++;
        //     }),
        dom.div.append(() => store.count),
        dom.div.append(() => store.count),
        // dom.div.append(countAdd1),
        dom.div.text(() => `count=${store.count}`)
            .show(() => store.count % 2 === 1),
        dom.div.text(() => `count=${store.count}`)
            .style('color', () => `${store.count % 2 === 1 ? 'red' : 'green'}`)
            .style('cursor', () => `${store.count % 2 === 1 ? 'pointer' : 'text'}`)
    );
}
mount(CounterDeep(), 'body');

function CounterDeepRef () {
    const store = ref({
        count: 0,
        count2: 3
    });
    // const countAdd1 = computed(() => store.value.count + 1);
    // const countAddX = computed(() => store.value.count + countAdd1.value + 1);
    // countAdd1.sub((v: any) => {
    //     console.log(v, countAdd1.value);
    // });

    // watch(store.value.count, (v, old) => {
    //     console.log('store.value.count', v, old);
    // });
    return dom.div.append(
        // dom.button.text(() => `count is ${store.value.count}; ${22} cx=${countAddX.value} computed=${countAdd1.value} +1=${store.value.count2 + 1}; a=${store.value.count}`)
        //     .click(() => {
        //         store.value.count++;
        //         store.value.count2++;
        //     }),
        dom.button.text(() => `count is ${store.value.count}; ${22} +1=${store.value.count2 + 1}; a=${store.value.count}`)
            .click(() => {
                store.value.count++;
                store.value.count2++;
            }),
        dom.div.append(() => store.value.count),
        dom.div.append(() => store.value.count),
        // dom.div.append(countAdd1),
        dom.div.text(() => `count=${store.value.count}`)
            .show(() => store.value.count % 2 === 1),
        dom.div.text(() => `count=${store.value.count}`)
            .style('color', () => `${store.value.count % 2 === 1 ? 'red' : 'green'}`)
            .style('cursor', () => `${store.value.count % 2 === 1 ? 'pointer' : 'text'}`)
    );
}
// mount(CounterDeepRef(), 'body');

function testIf () {

    const count = ref(2);
    window._count = count;

    return dom.div.append(
        dom.div.text('0000000'),
        ctrl.if(() => count.value < 2, () => {
            return dom.div.text('<3');
        }).elif(() => count.value < 8, () => {
            return dom.div.append(
                dom.div.text('444444'),
                ctrl.if(() => count.value < 4, () => {
                    return dom.div.text('<4');
                }).elif(() => count.value < 6, () => {
                    return dom.div.text(join`<6:${count}`);
                }).else(() => {
                    return [
                        dom.div.text(join`<8:${count}`),
                        dom.div.text(count)
                    ];
                }),
                dom.div.text('8888888'),
            );
        }).else(() => {
            return dom.div.append(
                dom.div.text('10 10'),
                ctrl.if(() => count.value < 10, () => {
                    return dom.div.text('<10');
                }).elif(() => count.value < 12, () => {
                    return dom.div.text(join`<12:${count}`);
                }).else(() => {
                    return dom.div.append(
                        dom.div.text('14 14'),
                        ctrl.if(() => count.value < 14, () => {
                            return dom.div.text('<14');
                        }).elif(() => count.value < 16, () => {
                            return dom.div.text(join`<16:${count}`);
                        }).else(() => {
                            return [
                                dom.div.text(join`>16:${count}`),
                                dom.div.text(count)
                            ];
                        }),
                        dom.div.text('16 16'),
                    );
                }),
                dom.div.text('max1'),
            );
        }),
        dom.div.text('max2'),
    );
}

// mount(testList(), 'body');
// mount(testIf(), 'body');
