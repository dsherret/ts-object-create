export interface GenerateCodeOptions {
    files: string[];
    srcRoot: string;
    distRoot: string;
}

export function getGeneratedCode(opts: GenerateCodeOptions): string;
