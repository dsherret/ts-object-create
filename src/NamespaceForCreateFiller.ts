import {NamespaceDefinition, ModuledDefinition, createFile, ClassDefinition, InterfaceDefinition} from "ts-type-info";
import {DefinitionInfo} from "./DefinitionInfo";
import {getValidNameFromPath} from "./getValidNameFromPath";

export interface NamespaceForCreate {
    namespaceDef: NamespaceDefinition;
    namespacePath: string;
}

type SupportedDefinitions = ClassDefinition | InterfaceDefinition;

export class NamespaceForCreateFiller {
    private fileDefinition = createFile();

    fillNamespaceForCreate(defInfo: DefinitionInfo) {
        const fileNamespace = this.getNamespaceFromModuleSpecifier(defInfo.importDef.moduleSpecifier, this.fileDefinition) as NamespaceDefinition;
        const parentNamespace = this.getNamespaceBasedOnParentNamespaceInFile(fileNamespace, defInfo);
        parentNamespace.addNamespaces({
            name: defInfo.definition.name,
            isExported: true
        });
        defInfo.namespaceDef = parentNamespace.namespaces[parentNamespace.namespaces.length - 1];
        // todo: refactor to not use getNamespacesToDefinition (performance reasons)
        // todo: refactor out the join to get the namespace path since this is done elsewhere
        defInfo.namespacePath = this.fileDefinition.getNamespacesToDefinition(defInfo.namespaceDef).map(n => n.name).join(".") + "." + defInfo.namespaceDef.name;
    }

    getAllNamespaces() {
        return this.fileDefinition.namespaces;
    }

    private getNamespaceFromModuleSpecifier(moduleSpecifier: string, currentDef: ModuledDefinition): ModuledDefinition {
        moduleSpecifier = moduleSpecifier.replace(/^\.?[/\\]*/, "");
        const hasDir = /[\\/]/.test(moduleSpecifier);

        if (hasDir) {
            const currentDir = /^[^\\/]+/.exec(moduleSpecifier)[0];

            currentDef = this.getNamespaceFromName(currentDef, getValidNameFromPath(currentDir));
            moduleSpecifier = moduleSpecifier.replace(/^[^\\/]+[\\/]/, "");

            return this.getNamespaceFromModuleSpecifier(moduleSpecifier, currentDef);
        }
        else {
            return this.getNamespaceFromName(currentDef, getValidNameFromPath(moduleSpecifier));
        }
    }

    private getNamespaceBasedOnParentNamespaceInFile(fileNamespace: NamespaceDefinition, defInfo: DefinitionInfo) {
        const namespaces = defInfo.fileDefinition.getNamespacesToDefinition(defInfo.definition);
        let currentNamespace = fileNamespace;

        namespaces.forEach(n => {
            currentNamespace = this.getNamespaceFromName(currentNamespace, n.name);
        });

        return currentNamespace;
    }

    private getNamespaceFromName(currentDef: ModuledDefinition, name: string) {
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
}
