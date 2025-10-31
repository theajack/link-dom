// @needUI=true
// @hideLog=false
// @dep=link-dom
import { isRef, raw, ref, reactive, computed } from 'link-dom';

const count = ref(1);
const data = reactive({ count: 1 });
const countAdd1 = computed(() => count.value + 1);

console.log('count isRef: ', isRef(count));
console.log('data isRef: ', isRef(data));
console.log('countAdd1 isRef: ', isRef(countAdd1));
console.log('fn isRef: ', isRef(() => count.value));

console.log('raw(count): ', raw(count));
console.log('raw(data): ', raw(data));
console.log('raw(countAdd1): ', raw(countAdd1));
console.log('raw(fn): ', raw(() => count.value));