

// // @needUI=true
// // @hideLog=true
// // @dep=link-dom


// import type { IProps } from 'link-dom';
// import { a, button, collectRef, componentRef, defineComponent, div, For, If, mount, p, reactive, ref, slot, span, Switch } from 'link-dom';
// import { createRouter, routerLink, routerView } from 'link-dom-router';

// const Child2 = defineComponent(({ slots, props }) => {
//     console.log('slots', slots, props);
//     return p(
//         span('Child2'),
//     );
// });

// const Child3 = defineComponent(({ slots, props }) => {
//     return p(
//         span('Child3'),
//         slots.default,
//     );
// });

// const Child = defineComponent(({ slots, props, mounted }) => {
//     console.log('slots', slots, props);
//     mounted(() => {
//         console.log('mounted');
//     });
//     const list = ref([ 1, 2 ]);
//     const list2 = ref([ 1, 2 ]);
//     return p(
//         // If(() => props.data.x1 % 2 === 0, () => '% 2 === 0')
//         //     .else(() => [
//         //         span('11'),
//         //         If(() => props.data.y1 % 2 === 0, () => 'xxx % 2 === 0')
//         //             .elif(() => props.data.y2 === 33, span('33'))
//         //             .else(() => 'xxx'),
//         //         For(list2, (item) => {
//         //             return If(() => props.data.xxxxx % 2 === 0, () => '% 2 === 0')
//         //                 .else(() => span(`if${item}`));
//         //         }),
//         //     ]),

//         // For(list, (item) => {
//         //     return If(() => props.data.ewqewq % 2 === 0, () => '% 2 === 0')
//         //         .else(() => [
//         //             For(list2, (item) => {
//         //                 return If(() => props.data.xxxxx % 2 === 0, () => '% 2 === 0')
//         //                     .else(() => span(`if${item}`));
//         //             }),
//         //         ]);
//         // }),

//         // Child2,
//         // If(() => props.data.x1 % 2 === 0, () => '% 2 === 0')
//         //     .else(() => [
//         //         Child2,
//         //         span('11'),
//         //         If(() => props.data.y1 % 2 === 0, () => 'xxx % 2 === 0')
//         //             .elif(() => props.data.y2 === 33, span('33'))
//         //             .else(() => Child2),
//         //         For(list2, (item) => {
//         //             return If(() => props.data.xxxxx % 2 === 0, () => '% 2 === 0')
//         //                 .else(() => span(`if${item}`));
//         //         }),
//         //     ]),
//         div(
//             Switch(() => props.data.age)
//                 .case(31, () => Child3('s1 31'))
//                 .case(32, () => Child3('s1 32'))
//                 .default(() => Child3('s1 default1 > 32')),
//             Switch(() => props.data.age)
//                 .case(31, Child3('s2 31'))
//                 .case(32, Child3('s2 32'))
//                 .default(Child3('s2 default2 > 32')),
//             If(() => props.data.age === 31, () => Child3('s3 31'))
//                 .elif(() => props.data.age === 32, () => Child3('s3 32'))
//                 .else(() => Child3('s3 default > 32')),
//             If(() => props.data.age === 31, Child3('s4 31'))
//                 .elif(() => props.data.age === 32, Child3('s4 32'))
//                 .else(Child3('s4 default > 32')),
//             // If(() => props.data.y1 % 2 === 0, () => 'xxx % 2 === 0')
//             //     .elif(() => props.data.y2 === 33, span('33'))
//             //     .else(() => Child2),
//         ),

//         // For(list, (item) => {
//         //     return If(() => props.data.ewqewq % 2 === 0, () => '% 2 === 0')
//         //         .else(() => span('11'));
//         // }),
//         button('add').click(() => list.value.push(11))
//     );
// });

// const App = () => {
//     const data = reactive({
//         name: 'tack',
//         age: 31,
//     });
//     // const refs = componentRef('a');
//     return div(
//         Child.data(data),
//         button.click(() => data.age ++)('++age')
//     );
// };


// createRouter({
//     routes: [
//         {
//             path: '/',
//             component: () => div('Page Index'),
//         },
//         {
//             path: '/a',
//             component: App,
//         },
//     ],
// });

// function RouterApp () {
//     return [
//         div('Sub Start'),
//         routerView(),
//         div('Sub End'),
//     ];
// }

// const root = mount(RouterApp, '#app');
// console.log(root, root.component);

import { button, defineComponent, div, p, ref, span, Switch } from 'link-dom';


const Child3 = defineComponent(({ slots, props }) => {
    console.log('slots', slots, props);
    return p(
        span('Child3'),
        slots.default,
    );
});

const count = ref(31);

div(
    // Switch(() => count.value)
    //     .case(31, () => Child3.slot('s1 31'))
    //     .case(32, () => Child3.slot('s1 32'))
    //     .default(() => Child3.slot('s1 default1 > 32')),
    Switch(() => count.value)
        .case(31, Child3.slot('s2 31'))
        .default(Child3.slot('s2 default2 > 32')),
    button.click(() => count.value ++)('++count'),
).mount('#app');