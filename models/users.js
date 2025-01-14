import {
    conn,
    DataTypes
} from "./connection.js";


const User = conn.define('users', {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    role: { 
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    timestamps: false,
    createdAt: false,
    updatedAt: false
});

export default User;

conn.sync().then(() => {
    console.log("tabel User ok");
}).catch(err => {
    console.log("tabel User tidak Connect");
});