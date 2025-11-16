
// @needUI=true
// @hideLog=true
// @dep=link-dom
import { div, span, button, input, ref, mount, join, If, Elif, Else } from 'link-dom';
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

        // or
        span.if(() => num.value < 2)(span('num < 2')),
        span.elif(() => num.value < 5)('num < 5'),
        span.else('num >= 5'),


        If(() => num.value < 2)(() => span('num < 2')),
        Elif(() => num.value < 5)(span('num < 5')),
        Else(span('num >= 5')),
    );
}
mount(IfApp, '#app');