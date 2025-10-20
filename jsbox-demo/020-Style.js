// @needUI=true
// @hideLog=true
// @dep=link-dom
// @desc=Basic Style
// @title=Style

import { div, ref, input, button, mount, join } from 'link-dom';
function Style () {
    const font = ref(12);
    const color = ref('red');
    return div(
        div(join`Color = ${color}; FontSize = ${font}`).style({
            fontWeight: 'bold',
            color: color,
            fontSize: font,
        }),
        div('color: ', input.bind(color)),
        div(
            'font: ',
            input.bind(font),
            button('Increase').click(() => font.value++)
        )
    );
}
mount(Style, '#jx-app');