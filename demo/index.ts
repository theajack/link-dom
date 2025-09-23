/*
 * @Author: chenzhongsheng
 * @Date: 2024-08-12 17:51:34
 * @Description: Coding something
 */

import {
    dom, mount, computed, watch, ref, style, collectRef, join, ctrl, reactive, link,
    deepAssign, deepClone, raw
} from 'link-dom';
import { useRenderer, type CustomElement } from 'link-dom-render';
// import './ssr';
// import './router';
// import './comp-use';

// import './for-move';
// import './if-mem';
// import './if-mem';
import './shallow';
// import './for-if';


// const value = reactive({ value: 1 });


// const list = reactive([
//     { a: 1 },
//     { a: 2 },
//     { a: 3 }
// ]);


// list.forEach((item, index) => {
//     console.log(item.a, index);
//     watch(() => item.a === value.value, (newValue, oldValue) => {
//         console.log(`${item.a};${index}:observe`, newValue, oldValue);
//     });
// });

// window.list = list;


window.watch = watch;
window.ref = ref;
window.computed = computed;
window.link = link;
window.reactive = reactive;

// (() => {

//     // const a = ref({a: 1});

//     // const d = link(a.value.a);
//     // watch(link(a.value.a), (v, old) => {
//     //     console.log('d', v, old);
//     // });

//     // a.value.a += 2;

//     // console.log(a.value);

//     const a = ref({a: 1});
//     const b = computed(() => a.value.a + 1);

//     const d = link(a.value.a);
//     watch(link(a.value.a), (v, old) => {
//         console.log('d', v, old);
//     });
//     watch(() => a.value.a, (v, old) => {
//         console.log('a', v, old);
//     });
//     const c = link(a.value.a);
//     watch(c, (v, old) => {
//         console.log('c', v, old);
//     });
//     watch(b, (v, old) => {
//         console.log('b', v, old);
//     });

//     a.value.a += 2;
//     console.log(a.value, b.value, c.value, d.value);
// })();

window.dom = dom;

function Counter () {
    const store = reactive({
        count: 0,
        count2: 3
    });

    window.store = store;

    const countAdd1 = computed(() => store.count + 1);
    const countAddX = computed(() => store.count + countAdd1.value + 1);

    watch(countAdd1, (v, old) => {
        console.log('countAdd1', v, old);
    });
    watch(countAddX, (v, old) => {
        console.log('countAddX', v, old);
    });

    watch(() => store.count, (v, old) => {
        console.log('store.count', v, old);
    });

    return dom.div.append(
        dom.button.text(() => `c=${store.count}; c2=${store.count2} c1=${countAdd1.value}; cx=${countAddX.value}; c1+cx=${countAdd1.value}+${countAddX.value}=${countAdd1.value + countAddX.value};${22}`)
            .click(() => {
                store.count++;
                store.count2++;
            }),
        // dom.input.bind(store.count),
        dom.input.bind(link(store.count)),
        dom.input.bind(() => store.count),
        dom.div.append(() => store.count),
        dom.div.append(() => store.count),
        dom.div.append(countAdd1),
        dom.div.text(() => `11:count=${store.count}`)
            .show(() => store.count % 2 === 1),
        dom.div.text(join`22:count=${() => store.count}; c1=${link(countAdd1.value)}; c1=${countAdd1}`)
            .style('color', () => `${store.count % 2 === 1 ? 'red' : 'green'}`)
            .style('cursor', () => `${store.count % 2 === 1 ? 'pointer' : 'text'}`),
        dom.div.text(join`22:count=${link(store.count)}`)
            .style('color', () => `${store.count % 2 === 1 ? 'red' : 'green'}`)
            .style('cursor', () => `${store.count % 2 === 1 ? 'pointer' : 'text'}`)
    );

    // return dom.div;
}

// mount(Counter(), 'body');


// window.dom = dom;

// const store = createStore({
//     count: 0,
// });

// const countAdd1 = computed(() => store.count + 1);
// const countAddX = computed(() => store.count + countAdd1.value + 1);

// store.count ++;

// console.log(countAdd1.value, countAddX.value);


function Counter2 () {
    const store = ref({
        count: 0,
    });
    const increase = () => {
        store.value.count += 1;
    };
    const unsub = watch(link(store.value.count), (v, pv) => {
        console.log(`Subscribe Count Change value=,`, v, `; prevValue=`, pv);
    });
    const countAdd1 = computed(() => store.value.count + 1);
    return dom.div.append(
        dom.input.type('number').bind(() => store.value.count),
        dom.span.text(() => `count=${store.value.count}; count+1=${countAdd1.value}`),
        dom.button.text('addCount').click(increase),
        dom.button.text('UnSubscribe').click(unsub)
    );
}
// mount(Counter2(), 'body');

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
// mount(Counter3(), 'body');

// function test () {
//     return dom.div.style({
//         color: 'red',
//     }).text('test1').append(
//         dom.div.text('test2').append(
//             window.a = dom.div.text('test3').append(
//                 dom.div.text('test4')
//             )
//         )
//     );
// }
// mount(test(), 'body');


function styleReactive () {

    const color = ref('red');
    const size = ref(10);
    const store = reactive({
        color: 'red',
    });

    return dom.div.append(
        dom.div.text('style reactive').style({
            color: link(store.color),
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
            dom.input.bind(link(store.color)),
            dom.input.bind(color),
            dom.input.bind(size)
        )
    );
}
// mount(styleReactive(), 'body');

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


function testFor () {
    const list = ref([ {
        content: '2',
        isDone: false,
    }, {
        content: '1',
        isDone: false,
    }, {
        content: '3',
        isDone: false,
    } ]);

    window.list = list;

    const content = ref('2');
    window._content = content;

    const refs = collectRef('list');

    return dom.div.append(
        dom.div.append(
            dom.input.bind(content),
            dom.span.text(() => `size=${list.value.length}`),
            dom.button.text('add').click(() => {
                list.value.push({
                    content: content.value,
                    isDone: false,
                });
            }),
        ),
        dom.div.append(
            ctrl.scope(() => {
                let id = 0;
                window.refs = refs;
                return dom.button.text('test1').click(() => {
                    list.value.push({
                        content: '4',
                        isDone: false,
                    }, {
                        content: '5',
                        isDone: false,
                    });
                    test(refs.list.childrenLength, list.value.length);
                    const index = random(0, list.value.length - 1);
                    let newContent = `content-id: ${id ++}`;
                    list.value[index].content = newContent;
                    test(refs.list.child(index)?.child(0)?.text(), `${index}: ${(newContent)} ${(list.value[index].isDone)}`);

                    newContent += '!!';
                    list.value[index] = {
                        content: newContent,
                        isDone: true,
                    };
                    test(refs.list.child(index)?.child(0)?.text(), `${index}: ${(newContent)} ${(list.value[index].isDone)}`);
                });
            }),
            dom.button.text('test2').click(() => {
                list.value.pop();
                test(refs.list.childrenLength, list.value.length);
                list.value.shift();
                test(refs.list.childrenLength, list.value.length);
                test(refs.list.child(0)?.child(0)?.text(), `${0}: ${(list.value[0].content)} ${(list.value[0].isDone)}`);
                list.value.unshift({
                    content: 'a',
                    isDone: false,
                }, {
                    content: 'b',
                    isDone: false,
                }, {
                    content: 'c',
                    isDone: false,
                });
                test(refs.list.childrenLength, list.value.length);
                test(refs.list.child(0)?.child(0)?.text(), `${0}: a ${(false)}`);
            }),
            dom.button.text('test3').click(() => {
                list.value.fill({ content: 'new', isDone: true });
                test(refs.list.child(0)?.child(0)?.text(), `0: new true`);
            }),
            dom.button.text('test4').click(() => {
                list.value.reverse();
                test(refs.list.child(0)?.child(0)?.text(), `0: 3 false`);
                test(refs.list.child(2)?.child(0)?.text(), `2: 2 false`);
                list.value.sort((a, b) => a.content > b.content ? 1 : -1);
                test(refs.list.child(0)?.child(0)?.text(), `0: 1 false`);
                test(refs.list.child(2)?.child(0)?.text(), `2: 3 false`);
                const i0 = raw(list.value[0]);
                const i2 = list.value[2];
                list.value[0] = i2;
                list.value[2] = i0;
                test(refs.list.child(0)?.child(0)?.text(), `0: 3 false`);
                test(refs.list.child(2)?.child(0)?.text(), `2: 1 false`);
            }),
        ),
        dom.div.ref(refs.list).append(
            ctrl.for(list, (item, index) => [
                dom.div.append(
                    dom.span.style({
                        textDecoration: () => item.isDone ? 'line-through' : 'none',
                    }).click(() => {
                        item.isDone = !item.isDone;
                    }).text(() => `${index.value}: ${(item.content)} ${(item.isDone)}`),
                    dom.button.text(() => item.isDone ? 'undo' : 'done').click(() => {
                        item.isDone = !item.isDone;
                    })
                ),
                // testIf()
            ]),
            // ctrl.if(content, () => {
            //     return dom.div.text('1');
            // }).else(() => {
            //     return dom.div.text('2');
            // }),
            // ctrl.switch(content,  {
            //     '1': () => {
            //         return dom.div.text('1');
            //     },
            //     '2': () => {
            //         return dom.div.text('2');
            //     }
            // }),
            // ctrl.show(content, () => {
            //     return dom.div.text('show');
            // }),
        )
    );
}

function random (min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function test (a: any, b: any) {
    const bool = a === b;
    if (bool) {
        console.log(`%c 测试通过:${a}`, 'color:green');
    } else {
        console.error(`%c 测试失败:${a} !== ${b}`, 'color:red');
    }
}

// const list = ref([{
//     content: '1',
//     isDone: false,
// }, {
//     content: '2',
//     isDone: false,
// }, {
//     content: '2',
//     isDone: false,
// }]);

// watch(list, (v, old) => {
//     console.log('list', v, old);
// });

// window.list = list;


// mount(testFor(), 'body');

// for 同时两个不起作用
function testIfAndFor () {
    const show = ref(false);
    const num = ref(1);
    const list = ref([ 1, 2, 3 ]);

    let id = list.value.length;

    return dom.div.append(
        dom.div.append(
            dom.button.text('add').click(() => {
                list.value.push(++id);
            }),
            dom.button.text(() => `toggle show: ${show.value}`).click(() => {
                show.value = !show.value;
                num.value ++;
            })
        ),
        ctrl.if(() => num.value === 1, () => {
            return ctrl.for(list, (item, index) => {
                return dom.div.text(() => `if:${index.value}: ${item}`);
            });
        }).elif(() => num.value === 2, () => {
            return ctrl.for(list, (item, index) => {
                return dom.div.text(() => `else:${index.value}: ${item}`);
            });
        }).else(() => {
            return dom.div.text('else');
        }),
        ctrl.for(list, (item, index) => {
            return dom.div.text(() => `if:${index.value}: ${item}`);
        }),
        ctrl.for(list, (item, index) => {
            return dom.div.text(() => `if:${index.value}: ${item}`);
        }),
        ctrl.if(show, () => {
            return ctrl.for(list, (item, index) => {
                return dom.div.text(() => `if:${index.value}: ${item}`);
            });
        }).else(() => {
            return ctrl.for(list, (item, index) => {
                return dom.div.text(() => `else:${index.value}: ${item}`);
            });
        })

    );
}
// mount(testIfAndFor(), 'body');

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

    // watch(store.count, (v, old) => {
    //     console.log('store.count', v, old);
    // });
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
// mount(CounterDeep(), 'body');

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
        dom.div.append(
            dom.button.text('add').click(() => count.value ++ ),
            dom.button.text('sub').click(() => count.value -- ),
            dom.input.bind(count)
        ),
        dom.div.text('0000000'),
        ctrl.if(() => count.value < 2, () => {
            return dom.div.text('<2');
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

// mount(testIf(), 'body');


function testSwitch () {
    const value = ref(0);

    return [
        dom.button.text('add').click(() => {
            value.value ++;
        }),
        dom.div.append(1, 2, value),
        value,
        () => value.value,
        ctrl.show(() => value.value % 2 === 0, () => [
            '!1!',
            value,
            dom.span.text(join`value1:${value}`),
            dom.div.text(join`value2:${value}`),
        ]),
        ctrl.switch(value)
            .case([ 1, 2, 3 ], () => {
                return dom.div.text('123');
            })
            .case(3, () => {
                return dom.div.text('3');
            })
            .case(4, () => {
                return dom.div.text('4');
            })
            .default(() => {
                return dom.div.text('default');
            })
    ];
}

// mount(testSwitch(), 'body');


function testRender () {
    const root = useRenderer({
        render (node: CustomElement) {
            const prefix = new Array(node.deep).fill('  ').join('');
            const text = `${node.innerText}`;
            console.log(`${prefix}${node.tagName || 'text'}: ${text.trim()}`);
        }
    });

    const v = ref(0);
    const v2 = computed(() => v.value * 2);
    mount(
        dom.div.append(
            join`value=${v}`,
            dom.div.text(join`value * 2=${v2}`),
        ),
        root,
    );

    function render () {
        // v.value ++;
        console.clear();
        root.render();
        // setTimeout(() => {requestAnimationFrame(render);}, 1000);
    }
    render();
    watch(v, render);
    const btn = document.createElement('button');
    btn.innerText = 'add';
    document.body.appendChild(btn);

    btn.onclick = () => v.value ++;
}

// testRender();

// store.count;
// ref(store.count1);
// bind(1);


function parseFuzzyRouteUrl (path: string): null|IFuzzyInfo {

    if (!path.includes('/:')) return null;
    const arr = path.split('/');
    const paramMap: Record<string, string> = {};
    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        if (item[0] !== ':') continue;
        const res = item.match(/^:(.*?)(\((.*?)\))?$/i);
        // console.log('res1=', res)
        if (!res) throw new Error(`错误的路由表达式: ${path}`);
        const name = res[1];
        const reg = res[3] || '(.*?)';
        paramMap[i] = name;
        arr[i] = reg;
    }
    return {
        reg: new RegExp(arr.join('/')),
        paramMap,
    };
}

window.parseFuzzyRouteUrl = parseFuzzyRouteUrl;