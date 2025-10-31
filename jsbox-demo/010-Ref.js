// @needUI=true
// @hideLog=true
// @dep=link-dom
// @desc=Reactive Data
// @title=Basic Usage

import { div, input, ref, mount, join, computed } from 'link-dom';
function Ref () {
    const name = ref('');
    const name2 = computed(() => `【name】 ${name.value}`);
    return div(
        div(() => `Hello World! ${name.value}`),
        // Or use join
        div(join`Hello World! ${name}`),
        div(join`Computed: ${name2}`),
        input.bind(name).placeholder('Input your name')
    );
}
mount(Ref, '#app');
