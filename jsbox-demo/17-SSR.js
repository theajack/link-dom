/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-26 17:17:20
 * @Description: Coding something
 */

// @needUI=true
// @hideLog=true
// @dep=link-dom,link-dom-ssr
// @title=SSR

import { ssr, hydrate } from 'link-dom-ssr';
import { ref, dom, ctrl, join, collectRef, mount, link } from 'link-dom';

function CommonComponent (data) {
    const list = ref(data);
    const selected = ref('label2');
    let id = 0;
    return dom.div.style('borderBottom', '2px solid #000').children(
        dom.button.text('clear').click(() => {
            list.value = [];
        }),
        dom.button.text('init').click(() => {
            console.time();
            for (let i = 0; i < 10000; i++) {
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
            return dom.div.style('color', () => selected.value === item.label ? 'red' : 'green')
                .children(
                    ctrl.if(() => selected.value === item.label, () => dom.span.text('selected'))
                        .else(() => dom.span.text('unselected')),
                    dom.span.text(join`: index = ${index}; label = ${link(item.label)}`).click(() => {
                        selected.value = item.label;
                    }),
                    dom.button.text('×').click(() => {
                        list.value.splice(index.value, 1);
                    })
                );
        }),
    );
}

function SSRContainer () {
    const data = [ { label: 'label1' }, { label: 'label2' } ];
    const refs = collectRef('container');
    return dom.div.children(
        dom.button.text('Start SSR Render').click(() => {
            const html = ssr(CommonComponent)(data);
            console.log('html', html);
            refs.container.html(html);
        }),
        dom.button.text('Start Hydrate').click(() => {
            hydrate(CommonComponent)(data);
        }),
        dom.div.style('fontWeight', 'bold').text('SSR Container:'),
        dom.div.ref(refs.container),
    );
}
mount(SSRContainer, '#jx-app');