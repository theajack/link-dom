

// // @needUI=true
// // @hideLog=true
// // @dep=link-dom


import type { IProps } from 'link-dom';
import { a, Await, button, Case, collectRef, componentRef, Default, defineComponent, div, Elif, Else, For, ForRef, frag, If, input, join, mount, p, reactive, ref, slot, span, Switch, toggle } from 'link-dom';
import { createRouter, routerLink, routerView } from 'link-dom-router';

const Child1 = defineComponent(({ slots, props, inject }) => {
    console.log('Child2 slots', slots, props);
    const a1 = inject('child-inject');
    const a2 = inject('child2-inject');
    console.log('inject content:', a1, a2);
    return p(
        span('Child111'),
    );
}, {
    name: 'Child1'
});

const Child2 = defineComponent(({ slots, props, inject, provide }) => {
    console.log('Child2 slots', slots, props);
    const a1 = inject('child-inject');
    console.log('inject content:', a1);
    provide('child2-inject', 'Child2 inject content');
    // todo
    debugger;
    return p(
        span('Child2'),
        Child1,
    );
}, {
    name: 'Child2'
});

const Child3 = defineComponent(({
    slots, props, mounted, unmounted, beforeMount, beforeUnmount,
    beforeHydrate, hydrated
}) => {
    beforeMount(() => {
        console.warn('Child333 beforeMount');
    });
    beforeUnmount(() => {
        console.warn('Child333 beforeUnmount');
    });
    mounted(() => {
        console.warn('Child333 mounted');
    });
    unmounted(() => {
        console.warn('Child333 unmounted');
    });
    beforeHydrate(() => {
        console.warn('Child333 beforeHydrate');
    });
    hydrated(() => {
        console.warn('Child333 hydrated');
    });
    return p(
        span('Child3'),
        slots.default,
    );
}, {
    name: 'Child3'
});

const Child = defineComponent(({
    slots, props, mounted, unmounted, beforeMount, beforeUnmount, provide
}) => {
    provide('child-inject', 'Child inject test content');
    console.log('slots', slots, props);
    const a = ref();
    beforeMount(() => {
        console.warn('Child beforeMount', document.getElementById('child-div'), a.value, a.value.parent());
    });
    beforeUnmount(() => {
        console.warn('Child beforeUnmount', document.getElementById('child-div'), a.value, a.value.parent());
    });
    mounted(() => {
        console.warn('Child mounted', document.getElementById('child-div'), a.value, a.value.parent().el);
    });
    unmounted(() => {
        console.warn('Child unmounted', document.getElementById('child-div'), a.value, a.value.parent().el);
    });
    const list = ref([ 1, 2 ]);
    const list2 = ref([ 1, 2 ]);
    return p.ref(a)(
        If(() => props.data.x1 % 2 === 0, () => '% 2 === 0')
            .else(() => [
                span('11'),
                If(() => props.data.y1 % 2 === 0, () => 'xxx % 2 === 0')
                    .elif(() => props.data.y2 === 33, span('33'))
                    .else(() => 'xxx'),
                For(list2, (item) => {
                    return If(() => props.data.xxxxx % 2 === 0, () => '% 2 === 0')
                        .else(() => span(`if${item}`));
                }),
            ]),

        For(list, (item) => {
            return If(() => props.data.ewqewq % 2 === 0, () => '% 2 === 0')
                .else(() => [
                    For(list2, (item) => {
                        return If(() => props.data.xxxxx % 2 === 0, () => '% 2 === 0')
                            .else(() => span(`if${item}`));
                    }),
                ]);
        }),

        Child2,
        Child2(),
        If(() => props.data.x1 % 2 === 0, () => '% 2 === 0')
            .else(() => [
                Child2,
                span('11'),
                If(() => props.data.y1 % 2 === 0, () => 'xxx % 2 === 0')
                    .elif(() => props.data.y2 === 33, span('33'))
                    .else(() => Child2),
                For(list2, (item) => {
                    return If(() => props.data.xxxxx % 2 === 0, () => '% 2 === 0')
                        .else(() => span(`if${item}`));
                }),
            ]),
        div.id('child-div')(
            Switch(() => props.data.age)
                .case(31, () => Child3('s1 31'))
                .case(32, () => Child3('s1 32'))
                .default(() => Child3('s1 default1 > 32')),
            Switch(() => props.data.age)
                .case(31, Child3('s2 31'))
                .case(32, Child3('s2 32'))
                .default(Child3('s2 default2 > 32')),
            If(() => props.data.age === 31, () => Child3('s3 31'))
                .elif(() => props.data.age === 32, () => Child3('s3 32'))
                .else(() => Child3('s3 default > 32')),
            If(() => props.data.age === 31, Child3('s4 31'))
                .elif(() => props.data.age === 32, Child3('s4 32'))
                .else(Child3('s4 default > 32')),
            If(() => props.data.y1 % 2 === 0, () => 'xxx % 2 === 0')
                .elif(() => props.data.y2 === 33, span('33'))
                .else(() => Child2),
        ),

        For(list, (item) => {
            return If(() => props.data.ewqewq % 2 === 0, () => '% 2 === 0')
                .else(() => span('11'));
        }),
        button('add').click(() => list.value.push(11))
    );
}, {
    name: 'Child'
});

const App = () => {
    const data = reactive({
        name: 'tack',
        age: 31,
    });
    // const refs = componentRef('a');
    return div(
        Child.data(data),
        button.click(() => data.age ++)('++age')
    );
};

const App2 = () => {
    const bool = ref(false);

    const list = ref([ 1, 2, 3 ]);
    const id = 0;
    const mockFetch = () => {
        return new Promise<{id: number, name: string}>((resolve) => {
            setTimeout(() => {
                resolve({ id: 1, name: 'Tack' });
            }, 1000);
        });
    };
    const num = ref(0);
    return div(
        div(
            span(join`num = ${num}`),
            input.bind(num),
            button('Increase').click(() => { num.value++; }),
            button('toggle').click(toggle(bool))
        ),

        Child3(() => span(11)),

        If(() => num.value < 2, () => span('num < 2'))
            .elif(() => num.value < 5, () => span('num < 5'))
            .else(() => span('num >= 5')),

        // or
        span.if(() => num.value < 2)(span('num < 2')),
        span.elif(() => num.value < 5)('num < 5'),


        If(() => num.value < 2)(() => span('num < 2')),
        Elif(() => num.value < 5)(span('num < 5')),
        Else(span('num >= 5')),

        // Switch(num)(
        //     span.case([ 0, 1 ])('11num < 2'),
        //     span.case([ 2, 3, 4 ])('22num < 5'),
        //     span.case(5)('num = 5'),
        //     span.default()(join`num = ${num}`),
        // )

        Switch(num)(
            Case([ 0, 1 ])('11num < 2'),
            Case([ 2, 3, 4 ])('22num < 5'),
            Case(5)('num = 5'),
            Default(join`num = ${num}`),
        )
    );
    return div(

        // Child2.color('333').a('33')(),
        // If(bool, () => Child3('true'))
        //     .else(() => App()),
        // div(
        //     button.click(toggle(bool))('xxx')
        // )
        // For(list, (item) => {
        //     // return frag(
        //     //     Child3(`item${item}`),
        //     //     Child3(`item${item}`),
        //     // );
        //     return frag(
        //         Child3(`Aitem${item}`),
        //         Child3(`Bitem${item}`),
        //     );
        //     // return frag(
        //     //     div(`item${item}`),
        //     //     div(`item${item}`),
        //     // );
        // }),

        // Await(mockFetch(), data =>
        //     Child3(`id = ${data.id}; name = ${data.name}`)
        // ).default(Child3('loading')),
        // div(
        //     button.click(() => list.value.push(id++))('add'),
        //     button.click(() => list.value.splice(1, 0, id++))('insert'),
        //     button.click(() => list.value.splice(1, 1))('delete'),
        //     button.click(() => list.value = [])('clear')
        // )
    );
};

const root = mount(App, '#app');
console.log(root, root.component, root.children[0].children.map(item => item.type));
window.root = root;

// const root = mount(div(
//     Child2(33),
// ), '#app');

// const root = mount(App, '#app');
// console.log(root, root.component);

const router = createRouter({
    routes: [
        {
            path: '/',
            component: () => Child3('Page Index'),
        },
        {
            path: '/a',
            component: App,
        },
    ],
});

function RouterApp () {
    return [
        div.style({
            display: 'flex',
            gap: 10,
        })(
            routerLink('/'),
            routerLink('/a'),
        ),
        div('Sub Start'),
        routerView(),
        div('Sub End'),
    ];
}

// // const root = mount(RouterApp, '#app');
// // console.log(root, root.component);
// // window.root = root;
// // @needUI=true
// // @hideLog=true
// // @dep=link-dom,link-dom-ssr
// // @title=SSR
// // @desc=Server-Side Rendering


import { ssr, hydrate } from 'link-dom-ssr';
import { link } from 'link-dom';
import { hello } from 'demo-utils';

function CommonComponent (data) {
    const list = ref(data);
    const selected = ref('item2');
    let id = 0;
    id ++;
    return div.style('borderBottom', '2px solid #000')(
        button('clear').click(() => {
            list.value = [];
            // console.log(111);
        }),
        button('init').click(() => {
            console.time();
            for (let i = 0; i < 20; i++) {
                list.value.push({ label: `item${i}` });
            }
            console.timeEnd();
        }),
        button('reset1').click(() => {
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
                }),
                Child3(`child${item.label}`),
            );
        }),
    );
}
function SSRContainer () {
    const data = [ { label: 'label1' }, { label: 'label2' } ];
    const refs = collectRef('container');

    const startSSR = () => {
        const html = ssr(CommonComponent)(data);
        console.log('html', html);
        refs.container.html(html);
    };

    const startHydrate = () => {
        hydrate(CommonComponent)(data);
    };

    // setTimeout(() => {
    //     startSSR();
    //     setTimeout(() => {
    //         startHydrate();
    //     }, 10);
    // }, 10);

    return div(
        div('First click "Start SSR Render" to render static html, Then Click "Start Hydrate" Button to hydrate.'),
        button('Start SSR Render').click(startSSR),
        button('Start Hydrate').click(startHydrate),
        div.style('fontWeight', 'bold')('SSR Container:'),
        div.ref(refs.container),
    );
}
// mount(SSRContainer, '#app');

// mount(CommonComponent([ { label: 'label1' }, { label: 'label2' } ]), '#app');
