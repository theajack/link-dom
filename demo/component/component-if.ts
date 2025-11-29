/*
 * @Author: tackchen
 * @Date: 2025-11-29 11:59:30
 * @Description: Coding something
 */
import { Await, button, defineComponent, div, If, mount, ref, toggle } from 'link-dom';
import { defineDirective } from 'link-dom';

const dire = defineDirective({
    created ({ dom, domList, binding, node }) {
        console.log('direc created', dom, domList, binding, node);
    },
    mounted ({ dom, domList, binding, node }) {
        console.log('direc mounted', dom, domList, binding, node);
    },
});

const App = () => {
    const flag = ref(true);
    return div(
        // Child.directive(dire(2)),
        Child.if(flag)(1111),
        div.else(111),
        div(
            button.click(toggle(flag))('toggle')
        )
    );
};


const Child = defineComponent(({ created, mounted, slots, inject }) => {
    created((ds) => {
        console.trace('child created', ds);
    });
    mounted((ds) => {
        console.log('child mounted', ds);
    });
    const a1 = inject('child-inject');
    console.log('inject content:', a1);
    return div(
        'child',
        slots.default
    );
    // return If(true, div(`hello1 ${111}`)).else(div(`hello2 ${222}`));
});

window.root = mount([
    App,
], '#app');