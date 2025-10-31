// @needUI=true
// @hideLog=false
// @dep=link-dom
import { button, computed, div, join, mount, ref, watch } from 'link-dom';

const count = ref(1);
const countAdd2 = computed(() => count.value + 2);
const countAdd3 = computed(() => countAdd2.value + 1);

watch(count, (newVal, oldVal) => {
    console.log(`count change: new value=${newVal}, old value=${oldVal}`);
});
watch(countAdd2, (newVal, oldVal) => {
    console.log(`countAdd2 change: new value=${newVal}, old value=${oldVal}`);
});
watch(countAdd3, (newVal, oldVal) => {
    console.log(`countAdd3 change: new value=${newVal}, old value=${oldVal}`);
});
watch(() => count.value * 4, (newVal, oldVal) => {
    console.log(`count*4 change: new value=${newVal}, old value=${oldVal}`);
});

mount(div(
    button(`Add Count`).click(() => count.value++),
    div(join`count = ${count}`),
    div(join`count + 2 = ${countAdd2}`),
    div(join`count + 3 = ${countAdd3}`),
    div(join`count * 2 = ${() => count.value * 2}`),
    div(join`count + 4 = ${() => countAdd3.value + 1}`),
), '#app');