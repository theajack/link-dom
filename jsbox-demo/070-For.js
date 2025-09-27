
// @needUI=true
// @hideLog=true
// @dep=link-dom
// @desc=Reactive Array
// @title=Controller

import { dom, ref, mount, join, ctrl, link } from 'link-dom';
function For () {
    const list = ref([]);
    let id = 0;
    return dom.div.children(
        dom.div.children(
            dom.button.text('Add Item').click(() => {
                id ++;
                list.value.push({ id: `id-${id}`, label: `label-${id}` });
            }),
            dom.button.text('Reverse').click(() => list.value.reverse()),
            dom.button.text('Clear').click(() => list.value = []),
        ),
        ctrl.for(list, (item, index) =>
            dom.div.children(
                dom.span.text(join`${index}: ${link(item.id)}: ${link(item.label)}`),
                dom.button.text('Remove').click(() => { list.value.splice(index.value, 1); }),
                dom.button.text('Update').click(() => { item.label += '!'; }),
            )
        ),
    );
}
mount(For, '#jx-app');