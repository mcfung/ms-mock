import {regexMatch} from "../RegexMatcher";

describe("RegexMatcher", () => {

    it('should return true if regex does match', () => {
        expect(regexMatch("/^(en|tc|sc)$/g", "en")).toBeTruthy();
        expect(regexMatch("/^(en|tc|sc)$/g", "tc")).toBeTruthy();
        expect(regexMatch("/^(en|tc|sc)$/g", "sc")).toBeTruthy();
    });

    it('should return false if regex does not match', () => {
        expect(regexMatch("/^(en|tc|sc)$/g", "scc")).toBeFalsy();
    });
});