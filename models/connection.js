import {
    Sequelize,
    DataTypes
} from "sequelize";

const conn = new Sequelize("mobil", "root", "", {
    host: "localhost",
    dialect: 'mysql',
})

conn.authenticate().then(() => {
    console.log("koneksi berhasil");
}).catch(err => {
    console.log("coba lagi");
});

export {
    conn,
    DataTypes
}