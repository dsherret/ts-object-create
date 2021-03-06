﻿import {expect} from "chai";
import {getValidNameFromPath} from "./../getValidNameFromPath";

describe("getValidNameFromPath()", () => {
    it("should return an empty string when passed null", () => {
        expect(getValidNameFromPath(null)).to.equal("");
    });

    it("should return an empty string when passed one", () => {
        expect(getValidNameFromPath("")).to.equal("");
    });

    it("should get name without extension", () => {
        expect(getValidNameFromPath("get-file-name")).to.equal("GetFileName");
    });

    it("should get name with extension", () => {
        expect(getValidNameFromPath("get-file-name.ts")).to.equal("GetFileName");
    });

    it("should get name when directory is forward slash", () => {
        expect(getValidNameFromPath("src/get-file-name.ts")).to.equal("GetFileName");
    });

    it("should get name when directory is back slash", () => {
        expect(getValidNameFromPath("src\\get-file-name.ts")).to.equal("GetFileName");
    });
});
