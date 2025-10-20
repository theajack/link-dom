// @needUI=true
// @hideLog=true
// @dep=link-dom
// @desc=Style Link Usage

import { div, reactive, input, button, mount, join, link } from 'link-dom';
function Style () {
    const data = reactive({
        color: 'red',
        font: 12,
    });
    return div(
        div(join`Color = ${link(data.color)}; FontSize = ${link(data.font)}`).style({
            fontWeight: 'bold',
            color: link(data.color),
            fontSize: link(data.font),
        }),
        div('color: ', input.bind(link(data.color))),
        div(
            'font: ',
            input.bind(link(data.font)),
            button('Increase').click(() => data.font++)
        )
    );
}
mount(Style, '#jx-app');