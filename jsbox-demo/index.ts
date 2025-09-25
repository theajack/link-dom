/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-25 08:20:26
 * @Description: Coding something
 */
import { dom, ref, mount, join, collectRef, style, ctrl } from 'link-dom';

function Split () {
    return dom.div.style({
        border: '1px solid black',
        margin: '10px 0',
    });
}

function App () {
    const name = ref('');
    return dom.div.children(
        dom.div.text(() => `Hello World! ${name.value}`),
        // Or use join
        dom.div.text(join`Hello World! ${name}`),
        dom.input.attr('placeholder', 'Input your name').bind(name)
    );
}

mount(App, '#app');

mount(Split, '#app');


function Style () {
    const font = ref(12);
    const color = ref('red');
    return dom.div.children(
        dom.div.style({
            fontWeight: 'bold',
            color: color,
            fontSize: font,
        }).text(join`Color = ${color}; FontSize = ${font}`),
        dom.div.children(
            dom.text('color: '),
            dom.input.bind(color),
        ),
        dom.div.children(
            dom.text('font: '),
            dom.input.bind(font),
            dom.button.text('Increase').click(() => font.value++)
        )
    );
}
mount(Style, '#app');

mount(Split, '#app');

function GlobalStyle () {
    const font = ref(12);
    const color = ref('red');
    const colorB = ref('green');
    style({
        '.parent': {
            fontWeight: 'bold',
            color: color,
            fontSize: font,
            '.child': {
                color: colorB,
            }
        }
    });
    return dom.div.children(
        dom.div.class('parent').children(
            dom.div.text(join`Color = ${color}; FontSize = ${font}`),
            dom.div.class('child').text(join`Child Color = ${colorB}`),
        ),
        dom.div.children(
            dom.text('color: '),
            dom.input.bind(color),
        ),
        dom.div.children(
            dom.text('child color: '),
            dom.input.bind(colorB),
        ),
        dom.div.children(
            dom.text('font: '),
            dom.input.bind(font),
            dom.button.text('Increase').click(() => font.value++)
        )
    );
}

mount(GlobalStyle, '#app');

mount(Split, '#app');

function Counter () {
    const count = ref(0);
    return dom.div.children(
        dom.div.text(join`Count = ${count}`),
        dom.input.bind(count),
        dom.button.text('Increase').click(() => {
            count.value++;
        }),
    );
}

mount(Counter, '#app');

mount(Split, '#app');

function CollectRef () {
    const refs = collectRef('hello');
    return dom.div.children(
        dom.span.ref(refs.hello).text('Hello World!'),
        dom.button.text('Log Ref').click(() => {
            console.log(refs.hello);
            const text = refs.hello.text();
            refs.hello.text(text + '!');
        }),
    );
}

mount(CollectRef, '#app');

mount(Split, '#app');

function For () {
    const list = ref([] as {id: string, label: string}[]);
    window.list = list;
    let id = 0;
    return dom.div.children(
        dom.div.children(
            dom.button.text('Add Item').click(() => {
                id ++;
                list.value.push({ id: `id-${id}`, label: `label-${id}` });
            }),
            dom.button.text('Reverse').click(() => list.value.reverse()),
            dom.button.text('Clear').click(() => list.value = []),
        ),
        ctrl.for(list, (item, index) => {
            return dom.div.text(join`${index.value}: ${item.id}: ${item.label}`);
        }),
    );
}

mount(For, '#app');

mount(Split, '#app');
