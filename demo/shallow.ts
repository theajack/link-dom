/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-23 18:03:52
 * @Description: Coding something
 */

import { ref, dom, mount, ctrl, join } from 'link-dom';

const App = () => {

    const list = ref([] as {i: number}[], false);
    window._list = list;

    const setList = (update: any[] = list.value.slice()) => {
        list.value = update;
    };

    const selected = ref(2);
    const v = dom.div.style('borderBottom', '2px solid #000').children(
        dom.button.text('clear').click(() => {
            setList([]);
        }),
        dom.button.text('init').click(() => {
            console.time();
            const arr = [] as any[];
            for (let i = 0; i < 1000; i++) {
                arr.push(i);
            }
            // list.value = arr;
            setList(arr);
            // list.value = arr;
            console.timeEnd();
        }),
        dom.span.text(join`selected:${selected}`),
        ctrl.for(list, (item) => {
            // debugger;
            return dom.div.style('color', () => (selected.value % 2) === (item.i % 2) ? 'red' : 'green')
                .children(
                    ctrl.if(() => ((selected.value % 2) === (item.i % 2)), () => {
                        return dom.div.text(() => `selected: ${selected.value}`);
                    }).else(() => {
                        return dom.div.text(() => `unselected: ${selected.value}`);
                    }),
                    dom.span.text(() => `v: ${item.i}`).click(() => {
                        console.time('select');
                        selected.value = item.i;
                        console.timeEnd('select');
                    }),
                    // dom.button.text('×').click(() => {
                    //     console.time('remove');
                    //     list.value.splice(index.value, 1);
                    //     console.timeEnd('remove');
                    // })
                );
        }),
    );

    // store.value.count = 1;

    return v;
};
mount(App(), document.body);