
// @needUI=true
// @hideLog=true
// @dep=link-dom
// @desc=Reactive Array
// @title=Controller

import { div, mount, ForStatic } from 'link-dom';
function ForApp () {
    const list = [
        { id: 'a', label: 'label-a' },
        { id: 'b', label: 'label-b' },
        { id: 'c', label: 'label-c' },
    ];
    return ForStatic(list, (item, index) =>
        div(`${index}: ${item.id}: ${item.label}`)
    );
}
mount(ForApp, '#app');