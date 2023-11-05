# Prisma Models Graph Generator

> This generator was bootstraped using [create-prisma-generator](https://github.com/YassinEldeeb/create-prisma-generator)

Generates a bi-directional models graph for schema without strict relationship defined in the schema, works via a custom schema annotation.

## Getting Stared

**1. Install**
npm:

```sh
npm install prisma-models-graph
```

**2. Add the generator to the schema**

```prisma
generator jsonSchema {
  provider = "prisma-models-graph"
}
```

Additional options

```prisma
generator jsonSchema {
  provider = "prisma-models-graph"
  output = "./customOutputs"
  fileName = "custom.json"
}
```

## Usage

- Add custom relation annotation next to the field you want annotate relationship.
- Format: `/// [[<Relation Model>.<Relation Model Attribute>]]` ( <b>The triple slash is important</b> )
- With the above annotation, the generated models graph will be like this:

```js
{
  "users": {
    "attributes": [
      "id",
      "email",
      "name",
      "user_type_id"
    ],
    "relations": [
      {
        "modelName": "posts",
        "condition": "users.id = posts.user_id"
      }
    ]
  },
  "posts": {
    "attributes": [
      "id",
      "subject",
      "body",
      "user_id"
    ],
    "relations": [
      {
        "modelName": "users",
        "condition": "posts.user_id = users.id"
      }
    ]
  }
}
```

- To access the generated models graph, import it from `@generated/models-graph`. The generated models graph will be a _typesafe_ object matching the models declared in `schema.prisma`.

```js
import { ModelsGraph } from '@generated/models-graph'
```

- There are a few helper types available:

```js
import {
  ModelsGraph, // Generated models graph object
  ParsedModel, // Type definition of a singular generated model graph
  ParsedModels, // Type definition of all generated models graph
  ParsedModelRelation, // Type definition of the relation between two models
  ModelNames, // List of all generated models name
} from '@generated/models-graph'
```
