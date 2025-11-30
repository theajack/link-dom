/*
 * @Author: tackchen
 * @Date: 2025-11-29 17:39:28
 * @Description: Coding something
 */
import { a, Await, button, defineComponent, div, Dynamic, Else, For, frag, getContext, If, LinkDomType, mount, ref, slot, span, Suspense, Switch, toggle, Transition } from 'link-dom';
import { createRouter, routerLink, routerView } from '../../packages/router/src';

const mockFetch = (time = 1000) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(222);
        }, time);
    });
};

const AsyncComp = defineComponent(async () => {
    const data = await mockFetch(1000);
    return div(`hello1 ${data}`,
        Suspense(Async2Comp()).slot('fallback', () => div('loading2')),
    );
});
const Async2Comp = defineComponent(async () => {
    const data = await mockFetch(2000);
    return div(`hello2 ${data}`);
});


const Child = defineComponent(({ slots }) => {
    return a('child', slots.default);
});


createRouter({
    routes: [ {
        path: '/',
        component: () => div('index'),
    }, {
        path: '/a',
        component: () => div('a'),
    }  ]
});

const App = defineComponent(() => {
    const { props } = getContext();

    const flag = ref(true);
    const list = ref([ 1, 2 ]);
    return div(
        routerLink('/'),
        routerLink('/a'),
        div(
            button.click(toggle(flag))('toggle')
        ),
        div(
            button.click(() => {list.value.push(list.value.length + 1);})('add'),
            button.click(() => list.value.splice(1, 1))('remove'),
        ),

        div(
            If(flag)(
                Child(222),
                div(222),
            ),
            Else(Child),
        ),

        Transition.appear(false)(
            // div.if(flag)(1111),
            // Child.if(flag)(222),
            // div.else(333),
            // Switch(flag)(
            //     div.case(true)(333),
            //     div.case(false)(444),
            // ),
            // If(flag)(111),
            // Else(222),
            // For(list, (item) => If(flag)(div(item))),

            For(list, (item) => div(item)),

            // If(flag, div(11)).else(div(22)),

            // If(flag)(div(11)),
            // Else(div(22)),

            // div.if(flag)(1111),
            // Child.else(span(22)),

            // Child.if(flag)(222),

            // routerView(),

            // Dynamic.is(() => flag.value ? div(113) : span(22))(),

            // Dynamic.is(() => flag.value ? frag().append(
            //     div(11),
            //     span(22)
            // ).el : 'span')('dynamic'),

            // Await(mockFetch(), data => div(data)).default(div('loading')),

            // Suspense.resolve(() => {
            //     console.log('done');
            // }).slot('fallback', () => div('loading1'))(
            //     // AsyncComp(),
            //     Async2Comp(),
            //     div(111)
            // )
        ),
    );
});


mount(App.prop('a', 1), 'body');