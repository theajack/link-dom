// @needUI=true
// @hideLog=true
// @dep=link-dom
// @desc=Reactive Data
// @title=Basic Usage

import { dom, ref, mount, join } from 'link-dom';
function Reactive () {
    const name = ref('');
    return dom.div.children(
        dom.div.text(() => `Hello World! ${name.value}`),
        // Or use join
        dom.div.text(join`Hello World! ${name}`),
        dom.input.attr('placeholder', 'Input your name').bind(name)
    );
}
mount(Reactive, '#app');