/*
 * @Author: tackchen
 * @Date: 2025-11-30 23:51:44
 * @Description: Coding something
 */
import { utils } from '../test-util';
import { button, div, Else, If, link, mount, reactive, toggle } from 'link-dom';

const App = () => {

    const data = reactive({
        b1: true,
        b2: true,
        b3: true,
    });


    return div(

        div(
            button.id('b1').click(toggle(link(data.b1)))('toggle b1'),
            button.id('b2').click(toggle(link(data.b2)))('toggle b2'),
            button.id('b3').click(toggle(link(data.b3)))('toggle b3'),
        ),
        div.id('result')(
            If(link(data.b1))(div('b1')),
            Else(
                If(link(data.b2))(
                    div('b2'),
                    div('b222')
                ),
                Else(
                    If(link(data.b3))(div('b3'))
                )
            )
        )
    );
};

mount(App(), document.body);

utils.runTest(
    utils.setUpValue(() => {
        const result = document.getElementById('result')!;
        return () => result.textContent;
    }),
    utils.expect('b1'),
    utils.click('b1'),
    utils.expect('b2b222'),
    utils.click('b2'),
    utils.expect('b3'),
    utils.click('b1'),
    utils.expect('b1'),
    utils.click([ 'b1', 'b3' ]),
    utils.expect(''),
    utils.click('b3'),
    utils.expect('b3'),
);