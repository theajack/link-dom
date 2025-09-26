/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-08 23:37:37
 * @Description: Coding something
 */
import { ssr, hydrate } from 'link-dom-ssr';
import { ref, dom, ctrl, join, collectRef, mount } from 'link-dom';

function CommonComponent (data: {label: string}[]) {
    const list = ref(data);
    const selected = ref('label2');
    let id = 0;
    const root = dom.div.style('borderBottom', '2px solid #000').children(
        dom.button.text('clear').click(() => {
            list.value = [];
        }),
        dom.button.text('init').click(() => {
            console.time();
            for (let i = 0; i < 100; i++) {
                list.value.push({ label: `item${i}` });
            }
            console.timeEnd();
        }),
        dom.button.text('reset').click(() => {
            list.value = [ { label: 'test' }, { label: 'test2' } ];
        }),
        dom.button.text('reverse').click(() => {
            list.value.reverse();
        }),
        dom.button.text('sort').click(() => {
            list.value.sort((a, b) => a.label.localeCompare(b.label));
        }),
        dom.button.text('add').click(() => {
            list.value.push({ label: `item${id++}` });
        }),
        dom.span.text(join`selected:${selected}`),
        ctrl.for(list, (item, index) => {
            // debugger;
            return dom.div.style('color', () => selected.value === item.label ? 'red' : 'green')
                .children(
                    ctrl.if(() => selected.value === item.label, () => dom.div.text('selected'))
                        .else(() => dom.div.text('unselected')),
                    dom.span.text(join`${index}: ${() => item.label}`),
                    dom.button.text('select').click(() => {
                        selected.value = item.label;
                    }),
                    dom.button.text('×').click(() => {
                        list.value.splice(index.value, 1);
                    })
                );
        }),
    );
    window.root = root;
    return root;
}


// function CommonComponent (param: {count: number}) {
//     const data = ref(param);
//     return dom.div.style('borderBottom', '2px solid #000').children(
//         dom.span.text(join`count:${() => data.value.count}`),
//         dom.button.text('+1').click(() => {
//             data.value.count ++;
//         })
//     );
// }
// mount(CommonComponent([ { label: 'label1' }, { label: 'label2' } ]), '#app');

// const arr = new Array(100).fill(0).map((_, index) => ({ label: `item${index}` }));
// debugger;
// mount(CommonComponent(arr), '#app');
function SSRDemo () {
    // const data = { count: 3 };

    const data = [ { label: 'label1' }, { label: 'label2' } ];

    const refs = collectRef('container');

    return dom.div.children(
        dom.button.text('Start SSR').click(() => {
            const html = ssr(CommonComponent)(data);
            console.log('html', html);
            refs.container.html(html);
        }),
        dom.button.text('Start Hydrate').click(() => {
            hydrate(CommonComponent)(data);
        }),
        dom.div.ref(refs.container),
    );
}

mount(SSRDemo, '#app');