

// @needUI=true
// @hideLog=true
// @dep=link-dom


import type { IProps } from 'link-dom';
import { a, button, collectRef, componentRef, defineComponent, div, For, ForRef, frag, If, mount, p, reactive, ref, slot, span, Switch, toggle } from 'link-dom';
import { createRouter, routerLink, routerView } from 'link-dom-router';

const Child2 = defineComponent(({ slots, props }) => {
    console.log('slots', slots, props);
    return p(
        span('Child2'),
    );
});

const Child3 = defineComponent(({ slots, props, mounted, unmounted, beforeMount, beforeUnmount }) => {
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
    return p(
        span('Child3'),
        slots.default,
    );
});

const Child = defineComponent(({
    slots, props, mounted, unmounted, beforeMount, beforeUnmount
}) => {
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

        // Child2,
        // If(() => props.data.x1 % 2 === 0, () => '% 2 === 0')
        //     .else(() => [
        //         Child2,
        //         span('11'),
        //         If(() => props.data.y1 % 2 === 0, () => 'xxx % 2 === 0')
        //             .elif(() => props.data.y2 === 33, span('33'))
        //             .else(() => Child2),
        //         For(list2, (item) => {
        //             return If(() => props.data.xxxxx % 2 === 0, () => '% 2 === 0')
        //                 .else(() => span(`if${item}`));
        //         }),
        //     ]),
        div.id('child-div')(
            // Switch(() => props.data.age)
            //     .case(31, () => Child3('s1 31'))
            //     .case(32, () => Child3('s1 32'))
            //     .default(() => Child3('s1 default1 > 32')),
            // Switch(() => props.data.age)
            //     .case(31, Child3('s2 31'))
            //     .case(32, Child3('s2 32'))
            //     .default(Child3('s2 default2 > 32')),
            // If(() => props.data.age === 31, () => Child3('s3 31'))
            //     .elif(() => props.data.age === 32, () => Child3('s3 32'))
            //     .else(() => Child3('s3 default > 32')),
            // If(() => props.data.age === 31, Child3('s4 31'))
            //     .elif(() => props.data.age === 32, Child3('s4 32'))
            //     .else(Child3('s4 default > 32')),
            // If(() => props.data.y1 % 2 === 0, () => 'xxx % 2 === 0')
            //     .elif(() => props.data.y2 === 33, span('33'))
            //     .else(() => Child2),
        ),

        // For(list, (item) => {
        //     return If(() => props.data.ewqewq % 2 === 0, () => '% 2 === 0')
        //         .else(() => span('11'));
        // }),
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

const App2 = () => {
    const bool = ref(false);

    const list = ref([ 1, 2, 3 ]);
    let id = 0;

    return div(
        // If(bool, () => Child3('true'))
        //     .else(() => App()),
        // div(
        //     button.click(toggle(bool))('xxx')
        // )
        For(list, (item) => {
            // return frag(
            //     Child3(`item${item}`),
            //     Child3(`item${item}`),
            // );
            return frag(
                Child3(`Aitem${item}`),
                Child3(`Bitem${item}`),
            );
            // return frag(
            //     div(`item${item}`),
            //     div(`item${item}`),
            // );
        }),
        div(
            button.click(() => list.value.push(id++))('add'),
            button.click(() => list.value.splice(1, 1))('delete'),
            button.click(() => list.value = [])('clear')
        )
    );
};

const root = mount(App2, '#app');
console.log(root, root.component);
window.root = root;

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

// const root = mount(RouterApp, '#app');
// console.log(root, root.component);
// window.root = root;
