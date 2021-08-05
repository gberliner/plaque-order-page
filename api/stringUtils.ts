export function jsonParseIfStringified(str: string) {
    let retval = str;
    if (str.startsWith("\"")) {
        retval = JSON.parse(str)
    }
    return retval;
}