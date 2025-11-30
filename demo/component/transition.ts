/*
 * @Author: tackchen
 * @Date: 2025-11-29 17:39:28
 * @Description: Coding something
 */
import { a, button, defineComponent, div, Dynamic, Else, For, frag, If, LinkDomType, mount, ref, span, Switch, toggle, Transition } from 'link-dom';
import { createRouter, routerLink, routerView } from '../../packages/router/src';

const Child = defineComponent(() => {
    return a('child');
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
        Transition.appear(true)(
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

            // For(list, (item) => div(item)),

            // If(flag, div(11)).else(div(22)),


            // routerView(),

            Dynamic.is(() => flag.value ? div(113) : span(22))(),

            // Dynamic.is(() => flag.value ? frag().append(
            //     div(11),
            //     span(22)
            // ).el : 'span')('dynamic'),
        ),
    );
});


mount(App, 'body');