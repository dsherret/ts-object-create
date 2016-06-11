import {GlobalDefinition, BasePropertyDefinition, ExportableDefinitions, ClassConstructorParameterDefinition} from "ts-type-info";
import {DefinitionInfo, SupportedDefinitions} from "./DefinitionInfo";

export interface DefinitionTypeInfo {
    definition: SupportedDefinitions;
    propertyDependencies: { [name: string]: DefinitionInfo; };
    properties: (ClassConstructorParameterDefinition | BasePropertyDefinition)[];
}

export class DefinitionTypeInfoBuilder {
    private defs: (DefinitionTypeInfo)[];

    constructor(private info: GlobalDefinition) {
    }

    getDefinitionTypeInfos() {
        const exportDefs = this.getFileExports();
        this.defs = [];

        exportDefs.forEach(d => this.handleExport(d));

        return this.defs;
    }

    private handleExport(def: ExportableDefinitions) {
        if (def.isClassDefinition() || def.isInterfaceDefinition()) {
            this.createOrGetDefinitionInfo(def);
        }
        else if (def.isNamespaceDefinition()) {
            def.getExports().forEach(exportDef => this.handleExport(exportDef));
        }
    }

    private getFileExports() {
        return this.info.files.map(f => f.getExports()).reduce((a, b) => a.concat(b));
    }

    private createOrGetDefinitionInfo(def: SupportedDefinitions) {
        let defInfo = this.getDefinitionInfoIfExists(def);
        if (defInfo == null) {
            defInfo = {
                definition: def,
                propertyDependencies: {},
                properties: []
            };
            this.defs.push(defInfo);
            defInfo.properties = [];

            if (def.isClassDefinition()) {
                defInfo.properties.push(...def.getPropertiesAndConstructorParameters());
            }
            else if (def.isInterfaceDefinition()) {
                defInfo.properties.push(...def.properties);
            }

            defInfo.properties.forEach(p => {
                this.getPropertyDependencyDefinitions(p).forEach(propTypeDef => {
                    defInfo.propertyDependencies[p.name] = this.createOrGetDefinitionInfo(propTypeDef) as DefinitionInfo;
                });
            });
        }

        return defInfo;
    }

    private getDefinitionInfoIfExists(def: SupportedDefinitions) {
        for (let i = 0; i < this.defs.length; i++) {
            if (this.defs[i].definition === def) {
                return this.defs[i];
            }
        }

        return null;
    }

    private getPropertyDependencyDefinitions(property: BasePropertyDefinition | ClassConstructorParameterDefinition): SupportedDefinitions[] {
        const propertyDependencies: SupportedDefinitions[] = [];
        property.type.getAllDefinitions().forEach(def => {
            if (def.isClassDefinition() || def.isInterfaceDefinition()) {
                propertyDependencies.push(def);
            }
        });
        return propertyDependencies;
    }
}
