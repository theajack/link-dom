
// @needUI=true
// @hideLog=true
// @dep=link-dom
import { dom, ref, mount, join, ctrl } from 'link-dom';
function If () {
    const num = ref(0);
    return dom.div.children(
        dom.div.children(
            dom.span.text(join`num = ${num}`),
            dom.input.bind(num),
            dom.button.text('Increase').click(() => { num.value++; }),
        ),
        ctrl.if(() => num.value < 2, () => dom.span.text('num < 2'))
            .elif(() => num.value < 5, () => dom.span.text('num < 5'))
            .else(() => dom.span.text('num >= 5')),
    );
}
mount(If, '#jx-app');