import "./Blog.css";
import { useEffect, useState } from "react";

function Blog() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedBlog, setSelectedBlog] = useState(null);

    useEffect(() => {
        fetch("http://localhost:5000/api/blogs")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch blogs");
                }

                return response.json();
            })
            .then((data) => {
                console.log("API Response:", data);

                setBlogs(data.blogs || []);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching blogs:", error);

                setError("Unable to load blogs");
                setLoading(false);
            });
    }, []);

    const formatDate = (date) => {
        if (!date) {
            return "";
        }

        return new Date(date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        });
    };

    const handleImageError = (e) => {
        e.target.style.display = "none";
    };

    if (loading) {
        return (
            <div className="blog-page">
                Loading blogs...
            </div>
        );
    }

    if (error) {
        return (
            <div className="blog-page">
                {error}
            </div>
        );
    }

    return (
        <div className="blog-page">

            <h1>Our Blogs</h1>

            {/* =========================
                BLOG CARDS
            ========================= */}

            <div className="blog-grid">

                {blogs.map((blog) => (

                    <div
                        className="blog-card"
                        key={blog.ID}
                    >

                        {/* BLOG IMAGE */}

                        {blog.IMAGE && (
                            <img
                                src={blog.IMAGE}
                                alt={blog.TITLE}
                                className="blog-image"
                                onError={handleImageError}
                            />
                        )}

                        <div className="blog-content">

                            {/* CATEGORY */}

                            {blog.CATEGORY && (
                                <p className="blog-category">
                                    {blog.CATEGORY}
                                </p>
                            )}

                            {/* TITLE */}

                            <h2>
                                {blog.TITLE}
                            </h2>

                            {/* DESCRIPTION */}

                            <p className="blog-description">
                                {blog.DESCRIPTION}
                            </p>

                            {/* AUTHOR + DATE */}

                            <div className="blog-meta">

                                <span>
                                    By {blog.AUTHOR}
                                </span>

                                <span>
                                    |
                                </span>

                                <span>
                                    {formatDate(blog.CREATED_AT)}
                                </span>

                            </div>

                            {/* READ FULL BLOG */}

                            <button
                                className="read-blog-btn"
                                onClick={() => setSelectedBlog(blog)}
                            >
                                Read Full Blog
                            </button>

                        </div>

                    </div>

                ))}

            </div>


            {/* =========================
                FULL BLOG MODAL
            ========================= */}

            {selectedBlog && (

                <div className="blog-modal">

                    <div className="blog-modal-content">

                        {/* CLOSE BUTTON */}

                        <button
                            className="close-blog"
                            onClick={() => setSelectedBlog(null)}
                        >
                            ×
                        </button>


                        {/* FULL BLOG IMAGE */}

                        {selectedBlog.IMAGE && (
                            <img
                                src={selectedBlog.IMAGE}
                                alt={selectedBlog.TITLE}
                                className="blog-full-image"
                                onError={handleImageError}
                            />
                        )}


                        {/* CATEGORY */}

                        {selectedBlog.CATEGORY && (
                            <p className="blog-category">
                                {selectedBlog.CATEGORY}
                            </p>
                        )}


                        {/* TITLE */}

                        <h1>
                            {selectedBlog.TITLE}
                        </h1>


                        {/* AUTHOR + DATE */}

                        <div className="blog-full-meta">

                            By {selectedBlog.AUTHOR}

                            {" | "}

                            {formatDate(selectedBlog.CREATED_AT)}

                        </div>


                        {/* DESCRIPTION */}

                        <p className="blog-full-description">
                            {selectedBlog.DESCRIPTION}
                        </p>


                        {/* FULL CONTENT */}

                        <div className="blog-full-content">
                            {selectedBlog.CONTENT
                                ?.split(/\r?\n/)
                                .filter((line) => line.trim() !== "")
                                .map((line, index) => (
                                    <p key={index}>
                                        {line}
                                    </p>
                                ))}
                        </div>

                    </div>

                </div>

            )}


        </div>
    );
}

export default Blog;