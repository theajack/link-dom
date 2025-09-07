
import {
    dom, mount, computed, watch, ref, style, collectRef, join, ctrl, reactive, link,
    deepAssign, deepClone, raw, flow
} from 'link-dom';

function TodoItem (item: {content: string, isDone: boolean}, index: {value: number}, toggleDone: () => void) {
    return dom.div.append(
        dom.span.style({
            textDecoration: () => item.isDone ? 'line-through' : 'none',
        }).text(() => `${index.value}: ${(item.content)} ${(item.isDone)}`),
        dom.button.text(() => item.isDone ? 'undo' : 'done').click(toggleDone)
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
            ctrl.for(list, (item, index) => flow(TodoItem)(item, index, () => {
                item.isDone = !item.isDone;
            })),
        )
    );
}

mount(Todo(), 'body');