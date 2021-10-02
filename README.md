# models-sequelize

> Sequelize configuration library

## Usage

To connect to the database it is necessary to pass a database url along with two other parameters, options and path, which are respectively the options for connecting to sequelize and the path where the models are located `src/app/models`, `src/models`, `models`...
See the example:

When connection is established you see this message:

`[postgres] Connection established successfully.`

```js
const { Connection, db } = require("models-sequelize");

// databaseUrl is url of database
// options is options of sequelize connection
// path of models
new Connection().db(databaseUrl, options, path);

console.log(db); // db instance

const users = await db.User.findAll();

console.log(users); // all users of database
```
