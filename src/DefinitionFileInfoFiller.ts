import {GlobalDefinition, FileDefinition, NamespaceDefinition} from "ts-type-info";
import {DefinitionTypeInfo} from "./DefinitionTypeInfoBuilder";

export class DefinitionFileInfo {
    fileDefinition: FileDefinition;
    aliasNameInImport: string;
    aliasNameInFile: string;
}

export class DefinitionFileInfoFiller {
    private aliasCount = 0;
    private namespaceWithAliasNameCache = new NamespaceWithAliasNameCache();

    constructor(private globalInfo: GlobalDefinition) {
    }

    fillDefinitionFileInfo(definitionFileInfo: DefinitionTypeInfo & DefinitionFileInfo) {
        const fileAndNamespaces = this.globalInfo.getFileAndNamespacesToDefinition(definitionFileInfo.definition);
        definitionFileInfo.fileDefinition = fileAndNamespaces.file;

        if (fileAndNamespaces.namespaces.length > 0) {
            definitionFileInfo.aliasNameInImport = this.namespaceWithAliasNameCache.getAliasNameInImportFromNamespace(fileAndNamespaces.namespaces[0], () => ++this.aliasCount);
            const prefix = fileAndNamespaces.namespaces.map(n => n.name).join(".");
            definitionFileInfo.aliasNameInFile = definitionFileInfo.aliasNameInImport + "." + prefix + "." + definitionFileInfo.definition.name;
        }
        else {
            definitionFileInfo.aliasNameInImport = definitionFileInfo.definition.name + (++this.aliasCount).toString();
            definitionFileInfo.aliasNameInFile = definitionFileInfo.aliasNameInImport;
        }
    }

}

class NamespaceWithAliasNameCache {
    private namespaceDefsWithImportName: { namespaceDef: NamespaceDefinition; aliasNameInImport: string; }[] = [];

    getAliasNameInImportFromNamespace(namespaceDef: NamespaceDefinition, getAliasCount: () => number) {
        let namespaceDefWithImportName = this.getNamespaceWithImportNameFromNamespace(namespaceDef);
        if (namespaceDefWithImportName == null) {
            this.namespaceDefsWithImportName.push({ namespaceDef: namespaceDef, aliasNameInImport: namespaceDef.name + getAliasCount().toString() });
            namespaceDefWithImportName = this.namespaceDefsWithImportName[this.namespaceDefsWithImportName.length - 1];
        }
        return namespaceDefWithImportName.aliasNameInImport;
    }

    private getNamespaceWithImportNameFromNamespace(namespaceDef: NamespaceDefinition) {
        for (let i = 0; i < this.namespaceDefsWithImportName.length; i++) {
            if (this.namespaceDefsWithImportName[i].namespaceDef === namespaceDef) {
                return this.namespaceDefsWithImportName[i];
            }
        }

        return null;
    }
}
