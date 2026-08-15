
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="home-page">
            <header className="hero">
                <h1>Welcome to The 99 Deals</h1>
                <p>The best deals, every day.</p>
                <div style={{ marginTop: '2rem' }}>
                    <Link to="/shop" className="shop-now-btn">Shop Now</Link>
                </div>
            </header>

            <section className="features" style={{ textAlign: 'center', marginTop: '4rem' }}>
                <h2>Why Shop With Us?</h2>
                <div className="feature-grid" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem' }}>
                    <div className="feature">
                        <h3>Fast Shipping</h3>
                        <p>Get your products in record time.</p>
                    </div>
                    <div className="feature">
                        <h3>Best Quality</h3>
                        <p>We only sell the best products.</p>
                    </div>
                    <div className="feature">
                        <h3>24/7 Support</h3>
                        <p>We are always here to help.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
