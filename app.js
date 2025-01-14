import express from "express";
import Items from "./models/items.js";
import Users from "./models/users.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
const hostnama = "127.0.0.1";
const port = 3000;


app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());



app.get('/login', (req, res) => {
    res.render("login", {
        msg: ""
    });
})

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    Users.findOne({ where: { username: username, password: password } })
    .then(result => {
        if (result) {
            const { role } = result;  // Ambil role dari hasil query
            console.log("Role yang didapat dari database:", role); // Debugging
            const token = jwt.sign(
                { username: username, role: role }, // Tambahkan role di payload
                JWT_SECRET, 
                { expiresIn: "1h" }
            );
            console.log("Token yang dikirim:", token); // Debugging token
            res.cookie("token", token, { httpOnly: true });  // Simpan token di cookie
            res.redirect("/");
        } else {
            res.render("login", { msg: "Username dan password salah" });
        }
    }).catch(err => {
        res.render("login", { msg: err });
    });
});

app.get('/logout', (req, res) => {
    res.clearCookie("token", { httpOnly: true });
    res.redirect("/");
})

const authToken = (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.redirect("/login");
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET); // Decode token
        console.log("Decoded Token:", decoded); // Debugging: pastikan ada role
        req.user = decoded;  // Simpan decoded token di req.user
        next();
    } catch (err) {
        res.clearCookie("token", { httpOnly: true });
        return res.redirect("/login");
    }
};





app.get("/", authToken, (req, res) => {
    let hasil;
    console.log("User yang login:", req.user); // Tambahkan log ini untuk debug
    Items.findAll()
        .then(result => {
            hasil = { "status": 200, "error": null, "response": result };
            res.render("index", { barang: hasil.response, user: req.user }); // Kirim objek user
        })
        .catch(err => {
            hasil = { "status": 500, "error": err, "response": null };
            res.render("index", { barang: hasil.response, user: null });
        });
});


app.get("/tambah", authToken, (req, res) => {
    res.render("addData");
})


app.get("/edit/:id", authToken, (req, res) => {
    let hasil;
    const id = req.params.id;
    Items.findOne({
            where: {
                id: id
            }
        })
        .then(result => {
            hasil = { "status": 200, "error": null, "response": result };
            if (result != null) {
                res.render("editData", {
                    barang: hasil.response
                });
            } else {
                res.redirect("/");
            }
        })
        .catch(err => {
            res.redirect("/");
        })
})


app.post("/api/items", authToken, (req, res) => {
    const { nama, stok, harga, keterangan } = req.body;
    Items.create({
            nama,
            stok,
            harga,
            keterangan
        })
        .then(result => {
            res.send(JSON.stringify({ "status": 200, "error": null, "response": result }));
        })
        .catch(err => {
            res.send(JSON.stringify({ "status": 500, "error": err, "response": console.log("gagal menambah data") }));
        })
});


app.put("/api/items/:id", (req, res) => {
    const { nama, stok, harga, keterangan } = req.body;
    const id = req.params.id;
    Items.update({
            nama, stok, harga, keterangan
        }, {
            where: {
                id: id
            }
        })
        .then(result => {
            res.send(JSON.stringify({
                "status": 200,
                "error": null,
                "response": result
            }));
        })
        .catch(err => {
            res.send(JSON.stringify({
                "status": 500,
                "error": err,
                "response": console.log("gagal mengedit data")
            }));
        })
});


app.delete("/api/items/:id", authToken, (req, res) => {
    const id = req.params.id;
    Items.destroy({
            where: {
                id: id
            }
        })
        .then(result => {
            res.send(JSON.stringify({
                "status": 200,
                "error": null,
                "response": result
            }));
        })
        .catch(err => {
            res.send(JSON.stringify({
                "status": 500,
                "error": err,
                "response": console.log("gagal menghapus data")
            }));
        })
});


app.get("/sewa", authToken, (req, res) => {
    let hasil;
    console.log("User yang login:", req.user); // Tambahkan log ini untuk debug
    Items.findAll()
        .then(result => {
            hasil = { "status": 200, "error": null, "response": result };
            res.render("index", { barang: hasil.response, user: req.user }); // Kirim objek user
        })
        .catch(err => {
            hasil = { "status": 500, "error": err, "response": null };
            res.render("index", { barang: hasil.response, user: null });
        });
});

app.get("/sewa/:id", authToken, (req, res) => {
    const id = req.params.id; // Ambil ID dari parameter URL
    Items.findAll({
        where: {
            id: id
        }
    })
    .then(result => {
        if (result) {
            res.render("sewa", {
                barang: result, // Data barang berdasarkan ID
                user: req.user  // Data pengguna yang sedang login
            });
        } else {
            res.status(404).send("Item not found"); // Item tidak ditemukan
        }
    })
    .catch(err => {
        res.status(500).send("Internal Server Error");
    });
});


app.listen(port, hostnama, () => {
    console.log(`Server running at ${hostnama}:${port}`);
});