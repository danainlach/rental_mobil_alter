import { Sequelize } from "sequelize";
import sequelize from "../config/database.js";
import Users from "./users.js";

const Messages = sequelize.define("messages", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    senderId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    receiverId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    message: {
        type: Sequelize.TEXT,
        allowNull: false
    }
});

Messages.belongsTo(Users, { as: 'Sender', foreignKey: 'senderId' });
Messages.belongsTo(Users, { as: 'Receiver', foreignKey: 'receiverId' });

export default Messages;
