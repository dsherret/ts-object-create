import {ClassDefinition, InterfaceDefinition, ImportDefinition, TypeAliasDefinition} from "ts-type-info";
import {DefinitionTypeInfo} from "./DefinitionTypeInfoBuilder";
import {DefinitionFileInfo} from "./DefinitionFileInfoFiller";
import {NamespaceForCreate} from "./NamespaceForCreateFiller";

export type SupportedDefinitions = ClassDefinition | InterfaceDefinition;

export interface DefinitionInfo extends DefinitionTypeInfo, DefinitionFileInfo, NamespaceForCreate {
    importDef: ImportDefinition;
    typeAliasDef: TypeAliasDefinition;
}
