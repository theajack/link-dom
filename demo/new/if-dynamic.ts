/*
 * @Author: tackchen
 * @Date: 2025-11-30 23:51:44
 * @Description: Coding something
 */
import { watiNextFrame } from 'link-dom-shared';
import { ut } from '../test-util';
import type { IfClass } from 'link-dom';
import { button, div, Elif, Else, If, link, mount, reactive, ref, toggle } from 'link-dom';

const App = () => {

    const v = ref(3);

    let vif: IfClass;

    ut.runTest(
        ut.setUpValue(() => {
            const result = document.getElementById('result')!;
            return () => result.textContent;
        }),
        ut.expect('else'),
        ut.run(() => {
            vif.addCase({ generator: () => div('newElse') });
        }),
        ut.expect('newElse'),
        ut.run(() => {v.value = 6;}),
        ut.expect('>5'),
        ut.run(() => {
            vif.addCase({
                ref: () => v.value > 3,
                generator: () => div('>3'),
                index: 1
            });
        }),
        ut.expect('>3'),
    );

    return div(
        div.id('result')(
            // @ts-ignore
            vif = If(() => v.value === 1)(div('=1')),
            Elif(() => v.value > 5)(div('>5')),
            Else(
                div('else')
            )
        )
    );
};

mount(App(), document.body);

