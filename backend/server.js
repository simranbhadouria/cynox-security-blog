const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");

require("dotenv").config();

const { getConnection } = require("./db");
const blogRoutes = require("./routes/blogs");
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");


const app = express();

app.use(cors());
app.use(express.json());

// =====================================================
// SERVE UPLOADED IMAGES
// =====================================================

app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

// =====================================================
// IMAGE UPLOAD SETUP
// =====================================================

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "uploads"));
    },

    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() +
            "-" +
            file.originalname.replace(/\s+/g, "-");

        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage
});

// =====================================================
// IMAGE UPLOAD API
// POST /api/upload
// =====================================================

app.post("/api/upload", upload.single("image"), (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image uploaded"
            });
        }

        const imageUrl =
            `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`;

        res.json({
            success: true,
            message: "Image uploaded successfully",
            imageUrl: imageUrl
        });

    } catch (error) {

        console.error("Image upload error:", error);

        res.status(500).json({
            success: false,
            message: "Image upload failed",
            error: error.message
        });
    }
});

// =====================================================
// BLOG API
// =====================================================

app.use("/api/blogs", blogRoutes);

// =====================================================
// AUTH API
// =====================================================

app.use("/api/auth", authRoutes);

// =====================================================
// CHAT API
// =====================================================

app.use("/api/chat", chatRoutes);

// =====================================================
// HOME
// =====================================================

app.get("/", (req, res) => {
    res.send("Blog API is running");
});

// =====================================================
// TEST ORACLE
// =====================================================

app.get("/api/test-db", async (req, res) => {

    let connection;

    try {

        connection = await getConnection();

        const result = await connection.execute(
            "SELECT 'Oracle connection successful' AS MESSAGE FROM DUAL"
        );

        res.json({
            success: true,
            message: result.rows[0].MESSAGE
        });

    } catch (error) {

        console.error("Oracle connection error:", error);

        res.status(500).json({
            success: false,
            message: "Oracle connection failed",
            error: error.message
        });

    } finally {

        if (connection) {
            await connection.close();
        }
    }
});

// =====================================================
// START SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;