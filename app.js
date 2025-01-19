import express from "express";
import { Sequelize, Op } from "sequelize"; // Add Op import
import Items from "./models/items.js";
import Users from "./models/users.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import Requests from "./models/requests.js";
import Messages from "./models/messages.js";
import Notification from "./models/notifications.js"; // Add Notification import
import { sendNotification } from './websocket-server.js'; // Add this import
import multer from "multer";
import { fileURLToPath } from 'url';
import path from 'path';

// Mendapatkan path direktori dari import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


import fs from 'fs'; // Add this import to use the fs module

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
// Menyajikan folder 'uploads' agar gambar dapat diakses
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.get('/register', (req, res) => {
    res.render('register', { 
        msg: '',
        alertType: 'danger'
    });
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if username already exists
        const existingUser = await Users.findOne({ where: { username: username } });
        if (existingUser) {
            return res.render('register', { 
                msg: 'Username already exists',
                alertType: 'danger'
            });
        }

        // Create new user
        await Users.create({
            username: username,
            password: password,
            role: 'User' 
        });

        res.render('login', { 
            msg: 'Registration successful! Please login.',
            alertType: 'success'
        });
        
    } catch (err) {
        console.error('Registration error:', err);
        res.render('register', { 
            msg: 'Error during registration. Please try again.',
            alertType: 'danger'
        });
    }
});

app.get('/login', (req, res) => {
    res.render("login", {
        msg: "",
        alertType: 'danger'
    });
})

// Update login handler
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await Users.findOne({ where: { username, password } });
        if (user) {
            const token = jwt.sign(
                { 
                    username: username, 
                    role: user.role,
                    id: user.id  // Make sure to include user.id
                },
                JWT_SECRET,
                { expiresIn: "1h" }
            );
            res.cookie("token", token, { httpOnly: true });
            res.redirect("/");
        } else {
            res.render("login", { 
                msg: "Username dan password salah",
                alertType: 'danger'
            });
        }
    } catch (err) {
        res.render("login", { 
            msg: err.message,
            alertType: 'danger'
        });
    }
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




// Update all render calls to include user ID
// Example for index route:
app.get("/", authToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 6;
        const offset = (page - 1) * limit;

        const { count, rows } = await Items.findAndCountAll({
            limit: limit,
            offset: offset,
            order: [['id', 'ASC']]
        });

        // Log untuk melihat path gambar
        console.log(rows.map(item => item.gambar)); // Cek path gambar di server

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


// Konfigurasi Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = "./uploads"; // Ensure this points to a proper directory
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir); // Create folder if it doesn't exist
        }
        cb(null, dir); // Specify folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Filename with timestamp
    },
});

const upload = multer({ storage: storage });

// Endpoint untuk menambah item dengan gambar
app.post("/api/items", authToken, upload.single("gambar"), (req, res) => {
    try {
        const { nama, stok, harga, keterangan } = req.body;
        const gambar = req.file ? `/uploads/${req.file.filename}` : null;

        // Validasi input
        if (!nama || !stok || !harga || !keterangan || !gambar) {
            return res.status(400).json({
                status: 400,
                error: "Semua field harus diisi!",
                response: null,
            });
        }

        // Simpan data ke database
        Items.create({
            nama,
            stok,
            harga,
            keterangan,
            gambar,
        })
            .then((result) => {
                res.json({
                    status: 200,
                    error: null,
                    response: result,
                });
            })
            .catch((err) => {
                console.error("Database error:", err);
                res.status(500).json({
                    status: 500,
                    error: err.message,
                    response: null,
                });
            });
    } catch (err) {
        console.error("Unexpected error:", err);
        res.status(500).json({
            status: 500,
            error: err.message,
            response: null,
        });
    }
});

// Melayani file statis dari folder uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Endpoint untuk mengedit data item
app.put("/api/items/:id", upload.single("gambar"), async (req, res) => {
    const { nama, stok, harga, keterangan } = req.body;
    const id = req.params.id;

    try {
        // Cari item yang akan diupdate berdasarkan ID
        const item = await Items.findOne({ where: { id } });

        if (!item) {
            return res.status(404).json({ error: "Item tidak ditemukan" });
        }

        // Cek jika ada file gambar yang diupload
        let gambar = item.gambar; // Default, gunakan gambar lama jika tidak ada file baru

        // Jika ada file baru, simpan gambar dengan path yang benar
        if (req.file) {
            gambar = `/uploads/${req.file.filename}`; // Menambahkan '/uploads/' sebelum nama file
        } else if (gambar && !gambar.startsWith('/uploads/')) {
            // Jika gambar lama tidak diawali dengan '/uploads/', tambahkan prefix
            gambar = `/uploads/${gambar}`;
        }

        // Siapkan data yang akan diupdate
        const updatedData = {
            nama,
            stok: parseInt(stok, 10),
            harga: parseInt(harga, 10),
            keterangan,
            gambar, // Menyimpan path gambar yang baru atau lama dengan prefix '/uploads/'
        };

        // Update item di database
        await item.update(updatedData);

        res.status(200).json({ message: "Item berhasil diperbarui" });
    } catch (err) {
        console.error("Terjadi kesalahan:", err);
        res.status(500).json({ error: "Terjadi kesalahan pada server" });
    }
});

// Endpoint untuk menghapus data item
app.delete("/api/items/:id", authToken, (req, res) => {
    const id = req.params.id;

    Items.destroy({ where: { id: id } })
        .then((result) => {
            res.json({
                status: 200,
                error: null,
                response: result,
            });
        })
        .catch((err) => {
            console.error("Gagal menghapus data:", err);
            res.status(500).json({
                status: 500,
                error: err.message,
                response: null,
            });
        });
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
            user: {
                ...req.user,
                id: req.user.id // Make sure ID is included
            },
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
            user: {
                ...req.user,
                id: req.user.id // Make sure ID is included
            },
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
                user: {
                    ...req.user,
                    id: req.user.id // Make sure ID is included
                },  // Data pengguna yang sedang login
                activeMenu: 'sewa'  
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

        const item = await Items.findByPk(itemId);
        const request = await Requests.create({
            itemId: itemId,
            userId: user.id,
            status: "Pending"
        });
        
        await createAndSendNotification(
            1, // admin ID
            'rental',
            `New rental request from ${user.username} for ${item.nama}`,
            request.id
        );
        
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

        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Requests.findAndCountAll({
            include: [
                { 
                    model: Items,
                    as: 'Item'
                },
                { 
                    model: Users,
                    as: 'User'
                }
            ],
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        const totalPages = Math.ceil(count / limit);

        res.render("adminRequests", { 
            requests: rows,
            user: {
                ...req.user,
                id: req.user.id // Make sure ID is included
            },
            activeMenu: 'requests',
            pagination: {
                current: page,
                total: totalPages,
                totalItems: count,
                limit: limit
            }
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

        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Requests.findAndCountAll({
            where: { userId: user.id },
            include: [
                { 
                    model: Items,
                    as: 'Item'
                }
            ],
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        const totalPages = Math.ceil(count / limit);

        res.render("userHistory", { 
            requests: rows,
            user: {
                ...req.user,
                id: req.user.id // Make sure ID is included
            },
            activeMenu: 'history',
            pagination: {
                current: page,
                total: totalPages,
                totalItems: count,
                limit: limit
            }
        });
    } catch (err) {
        console.error("Error fetching user history:", err);
        res.status(500).send("Failed to fetch history");
    }
});

app.get("/user/chat", authToken, async (req, res) => {
    try {
        const user = await Users.findOne({ where: { username: req.user.username } });
        const messages = await Messages.findAll({
            where: {
                [Op.or]: [ 
                    { senderId: user.id, receiverId: 1 }, 
                    { senderId: 1, receiverId: user.id }
                ]
            },
            order: [['createdAt', 'ASC']]
        });
        
        res.render("userChat", {
            user: {
                ...req.user,
                id: req.user.id // Make sure ID is included
            },
            messages: messages,
            activeMenu: 'chat'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading chat");
    }
});

app.get("/admin/chat/:userId?", authToken, async (req, res) => {
    if (req.user.role !== "Admin") {
        return res.status(403).send("Forbidden");
    }

    try {
        const users = await Users.findAll({
            where: { role: "User" }
        });

        let selectedUser = null;
        let messages = [];

        if (req.params.userId) {
            selectedUser = await Users.findByPk(req.params.userId);
            messages = await Messages.findAll({
                where: {
                    [Op.or]: [ 
                        { senderId: 1, receiverId: req.params.userId },
                        { senderId: req.params.userId, receiverId: 1 }
                    ]
                },
                order: [['createdAt', 'ASC']]
            });
        }

        res.render("adminChat", {
            user: {
                ...req.user,
                id: req.user.id // Make sure ID is included
            },
            users: users,
            selectedUser: selectedUser,
            messages: messages,
            activeMenu: 'chat'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading chat");
    }
});

app.get("/admin/chat/:userId/messages", authToken, async (req, res) => {
    if (req.user.role !== "Admin") {
        return res.status(403).json({ error: "Forbidden" });
    }

    try {
        const messages = await Messages.findAll({
            where: {
                [Op.or]: [
                    { senderId: 1, receiverId: req.params.userId },
                    { senderId: req.params.userId, receiverId: 1 }
                ]
            },
            order: [['createdAt', 'ASC']]
        });

        res.json({ messages });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching messages" });
    }
});

app.post("/api/messages", authToken, async (req, res) => {
    try {
        const { message, receiverId } = req.body;
        const sender = await Users.findOne({ where: { username: req.user.username } });
        
        const newMessage = await Messages.create({
            senderId: sender.id,
            receiverId: parseInt(receiverId),
            message: message
        });
        
        // Create notification for receiver
        await createAndSendNotification(
            parseInt(receiverId),
            'chat',
            `New message from ${sender.username}: ${message.substring(0, 30)}...`,
            newMessage.id
        );
        
        res.status(200).send("Message sent");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error sending message");
    }
});

// Admin User Management routes
app.get("/admin/users", authToken, async (req, res) => {
    if (req.user.role !== "Admin") {
        return res.status(403).send("Forbidden");
    }

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Users.findAndCountAll({
            limit: limit,
            offset: offset,
            order: [['id', 'ASC']]
        });

        const totalPages = Math.ceil(count / limit);

        res.render("adminUsers", {
            users: rows,
            user: {
                ...req.user,
                id: req.user.id // Make sure ID is included
            },
            activeMenu: 'users',
            pagination: {
                current: page,
                total: totalPages,
                totalItems: count,
                limit: limit
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading users");
    }
});

// API routes for user management
app.post("/api/users", authToken, async (req, res) => {
    if (req.user.role !== "Admin") return res.status(403).json({ message: "Forbidden" });

    try {
        const { username } = req.body;

        const existingUser = await Users.findOne({ where: { username: username } });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const user = await Users.create(req.body);
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.put("/api/users/:id", authToken, async (req, res) => {
    if (req.user.role !== "Admin") return res.status(403).send("Forbidden");

    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!updateData.password) {
            delete updateData.password;
        }

        await Users.update(updateData, { where: { id } });
        res.status(200).json({ message: "User updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/api/users/:id", authToken, async (req, res) => {
    if (req.user.role !== "Admin") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    try {
        const { id } = req.params;
        
        const currentUser = await Users.findOne({ where: { username: req.user.username } });
        if (currentUser.id === parseInt(id)) {
            return res.status(400).json({ message: "Cannot delete your own account" });
        }

        const user = await Users.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await Users.destroy({ where: { id } });
        
        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ message: "Error deleting user", error: err.message });
    }
});

// Get user notifications
app.get("/api/notifications", authToken, async (req, res) => {
    try {
        const user = await Users.findOne({ where: { username: req.user.username } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const notifications = await Notification.findAll({
            where: { userId: user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: "Error fetching notifications" });
    }
});

// Mark notification as read
app.post("/api/notifications/:id/read", authToken, async (req, res) => {
    try {
        await Notification.update(
            { isRead: true },
            { where: { id: req.params.id, userId: req.user.id } }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Error updating notification" });
    }
});

// Get unread notification count
app.get("/api/notifications/unread-count", authToken, async (req, res) => {
    try {
        const user = await Users.findOne({ where: { username: req.user.username } });
        const count = await Notification.count({
            where: { 
                userId: user.id,
                isRead: false 
            }
        });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ error: "Error fetching notification count" });
    }
});

// Clear all notifications for user
app.delete("/api/notifications/clear-all", authToken, async (req, res) => {
    try {
        const user = await Users.findOne({ where: { username: req.user.username } });
        await Notification.destroy({
            where: { 
                userId: user.id,
                isRead: true // Only delete read notifications
            }
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Error clearing notifications" });
    }
});

// Clear old notifications (older than 30 days)
app.delete("/api/notifications/cleanup", authToken, async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        await Notification.destroy({
            where: {
                createdAt: {
                    [Op.lt]: thirtyDaysAgo
                }
            }
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Error cleaning up notifications" });
    }
});

// Fungsi helper untuk membuat dan mengirim notifikasi
async function createAndSendNotification(userId, type, message, targetId) {
    try {
        const notification = await Notification.create({
            userId,
            type,
            message,
            targetId,
            isRead: false,
            createdAt: new Date()
        });
        
        // Send real-time notification via WebSocket
        sendNotification(userId, {
            id: notification.id,
            type,
            message,
            targetId,
            createdAt: notification.createdAt
        });
        
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
}

app.listen(port, hostnama, () => {
    console.log(`Server running at ${hostnama}:${port}`);
})