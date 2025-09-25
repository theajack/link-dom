/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-25 08:20:26
 * @Description: Coding something
 */
import { dom, ref, mount, join, collectRef, style, ctrl, link, computed, Dom } from 'link-dom';

// import './custom-render';
// import './router';
import './ssr';

// function Split (title: string = '') {
//     return [
//         dom.div.style({
//             border: '1px solid black',
//             margin: '10px 0 5px 0',
//         }),
//         dom.div.text(`${title} Demo`).style({
//             fontWeight: 'bold',
//             marginBottom: '5px',
//         })
//     ];
// }

// mount(Split('App'), '#app');
// function App () {
//     const name = ref('');
//     return dom.div.children(
//         dom.div.text(() => `Hello World! ${name.value}`),
//         // Or use join
//         dom.div.text(join`Hello World! ${name}`),
//         dom.input.attr('placeholder', 'Input your name').bind(name)
//     );
// }
// mount(App, '#app');

// mount(Split('Style'), '#app');
// function Style () {
//     const font = ref(12);
//     const color = ref('red');
//     return dom.div.children(
//         dom.div.style({
//             fontWeight: 'bold',
//             color: color,
//             fontSize: font,
//         }).text(join`Color = ${color}; FontSize = ${font}`),
//         dom.div.children(
//             dom.text('color: '),
//             dom.input.bind(color),
//         ),
//         dom.div.children(
//             dom.text('font: '),
//             dom.input.bind(font),
//             dom.button.text('Increase').click(() => font.value++)
//         )
//     );
// }
// mount(Style, '#app');

// mount(Split('GlobalStyle'), '#app');
// function GlobalStyle () {
//     const font = ref(12);
//     const color = ref('red');
//     const colorB = ref('green');
//     style({
//         '.parent': {
//             fontWeight: 'bold',
//             color: color,
//             fontSize: font,
//             '.child': {
//                 color: colorB,
//             }
//         }
//     });
//     return dom.div.children(
//         dom.div.class('parent').children(
//             dom.div.text(join`Color = ${color}; FontSize = ${font}`),
//             dom.div.class('child').text(join`Child Color = ${colorB}`),
//         ),
//         dom.div.children(
//             dom.text('color: '),
//             dom.input.bind(color),
//         ),
//         dom.div.children(
//             dom.text('child color: '),
//             dom.input.bind(colorB),
//         ),
//         dom.div.children(
//             dom.text('font: '),
//             dom.input.bind(font),
//             dom.button.text('Increase').click(() => font.value++)
//         )
//     );
// }

// mount(GlobalStyle, '#app');

// mount(Split('Counter'), '#app');
// function Counter () {
//     const count = ref(0);
//     return dom.div.children(
//         dom.div.text(join`Count = ${count}`),
//         dom.input.bind(count),
//         dom.button.text('Increase').click(() => {
//             count.value++;
//         }),
//     );
// }

// mount(Counter, '#app');

// mount(Split('CollectRef'), '#app');
// function CollectRef () {
//     const refs = collectRef('hello');
//     return dom.div.children(
//         dom.span.ref(refs.hello).text('Hello World!'),
//         dom.button.text('Log Ref').click(() => {
//             console.log(refs.hello);
//             const text = refs.hello.text();
//             refs.hello.text(text + '!');
//         }),
//     );
// }
// mount(CollectRef, '#app');

// mount(Split('For'), '#app');
// function For () {
//     const list = ref([] as {id: string, label: string}[]);
//     let id = 0;
//     return dom.div.children(
//         dom.div.children(
//             dom.button.text('Add Item').click(() => {
//                 id ++;
//                 list.value.push({ id: `id-${id}`, label: `label-${id}` });
//             }),
//             dom.button.text('Reverse').click(() => list.value.reverse()),
//             dom.button.text('Clear').click(() => list.value = []),
//         ),
//         ctrl.for(list, (item, index) =>
//             dom.div.children(
//                 dom.span.text(join`${index}: ${link(item.id)}: ${link(item.label)}`),
//                 dom.button.text('Remove').click(() => { list.value.splice(index.value, 1); }),
//                 dom.button.text('Update').click(() => { item.label += '!'; }),
//             )
//         ),
//     );
// }
// mount(For, '#app');


// mount(Split('ForRef'), '#app');
// function ForRef () {
//     const list = ref([] as string[]);
//     let id = 0;
//     return dom.div.children(
//         dom.div.children(
//             dom.button.text('Add Item').click(() => {
//                 id ++;
//                 list.value.push(`label-${id}`);
//             }),
//             dom.button.text('Reverse').click(() => list.value.reverse()),
//             dom.button.text('Clear').click(() => list.value = []),
//         ),
//         ctrl.forRef(list, (item, index) =>
//             dom.div.children(
//                 dom.span.text(join`${index}: ${item};(or use link:${link(item.value)})`),
//                 dom.button.text('Remove').click(() => { list.value.splice(index.value, 1); }),
//                 dom.button.text('Update').click(() => { item.value += '!'; }),
//             )
//         ),
//     );
// }
// mount(ForRef, '#app');


// mount(Split('If'), '#app');
// function If () {
//     const num = ref(0);
//     return dom.div.children(
//         dom.div.children(
//             dom.span.text(join`num = ${num}`),
//             dom.input.bind(num),
//             dom.button.text('Increase').click(() => { num.value++; }),
//         ),
//         ctrl.if(() => num.value < 2, () => dom.span.text('num < 2'))
//             .elif(() => num.value < 5, () => dom.span.text('num < 5'))
//             .else(() => dom.span.text('num >= 5')),
//     );
// }
// mount(If, '#app');


// mount(Split('Switch'), '#app');
// function Switch () {
//     const num = ref(0);
//     return dom.div.children(
//         dom.div.children(
//             dom.span.text(join`num = ${num}`),
//             dom.input.bind(num),
//             dom.button.text('Increase').click(() => { num.value++; }),
//         ),
//         ctrl.switch(num)
//             .case([ 0, 1 ], () => dom.span.text('num < 2'))
//             .case([ 2, 3, 4 ], () => dom.span.text('num < 5'))
//             .case(5, () => dom.span.text('num = 5'))
//             .default(() => dom.span.text(join`num = ${num}`)),
//     );
// }
// mount(Switch, '#app');


// mount(Split('Show'), '#app');
// function Show () {
//     const bool = ref(true);
//     return dom.div.children(
//         dom.button.text('Toggle').click(() => { bool.value = !bool.value; }),
//         ctrl.show(bool, dom.span.text('Hello World!'))
//     );
// }
// mount(Show, '#app');


// mount(Split('Await'), '#app');
// function Await () {
//     const mockFetch = () => {
//         return new Promise<{id: number, name: string}>((resolve) => {
//             setTimeout(() => {
//                 resolve({ id: 1, name: 'Tack' });
//             }, 1000);
//         });
//     };
//     return dom.div.children(
//         ctrl.await(mockFetch(), data =>
//             dom.div.children(
//                 dom.span.text(`id = ${data.id}; name = ${data.name}`),
//             )
//         )
//     );
// }
// mount(Await, '#app');
