
// @needUI=true
// @hideLog=true
// @dep=link-dom

import { div, Await, mount } from 'link-dom';

function AwaitApp () {
    const mockFetch = () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ id: 1, name: 'Tack' });
            }, 1000);
        });
    };
    return div(
        Await(mockFetch(), data =>
            div(`id = ${data.id}; name = ${data.name}`)
        )
    );
}
mount(AwaitApp, '#app');