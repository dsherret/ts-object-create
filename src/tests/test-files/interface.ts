export class Main {
    name: string;
    other: Other;
}

export interface Other {
    prop: string;
    main: Main;
}
