import {ImportDefinition, FileDefinition, createImport} from "ts-type-info";
import {getModuleSpecifier} from "./getModuleSpecifier";
import {SupportedDefinitions} from "./DefinitionInfo";

export class ImportsBuilder {
    private importByFileName: { [fileName: string]: ImportDefinition; } = {};

    constructor(private srcRoot: string) {
    }

    getAll() {
        return Object.keys(this.importByFileName).map(key => this.importByFileName[key]);
    }

    getOrCreateImport(opts: { fileDefinition: FileDefinition; definition: SupportedDefinitions; aliasNameInImport: string; }) {
        if (this.importByFileName[opts.fileDefinition.fileName] == null) {
            this.importByFileName[opts.fileDefinition.fileName] = this.createImport(opts.fileDefinition);
        }

        const importForCreate = this.importByFileName[opts.fileDefinition.fileName];
        const namespaces = opts.fileDefinition.getNamespacesToDefinition(opts.definition);
        const defForImport = namespaces.length > 0 ? namespaces[0] : opts.definition;
        const importName = defForImport.isNamedExportOfFile ? defForImport.name : "default";
        const doesImportExist = importForCreate.getNamedImport(n => n.name === importName) != null;

        if (!doesImportExist) {
            importForCreate.addNamedImport({
                name: importName,
                alias: opts.aliasNameInImport
            });
        }

        return importForCreate;
    }

    private createImport(file: FileDefinition) {
        const moduleSpecifier = getModuleSpecifier({ fileName: file.fileName, srcRoot: this.srcRoot });
        return createImport({
            moduleSpecifier
        });
    }
}
