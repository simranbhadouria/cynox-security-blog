import "./Navbar.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
    ChevronDown,
    Shield,
    Cloud,
    Monitor,
    Building2,
    Briefcase
} from "lucide-react";

function Navbar() {

    const [solutionsOpen, setSolutionsOpen] = useState(false);
    const [platformOpen, setPlatformOpen] = useState(false);
    const [aboutOpen, setAboutOpen] = useState(false);

    return (
        <nav className="navbar">

            {/* Logo */}
            <div className="logo">
                Cynox Global
            </div>


            {/* Menu */}
            <div className="nav-menu">
                <Link className="nav-item" to="/">
                    Home
                </Link>

                {/* Solutions */}
                <div
                    className="nav-item dropdown"
                    onMouseEnter={() => setSolutionsOpen(true)}
                    onMouseLeave={() => setSolutionsOpen(false)}
                >

                    <Link
                        to="/solutions"
                        className="nav-item"
                        style={{ textDecoration: "none", color: "inherit" }}
                    >
                        Solutions
                    </Link>

                    <ChevronDown size={16} />


                    {solutionsOpen && (
                        <div className="dropdown-menu">

                            <Link to="/soc-service">
                                <Shield size={18} />
                                SOC Service
                            </Link>

                            <Link to="/cyber-security">
                                <Shield size={18} />
                                Cyber Security
                            </Link>

                            <Link to="/cloud-security">
                                <Cloud size={18} />
                                Cloud Security
                            </Link>

                        </div>
                    )}

                </div>



                {/* Platform */}
                <div
                    className="nav-item dropdown"
                    onMouseEnter={() => setPlatformOpen(true)}
                    onMouseLeave={() => setPlatformOpen(false)}
                >

                    <Link
                        to="/platform"
                        className="nav-item"
                        style={{ textDecoration: "none", color: "inherit" }}
                    >
                        Platform
                    </Link>

                    <ChevronDown size={16} />


                    {platformOpen && (
                        <div className="dropdown-menu">

                            <Link to="/platform">
                                <Monitor size={18} />
                                Security Platform
                            </Link>

                            <Link to="/monitoring">
                                <Monitor size={18} />
                                Monitoring
                            </Link>

                        </div>
                    )}

                </div>



                {/* About */}
                <div
                    className="nav-item dropdown"
                    onMouseEnter={() => setAboutOpen(true)}
                    onMouseLeave={() => setAboutOpen(false)}
                >

                    <Link
                        to="/about"
                        className="nav-item"
                        style={{ textDecoration: "none", color: "inherit" }}
                    >
                        About
                    </Link>

                    <ChevronDown size={16} />

                    {aboutOpen && (
                        <div className="dropdown-menu">

                            <Link to="/about">
                                <Building2 size={18} />
                                Company
                            </Link>

                            <Link to="/careers">
                                <Briefcase size={18} />
                                Careers
                            </Link>

                        </div>
                    )}

                </div>


                <Link className="nav-item" to="/datasheets">
                    Datasheets
                </Link>

                <Link className="nav-item" to="/blog">
                    Blog
                </Link>


            </div>



            {/* Contact Button */}
            <div>

                <Link
                    className="contact-btn"
                    to="/contact"
                >
                    Contact Us
                </Link>

            </div>


        </nav>
    );
}


export default Navbar;