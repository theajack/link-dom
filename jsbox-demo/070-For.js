/*
 * @Author: tackchen
 * @Date: 2025-11-01 13:22:11
 * @Description: Coding something
 */

// @needUI=true
// @hideLog=true
// @dep=link-dom
// @desc=Reactive Array
// @title=Controller

import { div, button, ref, mount, join, For, link, span } from 'link-dom';
function ForApp () {
    const list = ref([
        { id: 'id-1', label: 'label-1' },
        { id: 'id-2', label: 'label-2' },
        { id: 'id-3', label: 'label-3' },
        { id: 'id-4', label: 'label-4' },
        { id: 'id-5', label: 'label-5' },
        { id: 'id-6', label: 'label-6' },
        { id: 'id-7', label: 'label-7' },
        { id: 'id-8', label: 'label-8' },
    ]);
    // setInterval(() => {
    //     console.log(list.value.length, JSON.stringify(list.value[0]));
    // }, 1000);
    let id = 8;
    return div(
        div(
            button('Add Item').click(() => {
                id ++;
                list.value.push({ id: `id-${id}`, label: `label-${id}` });
            }),
            button('Reverse').click(() => list.value.reverse()),
            button('Clear').click(() => list.value = []),
        ),
        For(list, (item, index) =>
            div(
                span(join`${index}: ${link(item.id)}: ${() => (item.label)}`),
                button('Remove').click(() => { list.value.splice(index.value, 1); }),
                button('Update').click(() => { item.label += '!'; }),
            )
        ),
    );
}
mount(ForApp, '#app');