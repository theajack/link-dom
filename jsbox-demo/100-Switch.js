
// @needUI=true
// @hideLog=true
// @dep=link-dom
import { dom, ref, mount, join, ctrl } from 'link-dom';
function Switch () {
    const num = ref(0);
    return dom.div.children(
        dom.div.children(
            dom.span.text(join`num = ${num}`),
            dom.input.bind(num),
            dom.button.text('Increase').click(() => { num.value++; }),
        ),
        ctrl.switch(num)
            .case([ 0, 1 ], () => dom.span.text('num < 2'))
            .case([ 2, 3, 4 ], () => dom.span.text('num < 5'))
            .case(5, () => dom.span.text('num = 5'))
            .default(() => dom.span.text(join`num = ${num}`)),
    );
}
mount(Switch, '#jx-app');