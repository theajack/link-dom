
import type { IProps } from 'link-dom';
import { collectRef, componentRef, defineComponent, div, mount, reactive, ref, slot, span } from 'link-dom';

const Child = defineComponent(({ slots, mounted, expose, emit }) => {
    console.log('slots', slots);

    mounted(() => {
        console.log('mounted');
    });
    expose.a = 1;
    return div(
        span('Hello').click(() => {
            console.log(11);
            emit('aa', 'aa');
        }),
        slots.aa,
        slots.default,
        slots.cc,
    );
});

const App = () => {
    const data = reactive({
        name: 'tack',
        age: 31,
    });

    const a = ref();

    // const refs = componentRef('a');

    return div(
        Child.on.aa((...args) => {
            console.log('from child', args);
        }).ref(a)(slot('cc', div('slotc'))).slot('aa', div('slot')).slot(div('default')),
        span(data.name).click(() => {
            console.log(a.value.expose.a, a.value);
        }),
    );
};

mount(App, '#app');