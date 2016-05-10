export namespace Namespace {
    export class Main {
        name: string;
        other: Other;
    }

    export interface OtherInterface {
        name: string;
    }
}

export class Other {
    prop: string;
    main: Namespace.Main;
}
