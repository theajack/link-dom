// @needUI=true
// @hideLog=true
// @dep=link-dom

import { dom, mount, collectRef } from 'link-dom';
function CollectRef () {
    const refs = collectRef('hello');
    return dom.div.children(
        dom.span.ref(refs.hello).text('Hello World!'),
        dom.button.text('Log Ref').click(() => {
            console.log(refs.hello);
            const text = refs.hello.text();
            refs.hello.text(text + '!');
        }),
    );
}
mount(CollectRef, '#jx-app');