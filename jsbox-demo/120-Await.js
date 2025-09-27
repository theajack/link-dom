
// @needUI=true
// @hideLog=true
// @dep=link-dom
function Await () {
    const mockFetch = () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ id: 1, name: 'Tack' });
            }, 1000);
        });
    };
    return dom.div.children(
        ctrl.await(mockFetch(), data =>
            dom.div.children(
                dom.span.text(`id = ${data.id}; name = ${data.name}`),
            )
        )
    );
}
mount(Await, '#jx-app');