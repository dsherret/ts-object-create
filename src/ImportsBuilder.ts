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

        this.importByFileName[opts.fileDefinition.fileName].addNamedImports({
            name: opts.definition.isNamedExportOfFile ? opts.definition.name : "default",
            alias: opts.aliasNameInImport
        });

        return this.importByFileName[opts.fileDefinition.fileName];
    }

    private createImport(file: FileDefinition) {
        const moduleSpecifier = getModuleSpecifier({ fileName: file.fileName, srcRoot: this.srcRoot });
        return createImport({
            moduleSpecifier
        });
    }
}
