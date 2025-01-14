import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Items from "./items.js";
import Users from "./users.js";

const Requests = sequelize.define("requests", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    itemId: {
        type: DataTypes.INTEGER
    },
    userId: {
        type: DataTypes.INTEGER
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: "Pending"
    }
}, {
    tableName: 'requests'
});

Requests.belongsTo(Items, { 
    foreignKey: 'itemId',
    as: 'Item'
});

Requests.belongsTo(Users, { 
    foreignKey: 'userId',
    as: 'User'
});

export default Requests;
