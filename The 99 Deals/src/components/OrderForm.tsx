import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { submitOrder } from '../services/googleSheets';
import type { Product } from '../data/items';

const orderSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z
        .string()
        .min(10, 'Phone number must be at least 10 digits')
        .regex(/^[+\d\s\-()]+$/, 'Enter a valid phone number'),
    address: z.string().min(5, 'Please enter a more detailed address'),
});

type OrderFormValues = z.infer<typeof orderSchema>;

interface OrderFormProps {
    product: Product;
}

const OrderForm = ({ product }: OrderFormProps) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<OrderFormValues>({
        resolver: zodResolver(orderSchema),
    });

    const fireConfetti = () => {
        confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
        });
    };

    const onSubmit = async (data: OrderFormValues) => {
        const order = {
            productName: product.title,
            price: product.price,
            customerName: data.name,
            phone: data.phone,
            address: data.address,
        };

        const result = await submitOrder(order);

        if (result.success) {
            fireConfetti();
            toast.success(`🎉 Order placed for ${product.title}! We'll contact you soon.`, {
                duration: 5000,
            });
            reset();
        } else {
            toast.error('Something went wrong. Please try again.');
        }
    };

    return (
        <form className="order-form" onSubmit={handleSubmit(onSubmit)}>
            <h3>Order Now</h3>
            <p className="form-subtitle">Fill in your details to place your order</p>

            <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                    type="text"
                    id="name"
                    placeholder="Ram Bahadur"
                    {...register('name')}
                    className={errors.name ? 'input-error' : ''}
                />
                {errors.name && <span className="field-error">{errors.name.message}</span>}
            </div>

            <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                    type="tel"
                    id="phone"
                    placeholder="+977-98XXXXXXXX"
                    {...register('phone')}
                    className={errors.phone ? 'input-error' : ''}
                />
                {errors.phone && <span className="field-error">{errors.phone.message}</span>}
            </div>

            <div className="form-group">
                <label htmlFor="address">Full Address</label>
                <textarea
                    id="address"
                    placeholder="City, Street, Landmark"
                    rows={3}
                    {...register('address')}
                    className={errors.address ? 'input-error' : ''}
                />
                {errors.address && <span className="field-error">{errors.address.message}</span>}
            </div>

            <button type="submit" className="submit-order-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Placing Order...' : 'Confirm Order'}
            </button>
        </form>
    );
};

export default OrderForm;
