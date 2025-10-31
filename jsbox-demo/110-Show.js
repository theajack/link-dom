
// @needUI=true
// @hideLog=true
// @dep=link-dom
import { div, button, ref, mount, Show, span } from 'link-dom';
function ShowApp () {
    const bool = ref(true);
    return div(
        button('Toggle').click(() => { bool.value = !bool.value; }),
        Show(bool, span('Hello World!'))
    );
}
mount(ShowApp, '#app');