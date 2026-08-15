import { Link } from 'react-router-dom';
import type { Product } from '../data/items';

interface ProductCardProps {
    product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
    return (
        <div className="product-card">
            <Link to={`/product/${product.id}`} className="product-image-container">
                <img src={product.image} alt={product.title} />
            </Link>
            <div className="product-info">
                <span className="category">{product.category}</span>
                <Link to={`/product/${product.id}`}>
                    <h3>{product.title}</h3>
                </Link>
                <p className="price">Rs. {product.price.toLocaleString()}</p>
                <Link to={`/product/${product.id}`} className="order-now-btn">
                    Order Now
                </Link>
            </div>
        </div>
    );
};

export default ProductCard;
