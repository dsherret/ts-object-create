import {createFile, getInfoFromFiles} from "ts-type-info";
import {DefinitionInfo} from "./DefinitionInfo";
import {DefinitionTypeInfoBuilder} from "./DefinitionTypeInfoBuilder";
import {DefinitionFileInfoFiller} from "./DefinitionFileInfoFiller";
import {NamespaceForCreateFiller} from "./NamespaceForCreateFiller";
import {ImportsBuilder} from "./ImportsBuilder";
import {TypeAliasBuilder} from "./TypeAliasBuilder";
import {FunctionForCreateFiller} from "./FunctionForCreateFiller";

export interface GenerateCodeOptions {
    files: string[];
    srcRoot: string;
}

// todo: needs a code refactoring still

export function getGeneratedCode(opts: GenerateCodeOptions) {
    const info = getInfoFromFiles(opts.files, {
        compilerOptions: {
            rootDir: opts.srcRoot
        }
    });
    const defInfos = new DefinitionTypeInfoBuilder(info).getDefinitionTypeInfos() as DefinitionInfo[];
    const defFileInfoFiller = new DefinitionFileInfoFiller(info);
    const importsBuilder = new ImportsBuilder(opts.srcRoot);
    const namespaceForCreateFiller = new NamespaceForCreateFiller();
    const typeAliasBuilder = new TypeAliasBuilder();
    const functionFiller = new FunctionForCreateFiller();

    defInfos.forEach(d => {
        defFileInfoFiller.fillDefinitionFileInfo(d);
    });

    defInfos.forEach(d => {
        d.importDef = importsBuilder.getOrCreateImport(d);
        namespaceForCreateFiller.fillNamespaceForCreate(d);
        d.typeAliasDef = typeAliasBuilder.getOrCreate(d);
        functionFiller.fillFunction(d);
    });

    const fileForWrite = createFile();
    fileForWrite.imports = importsBuilder.getAll();
    fileForWrite.typeAliases = typeAliasBuilder.getAll();
    fileForWrite.namespaces = namespaceForCreateFiller.getAllNamespaces();
    fileForWrite.typeAliases.forEach((def, i) => fileForWrite.setOrderOfMember(i, def));

    fileForWrite.addFunction({
        name: "objectAssign",
        parameters: [{ name: "a" }, { name: "b" }],
        onWriteFunctionBody: (writer) => {
            writer.write("Object.keys(b).forEach(key => a[key] = b[key]);");
        }
    });

    return fileForWrite.write();
}
