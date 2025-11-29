/*
 * @Author: tackchen
 * @Date: 2025-11-29 20:39:00
 * @Description: Coding something
 */


// // @needUI=true
// // @hideLog=true
// // @dep=link-dom


import type { IProps } from 'link-dom';
import { a, Await, button, Case, collectRef, componentRef, Default, defineComponent, div, Elif, Else, For, ForRef, frag, If, input, join, mount, p, reactive, ref, slot, span, Switch, toggle } from 'link-dom';
import { createRouter, routerLink, routerView } from 'link-dom-router';


const Child2 = defineComponent(({ slots, props, inject }) => {
    const a1 = inject('child-inject');
    console.log('inject content:', a1);
    return p(
        span('Child2'),
    );
}, {
    name: 'Child2'
});


const Child = defineComponent(({
    slots, props, provide
}) => {
    provide('child-inject', 'Child inject test content');
    console.log('slots', slots, props);
    return p(
        Child2,
        Child2(),
    );
}, {
    name: 'Child'
});

const App = () => {
    // const refs = componentRef('a');
    return div(
        Child(),
    );
};


const root = mount(App, '#app');
console.log(root, root.component, root.children[0].children.map(item => item.type));
window.root = root;
