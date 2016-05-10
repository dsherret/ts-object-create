import {DefinitionInfo, SupportedDefinitions} from "./DefinitionInfo";

export class FunctionForCreateFiller {
    fillFunction(defInfo: DefinitionInfo) {
        defInfo.namespaceDef.addFunctions({
            name: "create",
            isExported: true,
            parameters: [{ name: "obj", type: defInfo.typeAliasDef.name }],
            onWriteFunctionBody: writer => {
                writer.writeLine(`const o = ${this.getCreateByDefinitionAndAlias(defInfo.definition, defInfo.aliasNameInFile)};`);
                writer.writeLine(`objectAssign(o, obj);`);
                Object.keys(defInfo.propertyDependencies).forEach(name => {
                    const propDependency = defInfo.propertyDependencies[name];
                    writer.write(`if (typeof obj.${name} !== "undefined")`).block(() => {
                        writer.writeLine(`o.${name} = ${propDependency.namespacePath}.create(obj.${name});`);
                    });
                });
                writer.writeLine("return o;");
            }
        });
    }

    private getCreateByDefinitionAndAlias(def: SupportedDefinitions, aliasNameInFile: string) {
        if (def.isClassDefinition()) {
            return `Object.create(${aliasNameInFile}.prototype)`;
        }
        else {
            return "{}";
        }

    }
}
