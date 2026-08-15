import ProductCard from '../components/ProductCard';
import { products } from '../data/items';

const Products = () => {
    return (
        <div className="products-page">
            <h2>Our Products</h2>
            <section className="product-grid">
                {products.map(product => (
                    <ProductCard
                        key={product.id}
                        product={product}
                    />
                ))}
            </section>
        </div>
    );
};

export default Products;
