const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getConnection } = require("../db");

const router = express.Router();

// =====================================================
// ADMIN LOGIN
// POST /api/auth/login
// =====================================================

router.post("/login", async (req, res) => {
    let connection;

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        connection = await getConnection();

        const result = await connection.execute(
            `SELECT ID, EMAIL, PASSWORD_HASH, ROLE
             FROM ADMIN
             WHERE EMAIL = :email`,
            { email }
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const admin = result.rows[0];

        const adminId = admin[0];
        const adminEmail = admin[1];
        const passwordHash = admin[2];
        const adminRole = admin[3];

        const passwordMatch = await bcrypt.compare(
            password,
            passwordHash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: adminId,
                email: adminEmail,
                role: adminRole
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

    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error("Database connection close error:", error);
            }
        }
    }
});

// =====================================================
// CHANGE ADMIN PASSWORD
// POST /api/auth/change-password
// =====================================================

router.post("/change-password", async (req, res) => {
    let connection;

    try {
        const {
            email,
            currentPassword,
            newPassword
        } = req.body;

        if (!email || !currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email, current password and new password are required"
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters"
            });
        }

        connection = await getConnection();

        // Find admin
        const result = await connection.execute(
            `SELECT ID, EMAIL, PASSWORD_HASH
             FROM ADMIN
             WHERE EMAIL = :email`,
            { email }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        const admin = result.rows[0];

        const adminId = admin[0];
        const passwordHash = admin[2];

        // Verify current password
        const currentPasswordMatch = await bcrypt.compare(
            currentPassword,
            passwordHash
        );

        if (!currentPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(
            newPassword,
            10
        );

        // Update password
        await connection.execute(
            `UPDATE ADMIN
             SET PASSWORD_HASH = :passwordHash,
                 UPDATED_AT = SYSTIMESTAMP
             WHERE ID = :id`,
            {
                passwordHash: newPasswordHash,
                id: adminId
            }
        );

        await connection.commit();

        res.json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        console.error("Change password error:", error);

        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error("Rollback error:", rollbackError);
            }
        }

        res.status(500).json({
            success: false,
            message: "Password change failed"
        });

    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error("Database connection close error:", error);
            }
        }
    }
});
// =====================================================
// UPDATE ADMIN EMAIL
// POST /api/auth/update-email
// =====================================================

router.post("/update-email", async (req, res) => {
    let connection;

    try {
        const {
            currentEmail,
            newEmail,
            currentPassword
        } = req.body;

        // Validate fields
        if (!currentEmail || !newEmail || !currentPassword) {
            return res.status(400).json({
                success: false,
                message: "Current email, new email and current password are required"
            });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(newEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        // Check if same email
        if (
            currentEmail.trim().toLowerCase() ===
            newEmail.trim().toLowerCase()
        ) {
            return res.status(400).json({
                success: false,
                message: "New email must be different from current email"
            });
        }

        connection = await getConnection();

        // Find current admin
        const result = await connection.execute(
            `SELECT ID, EMAIL, PASSWORD_HASH
             FROM ADMIN
             WHERE EMAIL = :email`,
            {
                email: currentEmail.trim()
            }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Admin account not found"
            });
        }

        const admin = result.rows[0];

        const adminId = admin[0];
        const passwordHash = admin[2];

        // Verify current password
        const passwordMatch = await bcrypt.compare(
            currentPassword,
            passwordHash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        // Check whether new email already exists
        const existingEmail = await connection.execute(
            `SELECT ID
             FROM ADMIN
             WHERE EMAIL = :email
             AND ID != :id`,
            {
                email: newEmail.trim(),
                id: adminId
            }
        );

        if (existingEmail.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This email is already registered"
            });
        }

        // Update email
        await connection.execute(
            `UPDATE ADMIN
             SET EMAIL = :email,
                 UPDATED_AT = SYSTIMESTAMP
             WHERE ID = :id`,
            {
                email: newEmail.trim(),
                id: adminId
            }
        );

        await connection.commit();

        res.json({
            success: true,
            message: "Email updated successfully",
            email: newEmail.trim()
        });

    } catch (error) {
        console.error("Update email error:", error);

        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error(
                    "Rollback error:",
                    rollbackError
                );
            }
        }

        res.status(500).json({
            success: false,
            message: "Email update failed"
        });

    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error(
                    "Database connection close error:",
                    error
                );
            }
        }
    }
});

module.exports = router;