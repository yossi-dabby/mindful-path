export function createPageUrl(pageName, queryString) {
    const path = '/' + pageName.replace(/ /g, '-');
    return queryString ? `${path}?${queryString}` : path;
}
