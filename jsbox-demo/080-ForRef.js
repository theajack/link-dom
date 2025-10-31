
// @needUI=true
// @hideLog=true
// @dep=link-dom
// @desc=Reactive Array For Simple Value

import { div, button, span, ref, mount, join, link, ForRef } from 'link-dom';
function ForRefApp () {
    const list = ref([]);
    let id = 0;
    return div(
        div(
            button('Add Item').click(() => {
                id ++;
                list.value.push(`label-${id}`);
            }),
            button('Reverse').click(() => list.value.reverse()),
            button('Clear').click(() => list.value = []),
        ),
        ForRef(list, (item, index) =>
            div(
                span(join`${index}: ${item};(or use link:${link(item.value)})`),
                button('Remove').click(() => { list.value.splice(index.value, 1); }),
                button('Update').click(() => { item.value += '!'; }),
            )
        ),
    );
}
mount(ForRefApp, '#app');