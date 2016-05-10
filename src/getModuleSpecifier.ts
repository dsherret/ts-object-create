export function getModuleSpecifier(opts: { srcRoot: string; fileName: string; }) {
    const removeSlashAtBeginning = (str: string) => str.replace(/^\.?[\\\/]/, "");
    const standardizeSlashes = (str: string) => str.replace(/\\/g, "/");
    let {srcRoot, fileName} = opts;

    srcRoot = standardizeSlashes(removeSlashAtBeginning(srcRoot));
    fileName = standardizeSlashes(removeSlashAtBeginning(fileName));

    if (fileName.indexOf(srcRoot) === 0) {
        fileName = fileName.substr(srcRoot.length);
    }

    fileName = "./" + removeSlashAtBeginning(fileName);
    fileName = fileName.replace(/\.ts$/, "");

    return fileName;
}
