
// @needUI=true
// @hideLog=true
// @dep=link-dom,link-dom-router
// @title=Router

import { createRouter, routerLink, routerView } from 'link-dom-router';
import { button, div, mount, watch } from 'link-dom';

const PageSub = () => {
    return [
        div('Sub Start'),
        routerView(),
        div('Sub End'),
    ];
};
const PageSub1 = () => div('Sub Page1');
const PageA = () => {
    return div('PageA');
};
const router = createRouter({
    routes: [
        {
            path: '/',
            component: () => div('Page Index'),
        },
        {
            path: '/sub',
            component: PageSub,
            children: [
                {
                    path: '/sub',
                    component: () => div('Sub Index')
                },
                {
                    path: '/sub/s1',
                    component: PageSub1,
                },
                {
                    path: '/sub/s1/s1',
                    component: () => div('Sub Page1/s1')
                },
                {
                    path: '/sub/s2/s2',
                    component: () => div('Sub Page2/s2')
                },
                {
                    path: '/sub/404',
                    component: () => div('Sub 404'),
                },
            ]
        },
        {
            path: '/a',
            component: PageA,
        },
        {
            path: '/b',
            component: () => div('PageB')
        },
        {
            path: '/c',
            component: () => div('CompC'),
        },
        {
            path: '/x/:name/:#age/:!male',
            meta: { test: 'x' },
            component: (data) => {
                console.log(`test:query`, data.query);
                console.log(`test:param`, data.param);
                console.log(`test:meta`, data.meta);
                console.log(`test:route`, data.route);
                console.log(`test:path`, data.path);
                return div('CompX').children(
                    div(() => `query: ${JSON.stringify(data.query)}`),
                    div(() => `param: ${JSON.stringify(data.param)}`),
                    div(() => `meta: ${JSON.stringify(data.meta)}`),
                    div(() => `query.a: ${JSON.stringify(data.query.a)}`),
                );
            },
        },
        {
            path: '/404',
            component: () => div('404'),
        },
    ]
});

const App = () => {
    return div(
        div.class('')(),
        div.style({ display: 'flex', gap: '10px' })(
            routerLink('/'),
            routerLink('/sub/s1'),
            routerLink('/sub/s1/s1'),
            routerLink('/sub/s2/s2'),
            routerLink('/sub/s3'),
            routerLink('/a'),
            routerLink('/b'),
            routerLink('/c'),
            routerLink('/x/tack/31/true?a=1'),
            routerLink('/x/123/456/false?name=zs&age=18&male=true'),
            routerLink.back(),
            routerLink.forward(),
            routerLink.go(-2),
        ),
        div(
            button('Js Call1').click(() => {
                router.route({
                    path: '/x/:name/:#age/:!male',
                    param: { name: 'tack', age: 18, male: true },
                    query: { a: 1 },
                });
            }),
            button('Js Call2').click(() => {
                router.route({
                    path: '/x/alice/12/false',
                    query: { a: 2 },
                });
            }),
            button('Js Call3').click(() => {
                router.route('/x/alice/18/true?a=3');
            })
        ),
        routerView(),
    );
};

mount(App, '#jx-app');

// window.router = router;

watch(() => router.path, (val) => {
    console.log('router.currentPath', val);
});
watch(() => router.query, (val) => {
    console.log('router.query', val);
});