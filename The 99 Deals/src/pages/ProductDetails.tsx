import { useParams, Link } from 'react-router-dom';
import { products, type Product } from '../data/items';
import { useState, useEffect } from 'react';
import OrderForm from '../components/OrderForm';

const ProductDetails = () => {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | undefined>(undefined);

    useEffect(() => {
        if (id) {
            const foundProduct = products.find(p => p.id === parseInt(id));
            setProduct(foundProduct);
        }
    }, [id]);

    if (!product) {
        return <div className="app-container"><h2>Product not found</h2></div>;
    }

    return (
        <div className="product-details-page">
            <div className="breadcrumb">
                <Link to="/shop">Shop</Link> &gt; <span>{product.title}</span>
            </div>

            <div className="product-details-container">
                <div className="product-image-large">
                    <img src={product.image} alt={product.title} />
                </div>

                <div className="product-info-large">
                    <span className="category-tag">{product.category}</span>
                    <h1>{product.title}</h1>
                    <p className="price-large">Rs. {product.price.toLocaleString()}</p>
                    <p className="description">{product.description}</p>

                    <OrderForm product={product} />

                    <div className="additional-info">
                        <h3>Product Details</h3>
                        <ul>
                            <li>High quality materials</li>
                            <li>Fast delivery across Nepal</li>
                            <li>Cash on delivery available</li>
                            <li>7 days return policy</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
