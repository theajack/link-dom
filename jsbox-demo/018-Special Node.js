// @needUI=true
// @hideLog=false
// @dep=link-dom
import { ref, frag, comment, text, mount, button, join, collectRef, br, script, tag } from 'link-dom';

function App () {
    const msg = ref('!');
    const el = collectRef('text');
    return frag(
        comment(join`Hello CommentNode2${msg}`),
        text(join`Hello TextNode2${msg}`).ref(el.text),
        br(),
        tag('custom')(join`Hello CustomNode${msg}`),
        br(),
        button('Hello Button').click(() => {
            msg.value += '!';
            console.log(el.text.parent()?.html());
        }),
        script(`console.log("Hello${msg.value}")`),
    );
}

mount(App, '#app');