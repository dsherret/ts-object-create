import {expect} from "chai";
import {getModuleSpecifier} from "./../getModuleSpecifier";

describe("getModuleSpecifier()", () => {
    function runSrcRootTests(message: string, srcRoot: string) {
        it(message, () => {
            const moduleSpecifier = getModuleSpecifier({ fileName: "/src/file.ts", srcRoot: srcRoot });
            expect(moduleSpecifier).to.equal("./file");
        });
    }

    runSrcRootTests("should handle slash at the start of srcRoot", "/src");
    runSrcRootTests("should handle dot slash at the start of srcRoot", "./src");
    runSrcRootTests("should handle no slash at the start of srcRoot", "src");
    runSrcRootTests("should handle slash at the start of srcRoot and slash at end", "/src/");
    runSrcRootTests("should handle dot slash at the start of srcRoot and slash at end", "./src/");
    runSrcRootTests("should handle no slash at the start of srcRoot and slash at end", "src/");
    runSrcRootTests("should handle different slash style", "src\\");

    it("should ignore the srcRoot if not found at the beginning of the file name", () => {
        const moduleSpecifier = getModuleSpecifier({ fileName: "/src/file.ts", srcRoot: "test" });
        expect(moduleSpecifier).to.equal("./src/file");
    });
});
