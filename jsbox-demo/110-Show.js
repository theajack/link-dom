
// @needUI=true
// @hideLog=true
// @dep=link-dom
import { dom, ref, mount, ctrl } from 'link-dom';
function Show () {
    const bool = ref(true);
    return dom.div.children(
        dom.button.text('Toggle').click(() => { bool.value = !bool.value; }),
        ctrl.show(bool, dom.span.text('Hello World!'))
    );
}
mount(Show, '#jx-app');