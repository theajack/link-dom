
// @needUI=true
// @hideLog=true
// @dep=link-dom

import { style, div, input, ref, mount, join, button } from 'link-dom';
function GlobalStyle () {
    const font = ref(12);
    const color = ref('red');
    const colorB = ref('green');
    mount(style({
        '.parent': {
            fontWeight: 'bold',
            color: color,
            fontSize: font,
            '.child': {
                color: colorB,
            }
        }
    }), 'head');
    return div(
        div.class('parent')(
            div(join`Color = ${color}; FontSize = ${font}`),
            div.class('child')(join`Child Color = ${colorB}`),
        ),
        div('color: ', input.bind(color)),
        div('child color: ', input.bind(colorB)),
        div(
            'font: ',
            input.bind(font),
            button('Increase').click(() => font.value++)
        )
    );
}
mount(GlobalStyle, '#jx-app');