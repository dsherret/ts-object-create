import * as assert from "assert";
import {getGeneratedCode} from "./../main";

const expected =
`import {Main as Main1, Other as Other2} from "./tests/test-files/oneDirectionalRelationship";

type Main1Type = { name: string; other: Other2Type; };
type Other2Type = { prop: string; };

export namespace Tests {
    export namespace TestFiles {
        export namespace Main {
            export function create(obj: Main1Type) {
                const o = new Main1();
                objectAssign(o, obj);
                o.other = Tests.TestFiles.Other.create(obj.other);
                return o;
            }
        }

        export namespace Other {
            export function create(obj: Other2Type) {
                const o = new Other2();
                objectAssign(o, obj);
                return o;
            }
        }
    }
}

function objectAssign(a: any, b: any) {
    Object.keys(b).forEach(key => a[key] = b[key]);
}
`;

describe("one directional relationship", () => {
    it("should do the code", () => {
        const code = getGeneratedCode({
            distRoot: "./dist",
            srcRoot: "./src",
            files: ["./src/tests/test-files/oneDirectionalRelationship.ts"]
        });

        assert.equal(code, expected);
    });
});