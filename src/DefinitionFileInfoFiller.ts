import {createFile, NamespaceDefinition, GlobalDefinition, ImportDefinition, FileDefinition} from "ts-type-info";
import {DefinitionTypeInfo} from "./DefinitionTypeInfoBuilder";

export class DefinitionFileInfo {
    fileDefinition: FileDefinition;
    aliasNameInImport: string;
    aliasNameInFile: string;
}

export class DefinitionFileInfoFiller {
    private aliasCount = 0;

    constructor(private globalInfo: GlobalDefinition) {
    }

    fillDefinitionFileInfo(definitionFileInfo: DefinitionTypeInfo & DefinitionFileInfo) {
        const fileAndNamespaces = this.globalInfo.getFileAndNamespacesToDefinition(definitionFileInfo.definition);
        definitionFileInfo.fileDefinition = fileAndNamespaces.file;
        definitionFileInfo.aliasNameInImport = definitionFileInfo.definition.name + (++this.aliasCount).toString();
        const prefix = fileAndNamespaces.namespaces.map(n => n.name).join(".");
        definitionFileInfo.aliasNameInFile = ((prefix.length > 0) ? prefix + "." : "") + definitionFileInfo.aliasNameInImport;
    }
}
