import {writeFileSync} from 'fs'

export const getSites = (router) => {
    if (!router.type || router.type.displayName !== 'Router') {
        return [];
    }
    var arr = router.props.children;
    if (!Array.isArray(router.props.children)) {
        arr = [router.props.children]
    }

    return arrFlatten(arr, route => getRouteSites(route, '', []))
    function getRouteSites (route, base='/', paths=[]) {
        if (route.type && route.type.displayName.includes('Redirect') ) {
            return [];
        }
        var path = route.props.path || '';
        return arrFlatten(actionPath(path).map(p => base+p), (base) => {
            if ( !route.props.children ) {
                return paths.concat(base);
            } else {
                return paths.concat(
                    arrFlatten(route.props.children, (route) => getRouteSites(route, base))
                )
            }
        })
    }

    function actionPath (path) {
        var reg = /\(.*?\)/g, commaReg = /:[^\/]*/g
        var paths = []
        if (reg.test(path)) {
            paths.push(path.replace(reg, '').replace(/\/+$/, ''))
        }
        if (commaReg.test(path)) {
            paths.push(path.replace(commaReg, '*').replace(/[\(\)]/, '').replace(/\/+$/, ''))
        }
        if (!paths.length) {
            paths.push(path)
        }
        return paths
    }

    function arrFlatten (arr=[], getArray) {
        return arr.reduce(
            (init, a) => {
                return init.concat(getArray.call(null, a))
            }, []
        )
    }
}

export default (router, prefix='', file) => {
    try {
        const sites = getSites(router);
        writeFileSync(file, sites.map(s=>prefix+s).join('\r\n'));
        return true;
    } catch (ex) {
        console.error(ex);
        return false;
    }
}