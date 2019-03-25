import {existsMatch} from "../ExistsMatcher";

describe("ExistsMatcher", () => {

    it('should return true if exists', () => {
        expect(existsMatch("any", "whatever")).toBeTruthy();
    });

    it('should return false if not exists', () => {
        expect(existsMatch("any", null)).toBeFalsy();
        expect(existsMatch("any")).toBeFalsy();
    });

});