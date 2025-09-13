/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-08 23:37:37
 * @Description: Coding something
 */
import { ssr, hydrate, isSSR } from 'link-dom-ssr';
import { ref, dom, mount, ctrl, watch, computed, reactive, join } from 'link-dom';

function CounterDeepRef (data: {a:number}) {
    // console.log('CounterDeepRef', data);
    // const store = ref({
    //     count: 0,
    //     count2: 3
    // });

    const arr: {i: string}[] = [];

    // for (let i = 0; i < 20000; i++) {
    //     arr.push(i);
    // }

    const list = ref({
        arr,
    });

    window._list = list;

    console.warn('isSSR', isSSR);

    // const countAdd1 = computed(() => store.value.count + 1);
    // const countAddX = computed(() => store.value.count + countAdd1.value + 1);
    // watch(countAdd1, (v: any) => {
    //     console.log('countAdd1', v, countAdd1.value);
    // });
    // watch(countAddX, (v: any) => {
    //     console.log('countAddX', v, countAdd1.value);
    // });

    // watch(() => store.value.count, (v, old) => {
    //     console.log('store.value.count', v, old);
    // });

    const mockAwait = () => {
        return new Promise<{a:{b: number}}>(resolve => {
            setTimeout(() => {
                resolve({ a: { b: 1 } });
            }, 1000);
        });
    };

    const selected = ref('');
    const v = dom.div.style('borderBottom', '2px solid #000').children(
        // data.a,
        // dom.button.text(() => `count is ${store.value.count}; ${22} cx=${countAddX.value} computed=${countAdd1.value} +1=${store.value.count2 + 1}; a=${store.value.count}`)
        //     .click(() => {
        //         store.value.count++;
        //         store.value.count2++;
        //         list.value.push(store.value.count);
        //     }),
        dom.button.text('clear').click(() => {
            list.value.arr = [];
        }),
        dom.button.text('init').click(() => {
            console.time();
            // const arr = [] as any[];
            for (let i = 0; i < 10; i++) {
                // arr.push(i);
                list.value.arr.push({ i: `item${i}` });
            }
            // list.value = arr;
            console.timeEnd();
        }),
        ctrl.await(mockAwait(), (data) => {
            return dom.div.text(`'data.a.b'=${data.a.b}`);
        }),
        dom.span.text(join`selected:${selected}`),
        // dom.button.text('clear selected').click(() => {
        //     selected = null;
        // }),
        // dom.button.class('a b').addClass('x')
        //     .attr('x', () => store.value.count)
        //     .text(() => `count is ${store.value.count}; ${22} +1=${store.value.count2 + 1}; a=${store.value.count}`)
        //     .click(() => {
        //         store.value.count++;
        //         store.value.count2++;
        //         list.value.push(store.value.count);
        //     }),
        // dom.div.append(() => store.value.count),
        // dom.div.append(() => store.value.count),
        // // dom.div.append(countAdd1),
        // dom.div.text(() => `count=${store.value.count}`)
        //     .show(() => store.value.count % 2 === 1),
        // dom.div.text(() => `count=${store.value.count}`)
        //     .style('color', () => `${store.value.count % 2 === 1 ? 'red' : 'green!important'}`)
        //     .style('cursor', () => `${store.value.count % 2 === 1 ? 'pointer' : 'text'}`),
        // ctrl.if(() => store.value.count % 2 === 1, () => {
        //     return [
        //         dom.div.text(() => `奇数 count=${store.value.count}`),
        //         dom.div.text(() => `奇数 count=${store.value.count}`)
        //     ];
        // }).else(() => {
        //     return dom.div.text(() => `偶数 count=${store.value.count}`);
        // }),
        // ctrl.for(list, (item) => {
        //     return dom.div.style('color', () => (selected.value === item.i ? 'red' : 'green'))
        //     // return dom.div
        //         .text(() => `${item.i}: ${item.i}`)
        //         .click(() => { selected.value = item.i; });
        // }),
        ctrl.for(list.value.arr, (item, index) => {
            // debugger;
            return dom.div.style('color', () => selected.value === item.i ? 'red' : 'green')
                .children(
                    ctrl.if(() => selected.value === item.i, () => {
                        return dom.div.text('selected');
                    }).else(() => {
                        return dom.div.text('unselected');
                    }),
                    dom.span.text(() => `${index.value}: ${item.i}`).click(() => {
                        console.time('select');
                        selected.value = item.i;
                        console.timeEnd('select');
                    }),
                    dom.button.text('×').click(() => {
                        console.time('remove');
                        list.value.arr.splice(index.value, 1);
                        console.timeEnd('remove');
                    })
                );
        }),
    );

    // store.value.count = 1;

    return v;
}


// console.log(CounterDeepRef.toString());


// const a = ssr(CounterDeepRef)({ a: 1 });
// const b = ssr(CounterDeepRef)({ a: 2 });
// console.log(a);
// document.body.innerHTML = a + b;

function replace () {
    console.time();
    const el = CounterDeepRef({ a: 1 });
    const frag = dom.frag.append(el);
    const mark = document.querySelector('[ssr-n="1"]');
    mark?.nextElementSibling?.replaceWith(frag.el.children[0]);
    console.timeEnd();
}

// replace();


mount(CounterDeepRef({ a: 1 }), document.body);
// hydrate(CounterDeepRef)({ a: 1 });
// hydrate(CounterDeepRef)({ a: 2 });


const id = 0;

const test = () => {

    const div = document.createElement('div');

    // id ++;
    for (let i = 0; i < 10000; i++) {
        const el = document.createElement('div');
        el.innerText = `child[${id}] ${i}`;
        for (let j = 0; j < 10; j++) {
            const el2 = document.createElement('div');
            el2.innerText = `---subchild[${id}] ${i} ${j}`;
            el.appendChild(el2);
        }
        div.appendChild(el);
    }

    return div;
};

// window.a = test;