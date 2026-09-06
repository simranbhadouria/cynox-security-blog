const express = require("express");

const router = express.Router();

const { getConnection, oracledb } = require("../db");

const authMiddleware = require("../middleware/authMiddleware");

// GET ALL BLOGS
router.get("/", async (req, res) => {
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            `SELECT
                ID,
                TITLE,
                DESCRIPTION,
                CONTENT,
                IMAGE,
                AUTHOR,
                CATEGORY,
                SEO_TITLE,
                META_DESCRIPTION,
                SEO_KEYWORDS,
                FOCUS_KEYWORD,
                URL_SLUG,
                CANONICAL_URL,
                CREATED_AT,
                UPDATED_AT
             FROM BLOGS
             ORDER BY CREATED_AT DESC`,
            [],
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT,
                fetchInfo: {
                    CONTENT: {
                        type: oracledb.STRING
                    }
                }
            }
        );

        res.json({
            success: true,
            blogs: result.rows
        });

    } catch (error) {
        console.error("Error fetching blogs:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch blogs",
            error: error.message
        });

    } finally {
        if (connection) {
            await connection.close();
        }
    }
});


// CREATE BLOG
router.post("/", authMiddleware, async (req, res) => {
    let connection;

    try {
        const {
            title,
            description,
            content,
            image,
            author,
            category,
            seoTitle,
            metaDescription,
            seoKeywords,
            focusKeyword,
            urlSlug,
            canonicalUrl
        } = req.body;

        connection = await getConnection();

        await connection.execute(
            `INSERT INTO BLOGS
                (
                    ID,
                    TITLE,
                    DESCRIPTION,
                    CONTENT,
                    IMAGE,
                    AUTHOR,
                    CATEGORY,
                    SEO_TITLE,
                    META_DESCRIPTION,
                    SEO_KEYWORDS,
                    FOCUS_KEYWORD,
                    URL_SLUG,
                    CANONICAL_URL,
                    CREATED_AT,
                    UPDATED_AT
                )
             VALUES
                (
                    BLOGS_SEQ.NEXTVAL,
                    :title,
                    :description,
                    :content,
                    :image,
                    :author,
                    :category,
                    :seoTitle,
                    :metaDescription,
                    :seoKeywords,
                    :focusKeyword,
                    :urlSlug,
                    :canonicalUrl,
                    SYSTIMESTAMP,
                    SYSTIMESTAMP
                )`,
            {
                title,
                description,
                content,
                image,
                author,
                category,
                seoTitle,
                metaDescription,
                seoKeywords,
                focusKeyword,
                urlSlug,
                canonicalUrl
            },
            {
                autoCommit: true
            }
        );

        res.status(201).json({
            success: true,
            message: "Blog created successfully"
        });

    } catch (error) {
        console.error("Error creating blog:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create blog",
            error: error.message
        });

    } finally {
        if (connection) {
            await connection.close();
        }
    }
});


// UPDATE BLOG
router.put("/:id", authMiddleware, async (req, res) => {
    let connection;

    try {
        const { id } = req.params;

        const {
            title,
            description,
            content,
            image,
            author,
            category,
            seoTitle,
            metaDescription,
            seoKeywords,
            focusKeyword,
            urlSlug,
            canonicalUrl
        } = req.body;

        connection = await getConnection();

        const result = await connection.execute(
            `UPDATE BLOGS
             SET
                TITLE = :title,
                DESCRIPTION = :description,
                CONTENT = :content,
                IMAGE = :image,
                AUTHOR = :author,
                CATEGORY = :category,
                SEO_TITLE = :seoTitle,
                META_DESCRIPTION = :metaDescription,
                SEO_KEYWORDS = :seoKeywords,
                FOCUS_KEYWORD = :focusKeyword,
                URL_SLUG = :urlSlug,
                CANONICAL_URL = :canonicalUrl,
                UPDATED_AT = SYSTIMESTAMP
             WHERE ID = :id`,
            {
                id,
                title,
                description,
                content,
                image,
                author,
                category,
                seoTitle,
                metaDescription,
                seoKeywords,
                focusKeyword,
                urlSlug,
                canonicalUrl
            },
            {
                autoCommit: true
            }
        );

        if (result.rowsAffected === 0) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        res.json({
            success: true,
            message: "Blog updated successfully"
        });

    } catch (error) {
        console.error("Error updating blog:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update blog",
            error: error.message
        });

    } finally {
        if (connection) {
            await connection.close();
        }
    }
});


// DELETE BLOG
router.delete("/:id", authMiddleware, async (req, res) => {
    let connection;

    try {
        const { id } = req.params;

        connection = await getConnection();

        const result = await connection.execute(
            `DELETE FROM BLOGS
             WHERE ID = :id`,
            {
                id
            },
            {
                autoCommit: true
            }
        );

        if (result.rowsAffected === 0) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        res.json({
            success: true,
            message: "Blog deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting blog:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete blog",
            error: error.message
        });

    } finally {
        if (connection) {
            await connection.close();
        }
    }
});


module.exports = router;