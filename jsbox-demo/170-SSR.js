// @needUI=true
// @hideLog=true
// @dep=link-dom,link-dom-ssr
// @title=SSR
// @desc=Server-Side Rendering

import { ssr, hydrate } from 'link-dom-ssr';
import { ref, div, button, join, collectRef, mount, link, For, If, span } from 'link-dom';

function CommonComponent (data) {
    const list = ref(data);
    const selected = ref('label2');
    let id = 0;
    return div.style('borderBottom', '2px solid #000')(
        button('clear').click(() => {
            list.value = [];
        }),
        button('init').click(() => {
            console.time();
            for (let i = 0; i < 10000; i++) {
                list.value.push({ label: `item${i}` });
            }
            console.timeEnd();
        }),
        button('reset').click(() => {
            list.value = [ { label: 'test' }, { label: 'test2' } ];
        }),
        button('reverse').click(() => {
            list.value.reverse();
        }),
        button('sort').click(() => {
            list.value.sort((a, b) => a.label.localeCompare(b.label));
        }),
        button('add').click(() => {
            list.value.push({ label: `item${id++}` });
        }),
        span(join`selected:${selected}`),
        For(list, (item, index) => {
            return div.style('color', () => selected.value === item.label ? 'red' : 'green')(
                If(() => selected.value === item.label, () => span('selected'))
                    .else(() => span('unselected')),
                span(join`: index = ${index}; label = ${link(item.label)}`).click(() => {
                    selected.value = item.label;
                }),
                button('×').click(() => {
                    list.value.splice(index.value, 1);
                })
            );
        }),
    );
}
function SSRContainer () {
    const data = [ { label: 'label1' }, { label: 'label2' } ];
    const refs = collectRef('container');
    return div(
        div('First click "Start SSR Render" to render static html, Then Click "Start Hydrate" Button to hydrate.'),
        button('Start SSR Render').click(() => {
            const html = ssr(CommonComponent)(data);
            console.log('html', html);
            refs.container.html(html);
        }),
        button('Start Hydrate').click(() => {
            hydrate(CommonComponent)(data);
        }),
        div.style('fontWeight', 'bold')('SSR Container:'),
        div.ref(refs.container),
    );
}
mount(SSRContainer, '#app');