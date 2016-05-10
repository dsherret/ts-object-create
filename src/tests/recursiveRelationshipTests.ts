﻿import * as assert from "assert";
import {getGeneratedCode} from "./../main";

const expected =
`import {Main as Main1, Other as Other2} from "./tests/test-files/recursiveRelationship";

type Main1Type = { name?: string; other?: Other2Type; };
type Other2Type = { prop?: string; main?: Main1Type; };

export namespace Tests {
    export namespace TestFiles {
        export namespace RecursiveRelationship {
            export namespace Main {
                export function create(obj: Main1Type) {
                    const o = Object.create(Main1.prototype) as any;
                    objectAssign(o, obj);
                    if (typeof obj.other !== "undefined") {
                        o.other = Tests.TestFiles.RecursiveRelationship.Other.create(obj.other);
                    }
                    return o as Main1;
                }
            }

            export namespace Other {
                export function create(obj: Other2Type) {
                    const o = Object.create(Other2.prototype) as any;
                    objectAssign(o, obj);
                    if (typeof obj.main !== "undefined") {
                        o.main = Tests.TestFiles.RecursiveRelationship.Main.create(obj.main);
                    }
                    return o as Other2;
                }
            }
        }
    }
}

function objectAssign(a: any, b: any) {
    Object.keys(b).forEach(key => a[key] = b[key]);
}
`;

describe("recursive relationship", () => {
    it("should do the code", () => {
        const code = getGeneratedCode({
            srcRoot: "./src",
            files: ["./src/tests/test-files/recursiveRelationship.ts"]
        });

        assert.equal(code, expected);
    });
});
