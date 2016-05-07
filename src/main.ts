import {getInfoFromFiles, createFile, createTypeAlias, ClassDefinition, FileDefinition, NamespaceDefinition, ModuledDefinition, GlobalDefinition, ExportableDefinitions,
    TypeExpressionedDefinition, ImportDefinition, TypeAliasDefinition, createImport} from "ts-type-info";
import * as path from "path";
import {getModuleSpecifier} from "./getModuleSpecifier";
import {getValidNameFromPath} from "./getValidNameFromPath";

// As you can tell, this file is a huge mess. This was just to put out the idea. A proper refactoring will occur.

export interface GenerateCodeOptions {
    files: string[];
    srcRoot: string;
}

export function getGeneratedCode(opts: GenerateCodeOptions) {
    const info = getInfoFromFiles(opts.files, {
        compilerOptions: {
            rootDir: opts.srcRoot
        }
    });

    const builder = new FileBuilder(info, opts.srcRoot);
    return builder.getFileForWrite().write();
}

class ImportsBuilder {
    private importByFileName: { [fileName: string]: ImportDefinition; } = {};

    constructor(private srcRoot: string) {
    }

    getAll() {
        return Object.keys(this.importByFileName).map(key => this.importByFileName[key]);
    }

    getOrCreateImport(file: FileDefinition) {
        if (this.importByFileName[file.fileName] == null) {
            this.importByFileName[file.fileName] = this.createImport(file);
        }

        return this.importByFileName[file.fileName];
    }

    private createImport(file: FileDefinition) {
        const moduleSpecifier = getModuleSpecifier({ fileName: file.fileName, srcRoot: this.srcRoot })
        return createImport({
            moduleSpecifier
        });
    }
}

class TypeAliasBuilder {
    private typesByImportName: { [name: string]: TypeAliasDefinition; } = {};

    constructor(private definitionContainer: DefinitionContainer) {
    }

    getAll() {
        return Object.keys(this.typesByImportName).map(key => this.typesByImportName[key]);
    }

    getOrAddType(importName: string, def: ClassDefinition) {
        if (this.typesByImportName[importName] == null) {
            this.typesByImportName[importName] = this.createType(importName, def);
            this.typesByImportName[importName].typeExpression.text = this.getTypeExpression(def);
        }

        return this.typesByImportName[importName];
    }

    private createType(importName: string, def: ClassDefinition) {
        return createTypeAlias({
            name: importName + "Type",
            type: ""
        });
    }

    private getTypeExpression(def: ClassDefinition) {
        let typeStr = "{ ";
        def.properties.forEach(p => {
            // simple for now
            typeStr += p.name + (p.isOptional ? "?" : "") + ": ";

            if (p.typeExpression.types.length === 1) {
                const defWithNamespace = this.definitionContainer.getByDefinition(p.typeExpression.types[0].definitions[0] as ClassDefinition);

                if (defWithNamespace != null) {
                    typeStr += this.getOrAddType(defWithNamespace.importName, defWithNamespace.def).name;
                }
                else {
                    typeStr += p.typeExpression.text;
                }
            }
            else {
                throw new Error("Not implemented");
            }

            typeStr += "; ";
        });
        typeStr += "}";
        return typeStr;
    }
}

class DefinitionContainer {
    private defsWithNamespace: { importName: string; def: ClassDefinition; namespace: NamespaceDefinition; }[] = [];

    getAll() {
        return this.defsWithNamespace;
    }

    getByDefinition(def: ClassDefinition) {
        for (let i = 0; i < this.defsWithNamespace.length; i++) {
            if (this.defsWithNamespace[i].def === def) {
                return this.defsWithNamespace[i];
            }
        }

        return null;
    }

    contains(def: ClassDefinition) {
        return this.defsWithNamespace.map(n => n.def).indexOf(def) >= 0;
    }

    add(defWithNamespace: { importName: string; def: ClassDefinition; namespace: NamespaceDefinition; }) {
        this.defsWithNamespace.push(defWithNamespace);
    }
}

class FileBuilder {
    private fileForWrite = createFile();
    private aliasCount = 0;
    private importsBuilder: ImportsBuilder;
    private definitionContainer = new DefinitionContainer();
    private typeAliasBuilder: TypeAliasBuilder;

    constructor(private info: GlobalDefinition, srcRoot: string) {
        this.typeAliasBuilder = new TypeAliasBuilder(this.definitionContainer);
        this.importsBuilder = new ImportsBuilder(srcRoot);
        this.handleFileExports();
        this.writeCreateFunctions();
        this.addTypeAliases();
        this.addImports();
        this.addObjectAssign();
    }

    getFileForWrite() {
        return this.fileForWrite;
    }

    private writeCreateFunctions() {
        this.definitionContainer.getAll().forEach(defWithNamespace => {
            const {importName, def, namespace} = defWithNamespace;
            const typeAliasDef = this.typeAliasBuilder.getOrAddType(importName, def);

            namespace.addFunctions({
                name: "create",
                isExported: true,
                parameters: [{ name: "obj", type: typeAliasDef.name }],
                onWriteFunctionBody: writer => {
                    writer.writeLine(`const o = new ${importName}();`);
                    writer.writeLine(`objectAssign(o, obj);`);
                    def.properties.forEach(p => {
                        if (p.typeExpression.types.length === 1) {
                            const defWithNamespace = this.definitionContainer.getByDefinition(p.typeExpression.types[0].definitions[0] as ClassDefinition);

                            if (defWithNamespace != null) {
                                writer.writeLine(`o.${p.name} = ${this.getFullNamespacePath(defWithNamespace.namespace)}.create(obj.${p.name});`);
                            }
                        }
                    });
                    writer.writeLine("return o;");
                }
            });
        });
    }

    private getFullNamespacePath(namespaceDef: NamespaceDefinition) {
        const namespaces = this.fileForWrite.getNamespacesToDefinition(namespaceDef);
        return namespaces.map(n => n.name).join(".") + "." + namespaceDef.name;
    }

    private handleFileExports() {
        this.info.files.forEach(file => {
            const importDef = this.importsBuilder.getOrCreateImport(file);

            file.getExports().forEach(def => {
                if (def.isClassDefinition() && (def.isNamedExportOfFile || def.isDefaultExportOfFile) && !this.hasDefBeenHandled(def)) {
                    this.handleDefinition(def, importDef);
                }
            });
        });
    }

    private hasDefBeenHandled(def: ClassDefinition) {
        return this.definitionContainer.contains(def);
    }

    private handleDefinition(def: ClassDefinition, importDef: ImportDefinition) {
        const importName = def.name + (++this.aliasCount);

        importDef.addNamedImports({
            name: def.isNamedExportOfFile ? def.name : "default",
            alias: importName
        });

        const moduleForDef = getChildNamespaceFromModuleSpecifier(this.fileForWrite, importDef.moduleSpecifier);

        moduleForDef.addNamespaces({
            name: def.name,
            isExported: true
        });

        this.definitionContainer.add({
            importName,
            def: def,
            namespace: moduleForDef.namespaces[moduleForDef.namespaces.length - 1]
        });

        this.handleDefinitionTypes(def);
    }

    private handleDefinitionTypes(definition: ExportableDefinitions) {
        const typeExpressionDefinitions: TypeExpressionedDefinition[] = [];

        if (definition.isClassDefinition() || definition.isInterfaceDefinition()) {
            typeExpressionDefinitions.push(...definition.properties);
        }

        typeExpressionDefinitions.forEach(d => {
            d.typeExpression.types.forEach(t => {
                t.definitions.forEach(def => {
                    if (def.isClassDefinition()) {
                        const file = this.info.getFileOfDefinition(def);
                        const importDef = this.importsBuilder.getOrCreateImport(file);

                        if (!this.hasDefBeenHandled(def)) {
                            this.handleDefinition(def, importDef);
                        }
                    }
                });
            });
        });
    }

    private addTypeAliases() {
        this.fileForWrite.typeAliases.push(...this.typeAliasBuilder.getAll());
    }

    private addImports() {
        this.fileForWrite.imports.push(...this.importsBuilder.getAll());
    }

    private addObjectAssign() {
        this.fileForWrite.addFunctions({
            name: "objectAssign",
            parameters: [{ name: "a" }, { name: "b" }],
            onWriteFunctionBody: (writer) => {
                writer.write("Object.keys(b).forEach(key => a[key] = b[key]);")
            }
        });
    }
}

function getChildNamespaceFromModuleSpecifier(currentDef: ModuledDefinition, moduleSpecifier: string): ModuledDefinition {
    moduleSpecifier = moduleSpecifier.replace(/^\.?[/\\]*/, "");
    const hasDir = /[\\/]/.test(moduleSpecifier);

    if (hasDir) {
        const currentDir = /^[^\\/]+/.exec(moduleSpecifier)[0];

        currentDef = getNamespaceFromName(currentDef, getValidNameFromPath(currentDir));
        moduleSpecifier = moduleSpecifier.replace(/^[^\\/]+[\\/]/, "");

        return getChildNamespaceFromModuleSpecifier(currentDef, moduleSpecifier);
    }
    else {
        return currentDef;
    }
}

function getNamespaceFromName(currentDef: ModuledDefinition, name: string) {
    let namespaceDef = currentDef.getNamespace(name);

    if (namespaceDef == null) {
        currentDef.addNamespaces({
            name: name,
            isExported: true
        });
        namespaceDef = currentDef.namespaces[currentDef.namespaces.length - 1];
    }

    return namespaceDef;
}
