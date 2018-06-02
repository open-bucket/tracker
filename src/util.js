function createRoute(path, createChildRouterFn) {
    return function (router) {
        router.path = path;
        router = createChildRouterFn(router);
        return router;
    };
}

module.exports = {
    createRoute
};
