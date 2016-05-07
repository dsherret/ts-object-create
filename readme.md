TsObjectCreate
==============

[![Build Status](https://travis-ci.org/dsherret/ts-object-create.svg)](https://travis-ci.org/dsherret/ts-object-create)
[![Coverage Status](https://coveralls.io/repos/dsherret/ts-object-create/badge.svg?branch=master&service=github)](https://coveralls.io/github/dsherret/ts-object-create?branch=master)
[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

This is a very experimental library that uses code generation to create methods for creating objects. **Currently it doesn't work in many scenarios so just don't use this yet.**

## Example

### Setup

Say you have some classes like this:

```typescript
// ./src/classes.ts
export class Main {
    name: string;
    other: Other;
}

export class Other {
    prop: string;
}
```

You could generate some code based on these classes:

```typescript
import * as fs from "fs";

const code = getGeneratedCode({
    srcRoot: "./src"
    files: ["./src/classes.ts"]
});

fs.writeFile("./src/objectFactory.ts", code);
```

### Use

Then this would allow you to do the following:

```typescript
// ./src/main.ts
import * as objectFactory from "./objectFactory";
import {Other, Main} from "./classes";

const main = objectFactory.Classes.Main.create({
    name: "my name",
    other: {
        prop: "my prop string"
    }
});

main instanceof Main;        // true
main.other instanceof Other; // true

const json = JSON.stringify(obj);
const obj = JSON.parse(json);

const newMain = objectFactory.Classes.Main.create(obj);

newMain instanceof Main;        // true
newMain.other instanceof Other; // true
```
