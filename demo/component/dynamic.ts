/*
 * @Author: tackchen
 * @Date: 2025-11-29 11:59:30
 * @Description: Coding something
 */
import { button, defineComponent, div, mount, ref, toggle } from 'link-dom';
import { Dynamic } from 'link-dom';


const Child1 = defineComponent(({ slots, props, inject }) => {
    console.log('Child2 slots', slots, props);
    const a1 = inject('child-inject');
    const a2 = inject('child2-inject');
    console.log('inject content:', a1, a2);
    return div(
        'Child1',
        slots.default,
    );
}, {
    name: 'Child1'
});
const Child2 = defineComponent(({ slots, props, inject }) => {
    console.log('Child2 slots', slots, props);
    const a1 = inject('child-inject');
    const a2 = inject('child2-inject');
    console.log('inject content:', a1, a2);
    return div(
        'Child2',
        slots.default,
    );
}, {
    name: 'Child2'
});

const App = defineComponent(() => {

    const flag = ref(true);
    const dynamicTag = () => flag.value ? 'a' : 'div';

    return div(
        Dynamic.is('div')('1111'),
        Dynamic.is(dynamicTag)('2222'),
        Dynamic.is(() => flag.value ? Child1 : Child2)('222233333'),
        div(
            button.click(toggle(flag))('toggle'),
        )
    );
});

mount([
    App,
], '#app');