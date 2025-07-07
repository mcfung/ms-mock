const str2Regex = (str: string): RegExp => {
    // Main regex
    const mainMatch = str.match(/\/(.+)\/.*/);
    const main = mainMatch ? mainMatch[1] : null;
    if (!main) {
        throw new Error('Invalid regex format');
    }

    // Regex options
    const optionsMatch = str.match(/\/.+\/(.*)/);
    const options = optionsMatch ? optionsMatch[1] : '';

    // Return compiled regex
    return new RegExp(main, options)
};

export function regexMatch(expected: string, actual: string): boolean {
    const re = str2Regex(expected);
    return re.test(actual);
}