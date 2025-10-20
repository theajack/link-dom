
// @needUI=true
// @hideLog=true
// @dep=link-dom
// @desc=Reactive Array
// @title=Controller

import { div, button, ref, mount, join, For, link, span } from 'link-dom';
function ForApp () {
    const list = ref([]);
    let id = 0;
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
                span(join`${index}: ${link(item.id)}: ${link(item.label)}`),
                button('Remove').click(() => { list.value.splice(index.value, 1); }),
                button('Update').click(() => { item.label += '!'; }),
            )
        ),
    );
}
mount(ForApp, '#jx-app');