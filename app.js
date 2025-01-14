import express from "express";
import Items from "./models/items.js";
import Users from "./models/users.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import Requests from "./models/requests.js";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
const hostnama = "127.0.0.1";
const port = 3000;


app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // Add 'extended' option
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




app.get("/", authToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Items.findAndCountAll({
            limit: limit,
            offset: offset,
            order: [['id', 'ASC']]
        });

        const totalPages = Math.ceil(count / limit);

        res.render("index", { 
            barang: rows,
            user: req.user,
            activeMenu: 'home',
            pagination: {
                current: page,
                total: totalPages,
                totalItems: count
            }
        });
    } catch (err) {
        console.error(err);
        res.render("index", { 
            barang: [],
            user: req.user,
            activeMenu: 'home',
            pagination: {
                current: 1,
                total: 1,
                totalItems: 0
            }
        });
    }
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


app.get("/sewa", authToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Items.findAndCountAll({
            limit: limit,
            offset: offset,
            order: [['id', 'ASC']]
        });

        const totalPages = Math.ceil(count / limit);

        res.render("sewa", { 
            barang: rows,
            user: req.user,
            activeMenu: 'sewa',
            pagination: {
                current: page,
                total: totalPages,
                totalItems: count
            }
        });
    } catch (err) {
        console.error(err);
        res.render("sewa", { 
            barang: [],
            user: req.user,
            activeMenu: 'sewa',
            pagination: {
                current: 1,
                total: 1,
                totalItems: 0
            }
        });
    }
});

app.get("/sewa/:id", authToken, (req, res) => {
    const id = req.params.id; // Ambil ID dari parameter URL
    Items.findOne({
        where: {
            id: id
        }
    })
    .then(result => {
        if (result) {
            res.render("sewaDetail", {
                barang: result, // Data barang berdasarkan ID
                user: req.user,  // Data pengguna yang sedang login
                activeMenu: 'sewa'  // Add this line
            });
        } else {
            res.status(404).send("Item not found"); // Item tidak ditemukan
        }
    })
    .catch(err => {
        res.status(500).send("Internal Server Error");
    });
});

// Route to handle rental requests
app.post("/api/request", authToken, async (req, res) => {
    try {
        const { itemId } = req.body;
        console.log("Request body:", req.body);
        console.log("User info:", req.user);
        
        // Get user ID from database based on username
        const user = await Users.findOne({ where: { username: req.user.username } });
        if (!user) {
            return res.status(400).send("User not found");
        }

        const request = await Requests.create({
            itemId: itemId,
            userId: user.id,
            status: "Pending"
        });
        
        console.log("Request created:", request);
        res.status(200).send("Request created successfully");
    } catch (err) {
        console.error("Error creating request:", err);
        res.status(500).send("Failed to create request");
    }
});

// Route to view all rental requests (admin only)
app.get("/admin/requests", authToken, async (req, res) => {
    try {
        if (req.user.role !== "Admin") {
            return res.status(403).send("Forbidden");
        }

        const requests = await Requests.findAll({
            include: [
                { 
                    model: Items,
                    as: 'Item'  // Add alias to match the view
                },
                { 
                    model: Users,
                    as: 'User'  // Add alias to match the view
                }
            ]
        });

        console.log("Fetched requests:", JSON.stringify(requests, null, 2)); // Detailed logging
        res.render("adminRequests", { 
            requests: requests,
            user: req.user,
            activeMenu: 'requests'
        });
    } catch (err) {
        console.error("Error fetching requests:", err);
        res.status(500).send("Failed to fetch requests");
    }
});

// Route to approve a rental request
app.post("/api/request/:id/approve", authToken, (req, res) => {
    if (req.user.role !== "Admin") {
        return res.status(403).send("Forbidden");
    }
    const id = req.params.id;
    Requests.update({ status: "Approved" }, { where: { id } })
        .then(result => {
            res.status(200).send("Request approved");
        })
        .catch(err => {
            console.error("Failed to approve request:", err); // Debugging: log error
            res.status(500).send("Failed to approve request");
        });
});

// Route to reject a rental request
app.post("/api/request/:id/reject", authToken, (req, res) => {
    if (req.user.role !== "Admin") {
        return res.status(403).send("Forbidden");
    }
    const id = req.params.id;
    Requests.update({ status: "Rejected" }, { where: { id } })
        .then(result => {
            res.status(200).send("Request rejected");
        })
        .catch(err => {
            console.error("Failed to reject request:", err); // Debugging: log error
            res.status(500).send("Failed to reject request");
        });
});

// Route to view user's rental history
app.get("/user/history", authToken, async (req, res) => {
    try {
        const user = await Users.findOne({ where: { username: req.user.username } });
        if (!user) {
            return res.status(400).send("User not found");
        }

        const requests = await Requests.findAll({
            where: { userId: user.id },
            include: [
                { 
                    model: Items,
                    as: 'Item'
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.render("userHistory", { 
            requests: requests,
            user: req.user,
            activeMenu: 'history'
        });
    } catch (err) {
        console.error("Error fetching user history:", err);
        res.status(500).send("Failed to fetch history");
    }
});

app.listen(port, hostnama, () => {
    console.log(`Server running at ${hostnama}:${port}`);
});