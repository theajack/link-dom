// @needUI=true
// @hideLog=true
// @dep=link-dom
// @desc=One-way data flow
import { button, div, flow, join, link, mount, reactive } from 'link-dom';

function Child (data) {
    return div.style('marginLeft', 20)(
        div(join`child:name: ${link(data.name)}`),
        div(join`child:age: ${link(data.age)}`),
        button('modify in children Won\'t work').click(() => {
            data.name += '!';
            data.age += 1;
        })
    );
}

function Parent () {
    const data = reactive({
        name: 'theajack',
        age: 18,
    });
    return div(
        div('Information:'),
        div(join`parent:name: ${link(data.name)}`),
        div(join`parent:age: ${link(data.age)}`),
        button('modify in parent').click(() => {
            data.name += '!';
            data.age += 1;
        }),
        Child(flow(data)),
    );
}

mount(Parent, '#app');
