/*
 * @Author: tackchen
 * @Date: 2025-11-29 17:39:28
 * @Description: Coding something
 */
import { button, defineComponent, div, Dynamic, Else, For, If, LinkDomType, mount, ref, Switch, toggle, Transition } from 'link-dom';


const App = defineComponent(() => {
    const flag = ref(false);
    const list = ref([ 1, 2 ]);
    return div(
        div(
            button.click(toggle(flag))('toggle')
        ),
        div(
            button.click(() => {
                list.value.push(list.value.length + 1);
            })('add')
        ),
        For(list, (item) => If(flag)(() => div(item))),
    );
});


mount(App, 'body');