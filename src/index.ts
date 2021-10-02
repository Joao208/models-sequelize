import fs from "fs";
import path from "path";
import Sequelize from "sequelize";
import logger from "js-logger";

logger.useDefaults();

const db = {};

class Connection {
  db = (
    databaseUrl: string,
    options: object = {},
    pathModels: string
  ): object => {
    if (typeof databaseUrl !== "string") {
      throw new Error("Database url is required");
    }

    const arr = __dirname.split("/");
    arr.reverse().splice(0, 3, ...pathModels.split("/").reverse());

    const dirname = arr.reverse().join("/");
    const fileName = dirname + "/index.js";

    const basename = path.basename(fileName);

    // @ts-ignore
    const sequelize = new Sequelize(databaseUrl, options);

    fs.readdirSync(dirname)
      .filter((file) => {
        if (file.includes(".")) return null;
        return fs.readdirSync(`${dirname}/${file}`).filter((filteredFile) => {
          return (
            filteredFile.includes(".") &&
            filteredFile === basename &&
            filteredFile.slice(-3) === ".js"
          );
        });
      })
      .forEach((file) => {
        const model = sequelize.import(path.join(dirname, file));
        db[model.name] = model;
      });

    Object.keys(db).forEach((modelName) => {
      if (db[modelName].associate) {
        db[modelName].associate(db);
      }
    });

    sequelize
      .authenticate()
      .then((): void =>
        logger.info("[postgres] Connection established successfully.")
      )
      .catch((error: string): void => {
        logger.error("[postgres] Unable to connect to the database: ");
        logger.error(error);
      });

    //@ts-ignore
    db.sequelize = sequelize;
    //@ts-ignore
    db.Sequelize = Sequelize;

    return db;
  };
}

export { Connection, db };
