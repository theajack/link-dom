/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-26 17:14:48
 * @Description: Coding something
 */
// @needUI=true
// @hideLog=true
// @dep=link-dom
// @desc=Reactive Array For Simple Value

import { dom, ref, mount, join, ctrl, link } from 'link-dom';
function ForRef () {
    const list = ref([]);
    let id = 0;
    return dom.div.children(
        dom.div.children(
            dom.button.text('Add Item').click(() => {
                id ++;
                list.value.push(`label-${id}`);
            }),
            dom.button.text('Reverse').click(() => list.value.reverse()),
            dom.button.text('Clear').click(() => list.value = []),
        ),
        ctrl.forRef(list, (item, index) =>
            dom.div.children(
                dom.span.text(join`${index}: ${item};(or use link:${link(item.value)})`),
                dom.button.text('Remove').click(() => { list.value.splice(index.value, 1); }),
                dom.button.text('Update').click(() => { item.value += '!'; }),
            )
        ),
    );
}
mount(ForRef, '#jx-app');