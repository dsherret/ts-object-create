import {ClassDefinition, BaseDefinition, GlobalDefinition, InterfaceDefinition, BasePropertyDefinition} from "ts-type-info";
import {DefinitionInfo, SupportedDefinitions} from "./DefinitionInfo";

export interface DefinitionTypeInfo {
    definition: SupportedDefinitions;
    propertyDependencies: { [name: string]: DefinitionInfo; };
}

export class DefinitionTypeInfoBuilder {
    private defs: (DefinitionTypeInfo)[];

    constructor(private info: GlobalDefinition) {
    }

    getDefinitionTypeInfos() {
        const exportDefs = this.getFileExports();
        this.defs = [];

        exportDefs.forEach(d => {
            if (d.isClassDefinition() || d.isInterfaceDefinition()) {
                this.createOrGetDefinitionInfo(d)
            }
        });

        return this.defs;
    }

    private getFileExports() {
        return this.info.files.map(f => f.getExports()).reduce((a, b) => a.concat(b));
    }

    private createOrGetDefinitionInfo(def: SupportedDefinitions) {
        let defInfo = this.getDefinitionInfoIfExists(def);
        if (defInfo == null) {
            defInfo = {
                definition: def,
                propertyDependencies: {}
            };
            this.defs.push(defInfo);
            def.properties.forEach(p => {
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

    private getPropertyDependencyDefinitions(property: BasePropertyDefinition): SupportedDefinitions[] {
        const propertyDependencies: SupportedDefinitions[] = [];
        property.typeExpression.types.forEach(t => {
            t.definitions.forEach(def => {
                if (def.isClassDefinition() || def.isInterfaceDefinition()) {
                    propertyDependencies.push(def);
                }
            });
        });
        return propertyDependencies;
    }
}
