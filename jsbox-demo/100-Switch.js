
// @needUI=true
// @hideLog=true
// @dep=link-dom
import { div, span, button, input, ref, mount, join, Switch } from 'link-dom';
function SwitchApp () {
    const num = ref(0);
    return div(
        div(
            span(join`num = ${num}`),
            input.bind(num),
            button('Increase').click(() => { num.value++; }),
        ),
        Switch(num)
            .case([ 0, 1 ], () => span('num < 2'))
            .case([ 2, 3, 4 ], () => span('num < 5'))
            .case(5, () => span('num = 5'))
            .default(() => span(join`num = ${num}`)),

        // or
        Switch(num)(
            span.case([ 0, 1 ])('num < 2'),
            span.case([ 2, 3, 4 ])('num < 5'),
            span.case(5)('num = 5'),
            span.default()(join`num = ${num}`),
        )
    );
}
mount(SwitchApp, '#app');