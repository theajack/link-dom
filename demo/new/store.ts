/*
 * @Author: tackchen
 * @Date: 2025-12-03 01:04:01
 * @Description: Coding something
 */
import { ut } from 'ui-test-lib';
import { defineStore, watch } from 'link-dom-reactive';

const useStore = defineStore({
    id: 'test',
    state: () => ({
        count: 1,
    }),
    getters: {
        doubleCount: (state) => state.count * 2,
    },
    actions: {
        increment () {
            this.count++;
        },
    },
});

const store = useStore();

ut.test(
    ut.setUp(() => {
        store.count = 1;
    }),
    ut.true(() => store.count === 1),
    ut.true(() => store.doubleCount === 2),
    ut.run(() => {
        store.increment();
    }),
    ut.true(() => store.count === 2),
    ut.true(() => store.doubleCount === 4),
    ut.run(() => {
        store.count = 3;
    }),
    ut.true(() => store.count === 3),
    ut.true(() => store.doubleCount === 6),
    ut.resolve((resolve) => {
        watch(() => store.count, (v) => {
            resolve(v === 6);
        });
        store.count = 6;
    }),
    ut.resolve((resolve) => {
        watch(() => store.doubleCount, (v) => {
            resolve(v === 20);
        });
        store.count = 10;
    }),
);