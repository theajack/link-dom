
import { defineComponent, div, mount, reactive, slot, span } from 'link-dom';

const Child = defineComponent(({ slots, mounted }) => {
    console.log('slots', slots);

    mounted(() => {
        console.log('mounted');
    });
    return div(
        span('Hello').click.once(() => {
            console.log(11);
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
    return div(
        Child(slot('cc', div('slotc'))).slot('aa', div('slot')).slot(div('default')),
        span(data.name),
    );
};

mount(App, '#app');