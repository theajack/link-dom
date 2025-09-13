/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-13 23:52:09
 * @Description: Coding something
 */
import { ctrl, dom, mount, reactive, ref } from 'link-dom';

function Test () {

    const arr = reactive([ 1, 2, 3, 2 ]);

    const selected = ref(0);

    const value2 = ref('xxx');

    window._arr2 = arr;

    return ctrl.forRef(arr, (item, index) => {
        return ctrl.if(() => selected.value === item.value, () => {
            return dom.div.text(() => value2.value);
        }).else(() => {
            return dom.div.text(() => item.value).click(() => {
                selected.value = item.value;
            });
        });
    });
}

mount(Test(), document.body);