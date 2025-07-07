import {exactMatch} from "./ExactMatcher";
import {existsMatch} from "./ExistsMatcher";
import {regexMatch} from "./RegexMatcher";

export default {
    exact: exactMatch,
    exists: existsMatch,
    regex: regexMatch
}