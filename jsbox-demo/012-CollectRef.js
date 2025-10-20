// @needUI=true
// @hideLog=true
// @dep=link-dom

import { mount, collectRef, div, span, button } from 'link-dom';
function CollectRef () {
    const refs = collectRef('hello');
    return div(
        span('Hello World!').ref(refs.hello),
        button('Log Ref').click(() => {
            console.log(refs.hello);
            const text = refs.hello.text();
            refs.hello.text(text + '!');
        }),
    );
}
mount(CollectRef, '#jx-app');
