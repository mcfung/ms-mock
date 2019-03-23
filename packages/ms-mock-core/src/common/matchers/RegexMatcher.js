const str2Regex = str => {
    // Main regex
    const main = str.match(/\/(.+)\/.*/)[1];

    // Regex options
    const options = str.match(/\/.+\/(.*)/)[1];

    // Return compiled regex
    return new RegExp(main, options)
};

export function regexMatch(expected, actual) {
    const re = str2Regex(expected);
    return re.test(actual);
}