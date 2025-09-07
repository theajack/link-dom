/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-07 18:22:26
 * @Description: Coding something
 */
import { createRouter, routerView } from 'link-dom-router';
import { dom, mount } from 'link-dom';


const CompMain = () => {
    return dom.div.text('Main');
};
const CompA = () => {
    return [
        dom.div.text('CompA'),
        routerView(),
        dom.div.text('CompA'),
    ];
};
const CompA1 = () => {
    return dom.div.text('CompA1');
};
const CompA2 = () => {
    return dom.div.text('CompA2');
};

const CompB = () => {
    return dom.div.text('CompB');
};

const router = createRouter({
    routes: [
        {
            path: '/',
            component: CompMain,
        },
        {
            path: '/a',
            component: CompA,
            children: [
                {
                    path: '/a/a1',
                    component: CompA1,
                },
                {
                    path: '/a/a2',
                    component: CompA2,
                }
            ]
        },
        {
            path: '/b',
            component: CompB,
        },
        {
            path: '/c',
            component: () => dom.div.text('CompC'),
        }
    ]
});

const App = () => {
    return routerView();
};

mount(App(), 'body');