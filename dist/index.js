"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.Connection = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sequelize_1 = __importDefault(require("sequelize"));
const js_logger_1 = __importDefault(require("js-logger"));
js_logger_1.default.useDefaults();
const db = {};
exports.db = db;
class Connection {
    constructor() {
        this.db = (databaseUrl, options = {}, pathModels) => {
            if (typeof databaseUrl !== "string") {
                throw new Error("Database url is required");
            }
            const arr = __dirname.split("/");
            arr.reverse().splice(0, 3, ...pathModels.split("/").reverse());
            const dirname = arr.reverse().join("/");
            const fileName = dirname + "/index.js";
            const basename = path_1.default.basename(fileName);
            const sequelize = new sequelize_1.default(databaseUrl, options);
            fs_1.default.readdirSync(dirname)
                .filter((file) => {
                if (file.includes("."))
                    return null;
                return fs_1.default.readdirSync(`${dirname}/${file}`).filter((filteredFile) => {
                    return (filteredFile.includes(".") &&
                        filteredFile === basename &&
                        filteredFile.slice(-3) === ".js");
                });
            })
                .forEach((file) => {
                const model = sequelize.import(path_1.default.join(dirname, file));
                db[model.name] = model;
            });
            Object.keys(db).forEach((modelName) => {
                if (db[modelName].associate) {
                    db[modelName].associate(db);
                }
            });
            sequelize
                .authenticate()
                .then(() => js_logger_1.default.info("[postgres] Connection established successfully."))
                .catch((error) => {
                js_logger_1.default.error("[postgres] Unable to connect to the database: ");
                js_logger_1.default.error(error);
            });
            db.sequelize = sequelize;
            db.Sequelize = sequelize_1.default;
            return db;
        };
    }
}
exports.Connection = Connection;
