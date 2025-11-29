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
    return div(
        Child.directive(dire(2)),
        div(111)
    );
};


const Child = defineComponent(({ created, mounted }) => {
    created((ds) => {
        console.trace('child created', ds);
    });
    mounted((ds) => {
        console.log('child mounted', ds);
    });
    return If(true, div(`hello1 ${111}`)).else(div(`hello2 ${222}`));
});

mount([
    App,
], '#app');