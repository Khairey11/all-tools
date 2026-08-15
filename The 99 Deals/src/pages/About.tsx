
const About = () => {
    return (
        <div className="about-page" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1>About The 99 Deals</h1>
            <p className="intro">
                Welcome to The 99 Deals, Nepal's premier destination for amazing discounts and quality products.
            </p>

            <section className="about-section">
                <h2>Our Mission</h2>
                <p>
                    Our mission is to bring high-quality products to every household in Nepal at unbeatable prices.
                    We believe that shopping should be affordable, convenient, and reliable.
                </p>
            </section>

            <section className="about-section">
                <h2>Why Choose Us?</h2>
                <ul>
                    <li><strong>Best Prices:</strong> We source directly to give you the best deals.</li>
                    <li><strong>Nepali Brand:</strong> Proudly serving customers across Nepal.</li>
                    <li><strong>Quality Guarantee:</strong> We stand by the quality of our products.</li>
                </ul>
            </section>

            <section className="contact-section">
                <h2>Contact Us</h2>
                <p>Email: support@the99deals.com.np</p>
                <p>Phone: +977-9800000000</p>
                <p>Location: Kathmandu, Nepal</p>
            </section>
        </div>
    );
};

export default About;
