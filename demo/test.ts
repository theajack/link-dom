import { button, ref, mount, join } from 'link-dom';
function Counter () {
    const count = ref(0);
    return button(join`count=${count}`).click(() => {
        count.value++;
    });
}

mount(Counter(), '#app');