// @needUI=true
// @hideLog=true
// @dep=link-dom,link-dom-ssr
// @title=SSR
// @desc=Server-Side Rendering

import { ssr, hydrate } from 'link-dom-ssr';
import { ref, div, button, join, collectRef, mount, link, For, If, span, defineComponent, slot, br, toggle, input, img, a, tag, Else } from 'link-dom';
import { ut } from 'ui-test-lib';


const Child = defineComponent(({ slots, props, mounted, expose, emit }) => {
    console.log('slots', slots);

    mounted(() => {
        console.log('mounted');
    });
    expose.a = 1;
    return div(
        111
        // span('Child selected', props.selected),
        // span('Hello').click(() => {
        //     console.log(11);
        //     emit('aa', 'aa');
        // }),
        // slots.aa,
        // slots.default,
        // slots.cc,
    );
});

function CommonComponent (arg) {
    const list = ref(arg);
    const selected = ref('label2');
    let id = 0;
    id++;
    const a = ref();
    const flag = ref(true);
    const data = reactive({
        b1: true,
        b2: true,
        b3: true,
    });
    return div.style('borderBottom', '2px solid #000')(
        // div(
        //     Child.ref(a).selected(selected).on.aa((...args) => {
        //         console.log('from child', args);
        //     })(slot('cc', div('slotc'))).slot('aa', div('slot')).slot(div('default')),
        //     button('test expose').click(() => {
        //         console.log(a.value.expose.a, a.value);
        //     }),
        // ),
        // div('test component if'),
        div.id('child')(
            div.if(flag)(':Child if'),
            div.else(':Child else div'),
        ),
        button.id('toggle')('toggle flag').click(toggle(flag)),

        div(
            button.id('b1').click(toggle(link(data.b1)))('toggle b1'),
            button.id('b2').click(toggle(link(data.b2)))('toggle b2'),
            button.id('b3').click(toggle(link(data.b3)))('toggle b3'),
        ),
        div.id('result')(
            If(link(data.b1))(div('b1')),
            Else(
                If(link(data.b2))(
                    div('b2'),
                    div('b222')
                ),
                Else(
                    If(link(data.b3))(div('b3'))
                )
            )
        ),
        // br(),
        // button('clear').click(() => {
        //     list.value = [];
        // }),
        // button('init').click(() => {
        //     console.time();
        //     for (let i = 0; i < 100; i++) {
        //         list.value.push({ label: `item${i}` });
        //     }
        //     console.timeEnd();
        // }),
        // button('reset').click(() => {
        //     list.value = [ { label: 'test' }, { label: 'test2' } ];
        // }),
        // button('reverse').click(() => {
        //     list.value.reverse();
        // }),
        // button('sort').click(() => {
        //     list.value.sort((a, b) => a.label.localeCompare(b.label));
        // }),
        // button('add').click(() => {
        //     list.value.push({ label: `item${id++}` });
        // }),
        // span(join`selected:${selected}`),
        // For(list, (item, index) => {
        //     return div.style('color', () => selected.value === item.label ? 'red' : 'green')(
        //         If(() => selected.value === item.label, () => span('selected'))
        //             .else(() => span('unselected')),
        //         span(join`: index = ${index}; label = ${link(item.label)}`).click(() => {
        //             selected.value = item.label;
        //         }),
        //         button('×').click(() => {
        //             list.value.splice(index.value, 1);
        //         })
        //     );
        // }),
    );
}


function SSRContainer () {
    const data = [ { label: 'label1' }, { label: 'label2' } ];
    const refs = collectRef('container');
    return div(
        div('First click "Start SSR Render" to render static html, Then Click "Start Hydrate" Button to hydrate.'),
        button.id('ssr')('Start SSR Render').click(() => {
            const html = ssr(CommonComponent)(data);
            console.log('html', html);
            refs.container.html(html);
        }),
        button.id('hydrate')('Start Hydrate').click(() => {
            hydrate(CommonComponent)(data);
        }),
        div.style('fontWeight', 'bold')('SSR Container:'),
        div.ref(refs.container),
    );
}


// const html = ssr(() => {
//     return div(
//         tag('hr'),
//         br(),
//         input(),
//         img(),
//         a(),
//     );
// });
// console.log('html', html());
// app.innerHTML = html();

mount(SSRContainer, '#app');

// const data = [ { label: 'label1' }, { label: 'label2' } ];
// mount(CommonComponent(data), '#app');


ut.test(
    ut.click('#ssr'),
    ut.click('#hydrate'),
    ut.expect('b1'),
    ut.click('#b1'),
    ut.expect('b2b222'),
    ut.click('#b2'),
    ut.expect('b3'),
    ut.click('#b1'),
    ut.expect('b1'),
    ut.click('#b1', '#b3'),
    ut.expect(''),
    ut.click('#b3'),
    ut.expect('b3'),
    ut.expect('#child', ':Child if'),
    ut.click('#toggle'),
    ut.expect('#child', ':Child else div'),
);