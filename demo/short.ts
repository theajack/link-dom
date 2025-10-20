/*
 * @Author: chenzhongsheng
 * @Date: 2025-10-20 02:20:35
 * @Description: Coding something
 */
import { button, collectRef, div, input, join, mount, ref, span, tag } from 'link-dom';


// function Reactive () {
//     const name = ref('');
//     return div(
//         div(() => `Hello World! ${name.value}`),
//         // Or use join
//         div(join`Hello World! ${name}`),
//         input().bind(name).attr('placeholder', 'Input your name')
//     );
// }
// mount(Reactive, 'body');

// div();

// div.class('')();

// div().class('');

// div().class('').append();

function CollectRef () {
    const refs = collectRef('hello');
    return div.class('aa')(
        span('Hello World!').ref(refs.hello),
        button('Log Ref').click(() => {
            console.log(refs.hello);
            const text = refs.hello.text();
            refs.hello.text(text + '!');
        }).attr('a', 1),
    );

    // return div().class('aa').children(
    //     span('Hello World!').ref(refs.hello),
    //     button('Log Ref').click(() => {
    //         console.log(refs.hello);
    //         const text = refs.hello.text();
    //         refs.hello.text(text + '!');
    //     }),
    // );


    // return div(
    //     span('Hello World!').ref(refs.hello),
    //     button('Log Ref').click(() => {
    //         console.log(refs.hello);
    //         const text = refs.hello.text();
    //         refs.hello.text(text + '!');
    //     }).class('aa'),
    // ).class('aa');
}
mount(CollectRef, 'body');