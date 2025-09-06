
import {
    dom, mount, computed, watch, ref, style, collectRef, join, ctrl, reactive, link,
    deepAssign, deepClone, raw, flow
} from 'link-dom';

function TodoItem (item: {content: string, isDone: boolean}, index: {value: number}) {
    return dom.div.append(
        dom.span.style({
            textDecoration: () => item.isDone ? 'line-through' : 'none',
        }).text(() => `${index.value}: ${(item.content)} ${(item.isDone)}`),
        dom.button.text(() => item.isDone ? 'undo' : 'done').click(() => {
            item.isDone = !item.isDone;
        })
    );
}

function Todo () {
    const list = ref([ {
        content: '2',
        isDone: false,
    }, {
        content: '1',
        isDone: false,
    } ]);

    const content = ref('');

    return dom.div.append(
        dom.div.append(
            dom.input.bind(content),
            dom.span.text(() => `size=${list.value.length}`),
            dom.button.text('add').click(() => {
                list.value.push({
                    content: content.value,
                    isDone: false,
                });
            }),
        ),
        dom.div.append(
            ctrl.for(list, flow(TodoItem)),
        )
    );
}

mount(Todo(), 'body');