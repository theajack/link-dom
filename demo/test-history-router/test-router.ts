/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-07 18:22:26
 * @Description: Coding something
 */
import { defineRouter, routerLink, routerView } from 'link-dom-router';
import { defineComponent, div, dom, mount, Transition, watch } from 'link-dom';

const Child = defineComponent(({ beforeRouteEnter, afterRouteEnter, beforeRouteLeave }) => {
    console.log('debug comp route 1111111');
    beforeRouteEnter((to, from) => {
        console.warn('debug comp route Child beforeRouteEnter', to, from);
    });
    afterRouteEnter((to, from) => {
        console.warn('debug comp route Child afterRouteEnter', to, from);
    });
    beforeRouteLeave((to, from) => {
        console.warn('debug comp route Child beforeRouteLeave', to, from);
    });
    return div(1);
});

const PageSub = () => {
    return [
        dom.div.text('Sub Start'),
        routerView(),
        dom.div.text('Sub End'),
    ];
};
const PageSub1 = () => dom.div.text('Sub Page1');
const PageA = () => {
    return dom.div.text('PageA');
};

let a = 0;
setInterval(() => {
    a++;
    console.log(a);
}, 5000);

const router = defineRouter({
    mode: 'history',
    base: '/demo/test-history-router',
    routes: [
        {
            path: '/index',
            component: () => dom.div.text('index'),
        },
        {
            path: '/a1',
            component: () => dom.div.text('a1'),
        },
        {
            path: '/a2',
            component: () => dom.div.text('a2'),
        },
        {
            path: '/404',
            component: () => dom.div.text('404'),
        },
    ]
});
router.beforeEach((to, from) => {
    console.log('router event beforeEach', to, from);
});

const App = () => {
    return dom.div.children(
        dom.div.style({ display: 'flex', gap: '10px' }).children(
            routerLink('/index'),
            routerLink('/a1'),
            routerLink('/a2'),
            routerLink('/a3'),
            routerLink.back(),
            routerLink.forward(),
            routerLink.go(-2),
        ),
        dom.div.children(
            dom.button.text('Js Call1').click(() => {
                router.route({
                    path: '/x/:name/:#age/:!male',
                    param: { name: 'tack', age: 18, male: true },
                    query: { a: 1 },
                });
            }),
            dom.button.text('Js Call2').click(() => {
                router.route({
                    path: '/x/alice/12/false',
                    query: { a: 2 },
                });
            }),
            dom.button.text('Js Call3').click(() => {
                router.route('/x/alice/18/true?a=3');
            })
        ),
        // Transition(
        // )
        routerView(),
    );
};

mount(App, '#app');

// window.router = router;

watch(() => router.path, (val) => {
    console.log('router.currentPath', val);
});
watch(() => router.query, (val) => {
    console.log('router.query', val);
});


// window._t = () => {
//     const a = document.createElement('div');
//     const btn = document.createElement('button');
//     a.innerText = 'xxx';
//     a.appendChild(btn);
//     btn.innerText = 'btn';
//     btn.onclick = () => console.log('bbb');
//     a.onclick = () => console.log('aaa');
//     return a;
// };


// window.addEventListener('hashchange', () => {
//     console.log('debug hashchange', location.hash);
// });

// window.addEventListener('popstate', () => {
//     console.log('debug popstate', location.hash);
// });