/*
 * @Author: tackchen
 * @Date: 2025-11-30 23:51:44
 * @Description: Coding something
 */
import { button, div, Else, If, link, mount, reactive, toggle } from 'link-dom';

const App = () => {

    const data = reactive({
        b1: true,
        b2: true,
        b3: true,
    });

    return div(

        div(
            button.click(toggle(link(data.b1)))('toggle b1'),
            button.click(toggle(link(data.b2)))('toggle b2'),
            button.click(toggle(link(data.b3)))('toggle b3'),
        ),
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
    );
};

mount(App(), document.body);