// import { button, classPrefix, ForStatic, If, join, option, script, select, span, Switch } from 'link-dom';
// import { div, mount, ref, Show, style, toggle } from 'link-dom';

// const feat = ref('111');
// const list = [
//     '111',
//     '222',
//     '333',
// ];
// const page = '111';

// const value = ref(true);

// const color = ref('blue');
// window.color = color;

// mount(
//     style.text(`
//         #test { color: red; }
//     `).id('aa'), 'head'
// );
// mount(
//     script(`
//         console.log('xx')
//     `).id('aa'), 'head'
// );

// console.log(style(''));

// const showPanel = ref(false);

// mount(
//     div.mounted(() => {
//         console.log(11);
//     }).on.self('click', () => {
//         console.log(222);
//     })(
//         div(join`value:${feat}; bool=${value}`),
//         button('test').click(toggle(value)),
//         select.bind(feat).bind(feat)(
//             ForStatic(list, (item) => option(item))
//         ).on('change', () => {
//             console.log('111');
//         }),
//         Show(value, () => span('11')),
//         div.style({
//             color: 'red',
//             ':hover': {
//                 color: join`${color}!important`,
//             }
//         }).text('11122').click.once(() => {
//             console.log('aa');
//         }),
//         div.id('test')('test'),
//         div.style({
//             'display': 'flex',
//             gap: 20,
//         })(
//             div('111'),
//             div('222')
//         ),

//         div.class(`btn`).style({
//             backgroundColor: () => showPanel.value ? '#266ddedd' : '#f44',
//         }).click(() => showPanel.value = !showPanel.value)(() => showPanel.value ? '+' : '×'),

//         classPrefix('aa')(
//             div(
//                 div.class('')('2222'),
//                 classPrefix('-bb')(
//                     div.class('-33')('33333')
//                 ),
//             )
//         ),
//         // div.if(),
//         // div.else(),

//         // Switch(v)(
//         //     div.case(1)
//         // )

//     ),
//     'body'
// );


// console.log(div.mounted(() => {
//     console.log(11);
// }).on.self);

// window.feat = feat;
// // let prefix: any;


// // div.prefix().class('');


// @needUI=true
// @hideLog=true
// @dep=link-dom


import type { IProps } from 'link-dom';
import { a, button, collectRef, componentRef, defineComponent, div, For, If, mount, p, reactive, ref, slot, span } from 'link-dom';
import { createRouter, routerLink, routerView } from 'link-dom-router';

const Child2 = defineComponent(({ slots, props }) => {
    console.log('slots', slots, props);
    return p(
        span('Child2'),
    );
});

const Child = defineComponent(({ slots, props, mounted }) => {
    console.log('slots', slots, props);
    mounted(() => {
        console.log('mounted');
    });
    const list = ref([ 1, 2 ]);
    const list2 = ref([ 1, 2 ]);
    return p(
        Child2,
        // If(() => props.data.x1 % 2 === 0, () => '% 2 === 0')
        //     .else(() => [
        //         span('11'),
        //         If(() => props.data.y1 % 2 === 0, () => 'xxx % 2 === 0')
        //             .elif(() => props.data.y2 === 33, span('33'))
        //             .else(() => 'xxx'),
        //         For(list2, (item) => {
        //             return If(() => props.data.xxxxx % 2 === 0, () => '% 2 === 0')
        //                 .else(() => span(`if${item}`));
        //         }),
        //     ]),

        // For(list, (item) => {
        //     return If(() => props.data.ewqewq % 2 === 0, () => '% 2 === 0')
        //         .else(() => [
        //             For(list2, (item) => {
        //                 return If(() => props.data.xxxxx % 2 === 0, () => '% 2 === 0')
        //                     .else(() => span(`if${item}`));
        //             }),
        //         ]);
        // }),

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

        For(list, (item) => {
            return If(() => props.data.ewqewq % 2 === 0, () => '% 2 === 0')
                .else(() => span('11'));
        }),
        button('add').click(() => list.value.push(11))
    );
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


createRouter({
    routes: [
        {
            path: '/',
            component: () => div('Page Index'),
        },
        {
            path: '/a',
            component: App,
        },
    ],
});

function RouterApp () {
    return [
        div('Sub Start'),
        routerView(),
        div('Sub End'),
    ];
}

const root = mount(RouterApp, '#app');
console.log(root, root.component);