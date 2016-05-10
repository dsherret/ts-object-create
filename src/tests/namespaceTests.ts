import * as assert from "assert";
import {getGeneratedCode} from "./../main";

const expected =
`import {Namespace as Namespace1, Other as Other2} from "./tests/test-files/namespace";

type Namespace1NamespaceMainType = { name?: string; other?: Other2Type; };
type Other2Type = { prop?: string; main?: Namespace1NamespaceMainType; };
type Namespace1NamespaceOtherInterfaceType = { name?: string; };

export namespace Tests {
    export namespace TestFiles {
        export namespace Namespace {
            export namespace Namespace {
                export namespace Main {
                    export function create(obj: Namespace1NamespaceMainType) {
                        const o = Object.create(Namespace1.Namespace.Main.prototype) as any;
                        objectAssign(o, obj);
                        if (typeof obj.other !== "undefined") {
                            o.other = Tests.TestFiles.Namespace.Other.create(obj.other);
                        }
                        return o as Namespace1.Namespace.Main;
                    }
                }

                export namespace OtherInterface {
                    export function create(obj: Namespace1NamespaceOtherInterfaceType) {
                        const o = {} as any;
                        objectAssign(o, obj);
                        return o as Namespace1.Namespace.OtherInterface;
                    }
                }
            }

            export namespace Other {
                export function create(obj: Other2Type) {
                    const o = Object.create(Other2.prototype) as any;
                    objectAssign(o, obj);
                    if (typeof obj.main !== "undefined") {
                        o.main = Tests.TestFiles.Namespace.Namespace.Main.create(obj.main);
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

describe("namespace", () => {
    it("should do the code", () => {
        const code = getGeneratedCode({
            srcRoot: "./src",
            files: ["./src/tests/test-files/namespace.ts"]
        });

        assert.equal(code, expected);
    });
});
