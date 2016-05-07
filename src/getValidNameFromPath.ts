import * as path from "path";

export function getValidNameFromPath(fileName: string) {
    // get file name from absolute or relative path
    fileName = removeExtension(path.basename(fileName || ""));
    let finalName = "";
    let shouldUpperCaseNext = true;

    for (let i = 0; i < fileName.length; i++) {
        let isLetterOrNumber = /[a-z0-9]/i.test(fileName[i]);

        if (isLetterOrNumber) {
            finalName += shouldUpperCaseNext ? fileName[i].toUpperCase() : fileName[i];
        }

        shouldUpperCaseNext = !isLetterOrNumber;
    }

    return finalName;
}

function removeExtension(fileName: string) {
    const extName = path.extname(fileName);
    return fileName.substring(0, fileName.length - extName.length);
}
