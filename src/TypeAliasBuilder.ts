import {TypeAliasDefinition, createTypeAlias} from "ts-type-info";
import {DefinitionInfo} from "./DefinitionInfo";

export class TypeAliasBuilder {
    private typesByImportName: { [name: string]: TypeAliasDefinition; } = {};

    getAll() {
        return Object.keys(this.typesByImportName).map(key => this.typesByImportName[key]);
    }

    getOrCreate(defInfo: DefinitionInfo) {
        if (this.typesByImportName[defInfo.aliasNameInFile] == null) {
            this.typesByImportName[defInfo.aliasNameInFile] = this.createType(defInfo);
            // do this after to prevent a recursive loop that runs forever
            this.typesByImportName[defInfo.aliasNameInFile].type.text = this.getTypeText(defInfo);
        }

        return this.typesByImportName[defInfo.aliasNameInFile];
    }

    private createType(defInfo: DefinitionInfo) {
        return createTypeAlias({
            name: defInfo.aliasNameInFile.replace(/\./g, "") + "Type",
            type: ""
        });
    }

    private getTypeText(defInfo: DefinitionInfo) {
        let typeStr = "{ ";
        defInfo.properties.forEach(p => {
            // simple for now
            typeStr += p.name + "?: ";

            if (defInfo.propertyDependencies[p.name] != null) {
                typeStr += this.getOrCreate(defInfo.propertyDependencies[p.name]).name;
            }
            else {
                typeStr += p.type.text;
            }

            typeStr += "; ";
        });
        typeStr += "}";
        return typeStr;
    }
}
