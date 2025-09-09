/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-08 23:37:37
 * @Description: Coding something
 */
import { setRender, ssr, hydrate, isSSR } from 'link-dom-ssr';
import { ref, dom, mount, ctrl } from 'link-dom';

function CounterDeepRef (data: {a:1}) {
    const store = ref({
        count: 0,
        count2: 3
    });
    const list = ref([ 1, 2, 3 ]);


    console.warn('isSSR', isSSR);

    // const countAdd1 = computed(() => store.value.count + 1);
    // const countAddX = computed(() => store.value.count + countAdd1.value + 1);
    // countAdd1.sub((v: any) => {
    //     console.log(v, countAdd1.value);
    // });

    // watch(store.value.count, (v, old) => {
    //     console.log('store.value.count', v, old);
    // });
    const v = dom.div.style('borderBottom', '2px solid #000').append(
        // dom.button.text(() => `count is ${store.value.count}; ${22} cx=${countAddX.value} computed=${countAdd1.value} +1=${store.value.count2 + 1}; a=${store.value.count}`)
        //     .click(() => {
        //         store.value.count++;
        //         store.value.count2++;
        //     }),
        ctrl.for(list, (item, index) => {
            return dom.div.text(() => `${index.value}: ${item}`);
        }),
        dom.button.class('a b').addClass('x')
            .attr('x', () => store.value.count)
            .text(() => `count is ${store.value.count}; ${22} +1=${store.value.count2 + 1}; a=${store.value.count}`)
            .click(() => {
                store.value.count++;
                store.value.count2++;
                list.value.push(store.value.count);
            }),
        ctrl.if(() => store.value.count % 2 === 1, () => {
            return dom.div.text(() => `奇数 count=${store.value.count}`);
        }).else(() => {
            return dom.div.text(() => `偶数 count=${store.value.count}`);
        }),
        dom.div.append(() => store.value.count),
        dom.div.append(() => store.value.count),
        // dom.div.append(countAdd1),
        dom.div.text(() => `count=${store.value.count}`)
            .show(() => store.value.count % 2 === 1),
        dom.div.text(() => `count=${store.value.count}`)
            .style('color', () => `${store.value.count % 2 === 1 ? 'red' : 'green!important'}`)
            .style('cursor', () => `${store.value.count % 2 === 1 ? 'pointer' : 'text'}`)
    );

    store.value.count = 1;

    return v;
}

setRender('ssr');

console.log(CounterDeepRef.toString());


const a = ssr(CounterDeepRef)({ a: 1 });

console.log(a);

document.body.innerHTML = a;


setRender('web');
// mount(CounterDeepRef(), document.body);
hydrate(CounterDeepRef(), 'a1');

hydrate(CounterDeepRef());

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

window.a = test;