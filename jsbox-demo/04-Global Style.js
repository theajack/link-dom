/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-26 17:13:58
 * @Description: Coding something
 */
// @needUI=true
// @hideLog=true
// @dep=link-dom

import { dom, ref, mount, join } from 'link-dom';
function GlobalStyle () {
    const font = ref(12);
    const color = ref('red');
    const colorB = ref('green');
    mount(dom.style({
        '.parent': {
            fontWeight: 'bold',
            color: color,
            fontSize: font,
            '.child': {
                color: colorB,
            }
        }
    }), 'head');
    return dom.div.children(
        dom.div.class('parent').children(
            dom.div.text(join`Color = ${color}; FontSize = ${font}`),
            dom.div.class('child').text(join`Child Color = ${colorB}`),
        ),
        dom.div.children(
            dom.text('color: '),
            dom.input.bind(color),
        ),
        dom.div.children(
            dom.text('child color: '),
            dom.input.bind(colorB),
        ),
        dom.div.children(
            dom.text('font: '),
            dom.input.bind(font),
            dom.button.text('Increase').click(() => font.value++)
        )
    );
}
mount(GlobalStyle, '#jx-app');