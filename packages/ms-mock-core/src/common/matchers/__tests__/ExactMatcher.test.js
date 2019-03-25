import {exactMatch} from "../ExactMatcher";

describe("ExactMatcher", () => {

    it('should return true if both inputs are the same', () => {

        expect(exactMatch("a", "a")).toBeTruthy();

    });

    it('should return false if inputs are not the same', () => {

        expect(exactMatch("a", "b")).toBeFalsy();
    });

    it('should return false if one of the input is null/undefined', () => {
        expect(exactMatch("a", null)).toBeFalsy();
        expect(exactMatch("a")).toBeFalsy();
        expect(exactMatch(null, "a")).toBeFalsy();
        expect(exactMatch(undefined, "a")).toBeFalsy();
    });

    it('should return true if both are undefined / null', () => {
        expect(exactMatch(null, null)).toBeTruthy();
        expect(exactMatch(undefined, undefined)).toBeTruthy();
        expect(exactMatch(null, undefined)).toBeFalsy();
        expect(exactMatch(undefined, null)).toBeFalsy();
    })
});