
// @needUI=true
// @hideLog=true
// @dep=link-dom
// @desc=Reactive Data

import { div, input, mount, join, reactive, button, link } from 'link-dom';
function Reactive () {
    const data = reactive({
        name: 'bob',
        age: 11
    });
    return div(
        div(join`Hello World! ${() => data.name}`),
        // Or use link
        div(join`Hello World! ${link(data.name)}`),
        input.bind(link(data.name)),
        div(join`age: ${link(data.age)}`),
        input.bind(link(data.age)),
        button('Increase Age').click(() => data.age++ )
    );
}
mount(Reactive, '#jx-app');