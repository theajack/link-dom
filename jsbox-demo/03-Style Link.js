// @needUI=true
// @hideLog=true
// @dep=link-dom
// @desc=Style Link Usage

import { dom, ref, mount, join } from 'link-dom';
function Style () {
    const font = ref(12);
    const color = ref('red');
    return dom.div.children(
        dom.div.style({
            fontWeight: 'bold',
            color: color,
            fontSize: font,
        }).text(join`Color = ${color}; FontSize = ${font}`),
        dom.div.children(
            dom.text('color: '),
            dom.input.bind(color),
        ),
        dom.div.children(
            dom.text('font: '),
            dom.input.bind(font),
            dom.button.text('Increase').click(() => font.value++)
        )
    );
}
mount(Style, '#jx-app');