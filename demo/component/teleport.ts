/*
 * @Author: tackchen
 * @Date: 2025-11-29 11:59:30
 * @Description: Coding something
 */
import { button, defineComponent, div, mount, ref, toggle } from 'link-dom';
import { Teleport } from 'link-dom';

const App = defineComponent(() => {
    return Teleport.to('body')('111');
});
const App2 = defineComponent(() => {

    const v = ref(false);
    const target = ref('body');

    const el = ref();

    return div(
        div.ref(el)('aaaaaaaa'),
        Teleport.to(el).disabled(v)(
            div('teleport1'),
            button.click(toggle(v))('toggle'),
            button.click(() => {
                target.value = target.value === 'body' ? '#jx-app' : 'body';
            })('switch to'),
        ),
        Teleport.to(target).disabled(v)(
            div('teleport2'),
            button.click(toggle(v))('toggle'),
            button.click(() => {
                target.value = target.value === 'body' ? '#jx-app' : 'body';
            })('switch to'),
        )
    );
});

mount([
    App2
], '#app');