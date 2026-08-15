import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="logo">
                <Link to="/">The 99 Deals</Link>
            </div>
            <div className="nav-links">
                <Link to="/">Home</Link>
                <Link to="/shop">Shop</Link>
                <Link to="/about">About</Link>
            </div>
        </nav>
    );
};

export default Navbar;
