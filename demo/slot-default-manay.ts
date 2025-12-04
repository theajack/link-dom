/*
 * @Author: tackchen
 * @Date: 2025-11-28 22:07:16
 * @Description: Coding something
 */


// // @needUI=true
// // @hideLog=true
// // @dep=link-dom


import type { IProps } from 'link-dom';
import { a, Await, button, Case, collectRef, componentRef, Default, defineComponent, div, Elif, Else, For, ForRef, frag, If, input, join, mount, p, reactive, ref, slot, span, Switch, toggle } from 'link-dom';
import { defineRouter, routerLink, routerView } from 'link-dom-router';

const Child = defineComponent(({ slots }) => {
    return p(
        span('Child111'),
        slots.default,
    );
}, {
    name: 'Child1'
});

const Child2 = defineComponent(({ slots }) => {
    console.log('Child2');
    return p('Child2', slots.default);
});

const App = () => {
    const data = reactive({
        name: 'tack',
        age: 31,
    });
    // const refs = componentRef('a');
    return div(
        Child(
            Child2('aa111'),
            Child2('aa222'),
        ),
    );
};


const root = mount(App, '#app');
// console.log(root, root.component, root.children[0].children.map(item => item.type));
// window.root = root;
