/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-26 08:40:01
 * @Description: Coding something
 */

import { ref, dom, DepUtil, mount, computed } from 'link-dom';

const a = ref(1);
const b = computed(() => a.value * 2);

mount(() => dom.div.text(b), 'body');

window.DepUtil = DepUtil;
window.a = a;
window.b = b;