import { button, ForStatic, join, option, script, select, span } from 'link-dom';
import { div, mount, ref, Show, style, toggle } from 'link-dom';

const feat = ref('111');
const list = [
    '111',
    '222',
    '333',
];
const page = '111';

const value = ref(true);

const color = ref('blue');
window.color = color;

mount(
    style.text(`
        #test { color: red; }
    `).id('aa'), 'head'
);
mount(
    script(`
        console.log('xx')
    `).id('aa'), 'head'
);

console.log(style(''));

const showPanel = ref(false);

mount(
    div.mounted(() => {
        console.log(11);
    }).on.self('click', () => {
        console.log(222);
    })(
        div(join`value:${feat}; bool=${value}`),
        button('test').click(toggle(value)),
        select.bind(feat).bind(feat)(
            ForStatic(list, (item) => option(item))
        ).on('change', () => {
            console.log('111');
        }),
        Show(value, () => span('11')),
        div.style({
            color: 'red',
            ':hover': {
                color: join`${color}!important`,
            }
        }).text('11122').click.once(() => {
            console.log('aa');
        }),
        div.id('test')('test'),
        div.style({
            'display': 'flex',
            gap: 20,
        })(
            div('111'),
            div('222')
        ),

        div.class(`btn`).style({
            backgroundColor: () => showPanel.value ? '#266ddedd' : '#f44',
        }).click(() => showPanel.value = !showPanel.value)(() => showPanel.value ? '+' : '×')
    ),
    'body'
);


console.log(div.mounted(() => {
    console.log(11);
}).on.self);

window.feat = feat;
// let prefix: any;


// div.prefix().class('');