/*
 * @Author: tackchen
 * @Date: 2025-11-29 11:59:30
 * @Description: Coding something
 */
import { Await, button, defineComponent, div, mount, ref, toggle } from 'link-dom';
import { Teleport, Suspense } from 'link-dom';

const App = defineComponent(() => {
    return Suspense.resolve(() => {
        console.log('done');
    }).slot('fallback', () => div('loading1'))(
        AsyncComp(),
        div(111)
    );
});

// mockFecch

const mockFetch = (time = 1000) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(222);
        }, time);
    });
};

const AsyncComp = defineComponent(async () => {
    const data = await mockFetch(1000);
    return div(`hello1 ${data}`,
        Suspense(Async2Comp()).slot('fallback', () => div('loading2')),
    );
});
const Async2Comp = defineComponent(async () => {
    const data = await mockFetch(2000);
    return div(`hello2 ${data}`);
});

mount([
    App,
], '#app');