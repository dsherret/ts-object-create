export interface GenerateCodeOptions {
    files: string[];
    srcRoot: string;
}

export function getGeneratedCode(opts: GenerateCodeOptions): string;
