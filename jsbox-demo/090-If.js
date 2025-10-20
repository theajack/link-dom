
// @needUI=true
// @hideLog=true
// @dep=link-dom
import { div, span, button, input, ref, mount, join, If } from 'link-dom';
function IfApp () {
    const num = ref(0);
    return div(
        div(
            span(join`num = ${num}`),
            input.bind(num),
            button('Increase').click(() => { num.value++; }),
        ),
        If(() => num.value < 2, () => span('num < 2'))
            .elif(() => num.value < 5, () => span('num < 5'))
            .else(() => span('num >= 5')),
    );
}
mount(IfApp, '#jx-app');