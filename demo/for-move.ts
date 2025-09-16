/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-12 11:18:44
 * @Description: Coding something
 */
import { ctrl, dom, mount, ref, watch } from 'link-dom';

function ForMoveTest () {
    const arr = ref([
        { name: 'a', age: 2 },
        { name: 'b', age: 3 },
        { name: 'c', age: 1 },
        { name: 'd', age: 4 },
    ]);

    const selected = ref('');

    window._selected = selected;
    window.arr = arr;

    watch(selected, (v1, v2) => {
        console.log('selected change', v1, v2);
    });

    let id = 0;
    return dom.div.children(
        dom.div.children(
            dom.button.text('add').click(() => {
                arr.value.push({ name: `name${id++}`, age: Math.round(Math.random() * 10) });
            }),
            dom.button.text('sort').click(() => {
                arr.value.sort((a, b) => a.age - b.age);
            }),
            dom.button.text('reverse').click(() => {
                arr.value.reverse();
            }),
        ),
        ctrl.for(arr, (item, index) => {
            return dom.div.style('color', () => selected.value === item.name ? 'red' : 'green')
                .children(
                    ctrl.if(() => selected.value === item.name, () => {
                        return dom.div.text('selected');
                    }).else(() => {
                        return dom.div.text('unselected');
                    }),
                    dom.text(() => `index: ${index.value}; `),
                    dom.text(() => `name: ${item.name}; `),
                    dom.text(() => `age: ${item.age}; `),
                ).click(() => {selected.value = item.name;});
        }),
    );


}

// mount(ForMoveTest(), 'body');


function ForRefTest () {
    const arr = ref([ 4, 1, 3, 2 ]);

    const selected = ref(-1);

    window._selected = selected;
    window.arr = arr;

    watch(selected, (v1, v2) => {
        console.log('selected change', v1, v2);
    });

    let id = 0;
    return dom.div.children(
        dom.div.children(
            dom.button.text('add').click(() => {
                arr.value.push(id ++);
            }),
            dom.button.text('sort').click(() => {
                arr.value.sort((a, b) => a - b);
            }),
            dom.button.text('reverse').click(() => {
                arr.value.reverse();
            }),
        ),
        ctrl.forRef(arr, (item, index) => {
            return dom.div.style('color', () => selected.value === item.value ? 'red' : 'green')
                .children(
                    ctrl.if(() => selected.value === item.value, () => {
                        return dom.div.text('selected');
                    }).else(() => {
                        return dom.div.text('unselected');
                    }),
                    dom.text(() => `index: ${index.value}; `),
                    dom.text(() => `name: ${item.value}; `),
                ).click(() => {
                    item.value ++;
                    selected.value = item.value;
                });
        }),
    );


}

mount(ForRefTest(), 'body');