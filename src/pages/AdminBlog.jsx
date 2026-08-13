import "./AdminBlog.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminBlog() {
    const navigate = useNavigate();

    const [blogs, setBlogs] = useState([]);

    const [form, setForm] = useState({
        title: "",
        description: "",
        content: "",
        image: "",
        author: "",
        category: ""
    });

    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);

    // ===========================
    // GET BLOGS
    // ===========================

    const fetchBlogs = async () => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/blogs"
            );

            const data = await response.json();

            if (response.ok) {
                setBlogs(data.blogs || []);
            }
        } catch (error) {
            console.error("Fetch blogs error:", error);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    // ===========================
    // HANDLE INPUT
    // ===========================

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    // ===========================
    // CREATE / UPDATE BLOG
    // ===========================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        const token = localStorage.getItem("adminToken");

        if (!token) {
            navigate("/admin/login");
            return;
        }

        try {
            const url = editingId
                ? `http://localhost:5000/api/blogs/${editingId}`
                : "http://localhost:5000/api/blogs";

            const method = editingId ? "PUT" : "POST";

            const response = await fetch(url, {
                method: method,

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem("adminToken");
                    navigate("/admin/login");
                    return;
                }

                setError(
                    data.message ||
                    (editingId
                        ? "Failed to update blog"
                        : "Failed to create blog")
                );

                return;
            }

            setMessage(
                editingId
                    ? "Blog updated successfully!"
                    : "Blog created successfully!"
            );

            setForm({
                title: "",
                description: "",
                content: "",
                image: "",
                author: "",
                category: ""
            });

            setEditingId(null);

            fetchBlogs();

        } catch (error) {
            console.error("Save blog error:", error);
            setError("Unable to connect to server");
        }
    };

    // ===========================
    // EDIT BLOG
    // ===========================

    const handleEdit = (blog) => {
        setForm({
            title: blog.TITLE || "",
            description: blog.DESCRIPTION || "",
            content: blog.CONTENT || "",
            image: blog.IMAGE || "",
            author: blog.AUTHOR || "",
            category: blog.CATEGORY || ""
        });

        setEditingId(blog.ID);

        setMessage("");
        setError("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // ===========================
    // CANCEL EDIT
    // ===========================

    const handleCancelEdit = () => {
        setEditingId(null);

        setForm({
            title: "",
            description: "",
            content: "",
            image: "",
            author: "",
            category: ""
        });

        setMessage("");
        setError("");
    };

    // ===========================
    // DELETE BLOG
    // ===========================

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this blog?"
        );

        if (!confirmDelete) {
            return;
        }

        const token = localStorage.getItem("adminToken");

        if (!token) {
            navigate("/admin/login");
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/blogs/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem("adminToken");
                    navigate("/admin/login");
                    return;
                }

                setError(
                    data.message || "Failed to delete blog"
                );

                return;
            }

            setMessage("Blog deleted successfully!");

            fetchBlogs();

        } catch (error) {
            console.error("Delete blog error:", error);
            setError("Unable to connect to server");
        }
    };

    // ===========================
    // IMAGE UPLOAD
    // ===========================

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];

        if (!file) {
            return;
        }

        setUploading(true);
        setMessage("");
        setError("");

        const token = localStorage.getItem("adminToken");

        if (!token) {
            navigate("/admin/login");
            return;
        }

        try {
            const formData = new FormData();

            formData.append("image", file);

            const response = await fetch(
                "http://localhost:5000/api/upload",
                {
                    method: "POST",

                    headers: {
                        Authorization: `Bearer ${token}`
                    },

                    body: formData
                }
            );

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem("adminToken");
                    navigate("/admin/login");
                    return;
                }

                setError(
                    data.message || "Image upload failed"
                );

                return;
            }

            setForm({
                ...form,
                image: data.imageUrl
            });

            setMessage("Image uploaded successfully!");

        } catch (error) {
            console.error("Image upload error:", error);
            setError("Image upload failed");
        } finally {
            setUploading(false);
        }
    };

    // ===========================
    // LOGOUT
    // ===========================

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
    };

    // ===========================
    // FORMAT DATE
    // ===========================

    const formatDate = (date) => {
        if (!date) {
            return "";
        }

        return new Date(date).toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric",
                year: "numeric"
            }
        );
    };

    return (
        <div className="admin-blog-page">

            {/* ===========================
                HEADER
            =========================== */}

            <div className="admin-header">

                <div>
                    <h1>Blog Admin</h1>

                    <p>
                        Manage your website articles and content
                    </p>
                </div>

                <button
                    className="admin-logout-btn"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>


            <div className="admin-container">

                {/* ===========================
                    FORM
                =========================== */}

                <div className="admin-form-card">

                    <h2>
                        {editingId
                            ? "Update Blog"
                            : "Create New Blog"}
                    </h2>

                    <form onSubmit={handleSubmit}>

                        {/* TITLE */}

                        <div className="admin-form-group">

                            <label>
                                Blog Title
                            </label>

                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="Enter blog title"
                                required
                            />

                        </div>


                        {/* DESCRIPTION */}

                        <div className="admin-form-group">

                            <label>
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Enter a short description"
                                required
                            />

                        </div>


                        {/* CONTENT */}

                        <div className="admin-form-group">

                            <label>
                                Blog Content
                            </label>

                            <textarea
                                name="content"
                                value={form.content}
                                onChange={handleChange}
                                placeholder="Write your blog content here. Use blank lines between paragraphs."
                                rows="10"
                                required
                            />

                        </div>


                        {/* IMAGE */}

                        <div className="admin-image-section">

                            <div className="admin-form-group">

                                <label>
                                    Image URL
                                </label>

                                <input
                                    type="text"
                                    name="image"
                                    value={form.image}
                                    onChange={handleChange}
                                    placeholder="https://example.com/image.jpg"
                                />

                                {form.image && (
                                    <img
                                        src={form.image}
                                        alt="Preview"
                                        className="admin-image-preview"
                                        onError={(e) => {
                                            e.target.style.display = "none";
                                        }}
                                    />
                                )}

                            </div>


                            <div className="admin-form-group">

                                <label>
                                    Upload Image
                                </label>

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="admin-file-input"
                                />

                                {uploading && (
                                    <p>
                                        Uploading image...
                                    </p>
                                )}

                            </div>

                        </div>


                        {/* AUTHOR + CATEGORY */}

                        <div className="admin-form-row">

                            <div className="admin-form-group">

                                <label>
                                    Author
                                </label>

                                <input
                                    type="text"
                                    name="author"
                                    value={form.author}
                                    onChange={handleChange}
                                    placeholder="Enter author name"
                                    required
                                />

                            </div>


                            <div className="admin-form-group">

                                <label>
                                    Category
                                </label>

                                <input
                                    type="text"
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    placeholder="Cyber Security"
                                    required
                                />

                            </div>

                        </div>


                        {/* BUTTONS */}

                        <div className="admin-card-actions">

                            <button
                                type="submit"
                                className="admin-primary-btn"
                            >
                                {editingId
                                    ? "Update Blog"
                                    : "Create Blog"}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    className="admin-secondary-btn"
                                    onClick={handleCancelEdit}
                                >
                                    Cancel
                                </button>
                            )}

                        </div>

                    </form>


                    {/* MESSAGES */}

                    {message && (
                        <div className="admin-success">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="admin-error">
                            {error}
                        </div>
                    )}

                </div>


                {/* ===========================
                    EXISTING BLOGS
                =========================== */}

                <div className="admin-blogs-section">

                    <h2>
                        Existing Blogs
                    </h2>

                    <div className="admin-blog-grid">

                        {blogs.map((blog) => (

                            <div
                                className="admin-blog-card"
                                key={blog.ID}
                            >

                                {blog.IMAGE && (
                                    <img
                                        src={blog.IMAGE}
                                        alt={blog.TITLE}
                                        className="admin-blog-card-image"
                                    />
                                )}


                                <div className="admin-blog-card-content">

                                    {blog.CATEGORY && (
                                        <div className="admin-blog-category">
                                            {blog.CATEGORY}
                                        </div>
                                    )}

                                    <h3>
                                        {blog.TITLE}
                                    </h3>

                                    <p>
                                        {blog.DESCRIPTION}
                                    </p>

                                    <p>
                                        By {blog.AUTHOR}
                                        {" | "}
                                        {formatDate(blog.CREATED_AT)}
                                    </p>


                                    <div className="admin-card-actions">

                                        <button
                                            className="admin-edit-btn"
                                            onClick={() =>
                                                handleEdit(blog)
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="admin-delete-btn"
                                            onClick={() =>
                                                handleDelete(blog.ID)
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                </div>

            </div>

        </div>
    );
}

export default AdminBlog;