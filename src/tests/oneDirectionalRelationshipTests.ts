﻿import * as assert from "assert";
import {getGeneratedCode} from "./../main";

const expected =
`import {Main as Main1, default as Other2} from "./tests/test-files/oneDirectionalRelationship";

type Main1Type = { constructorParameter?: Other2Type; name?: string; other?: Other2Type; };
type Other2Type = { prop?: string; };

export namespace Tests {
    export namespace TestFiles {
        export namespace OneDirectionalRelationship {
            export namespace Main {
                export function create(obj: Main1Type) {
                    const o = Object.create(Main1.prototype) as any;
                    objectAssign(o, obj);
                    if (typeof obj.constructorParameter !== "undefined") {
                        o.constructorParameter = Tests.TestFiles.OneDirectionalRelationship.Other.create(obj.constructorParameter);
                    }
                    if (typeof obj.other !== "undefined") {
                        o.other = Tests.TestFiles.OneDirectionalRelationship.Other.create(obj.other);
                    }
                    return o as Main1;
                }
            }

            export namespace Other {
                export function create(obj: Other2Type) {
                    const o = Object.create(Other2.prototype) as any;
                    objectAssign(o, obj);
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

describe("one directional relationship", () => {
    it("should do the code", () => {
        const code = getGeneratedCode({
            srcRoot: "./src",
            files: ["./src/tests/test-files/oneDirectionalRelationship.ts"]
        });

        assert.equal(code, expected);
    });
});
