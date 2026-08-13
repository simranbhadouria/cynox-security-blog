const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Temporary admin credentials
// We will move this to the database later.
const ADMIN_EMAIL = "admin@company.com";
const ADMIN_PASSWORD_HASH = bcrypt.hashSync("Admin@123", 10);

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        if (email !== ADMIN_EMAIL) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            ADMIN_PASSWORD_HASH
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                email: ADMIN_EMAIL,
                role: "admin"
            },
            process.env.JWT_SECRET || "development_secret",
            {
                expiresIn: "2h"
            }
        );

        res.json({
            success: true,
            message: "Login successful",
            token
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
});

module.exports = router;