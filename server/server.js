/* global process */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import { User, Category, Product, Review, CarouselItem, VisitStat, Order, TelegramAdmin } from './models.js';
import { createTelegramBot, getTelegramConfig } from './telegramBot.js';
import { v4 as uuidv4 } from 'uuid'; // we need to install uuid

dotenv.config();

if (process.env.ALLOW_INSECURE_TLS === 'true') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

// ==================== HEALTH CHECK FOR UPTIMEROBOT ====================
app.get(['/', '/health', '/api/health'], (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        message: '999 Premium Tools Backend API is running', 
        timestamp: new Date().toISOString() 
    });
});

// --- Helpers ---
const getNextId = async (Model) => {
    const highest = await Model.findOne().sort('-id').exec();
    return highest && highest.id ? highest.id + 1 : 1;
};

const telegramBot = createTelegramBot({
    ...getTelegramConfig(),
    AdminModel: TelegramAdmin,
    getNextId
});

// ==================== USER ROUTES ====================
app.post('/api/users/register', async (req, res) => {
    try {
        const { email, first_name, last_name, password } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Email already registered' });
        
        const role = email === 'admin@999.uz' ? 'super_admin' : 'user';
        const user = new User({
            id: uuidv4(),
            email,
            first_name,
            last_name,
            password, // NOTE: In production, hash this with bcrypt!
            role
        });
        await user.save();
        res.json([user]); // Return array to match supabase style
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().sort({ created_at: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/users/role', async (req, res) => {
    try {
        const { email, role } = req.body;
        const user = await User.findOneAndUpdate({ email }, { role }, { new: true });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json([user]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/users/password', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOneAndUpdate({ email }, { password }, { new: true });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json([user]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== CATEGORY ROUTES ====================
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find().sort({ id: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/categories', async (req, res) => {
    try {
        const id = await getNextId(Category);
        const category = new Category({ id, ...req.body });
        await category.save();
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/categories/:id', async (req, res) => {
    try {
        const category = await Category.findOneAndUpdate({ id: Number(req.params.id) }, req.body, { new: true });
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/categories/:id', async (req, res) => {
    try {
        await Category.findOneAndDelete({ id: Number(req.params.id) });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== PRODUCT ROUTES ====================
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ id: 1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const id = await getNextId(Product);
        const product = new Product({ id, ...req.body });
        await product.save();
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate({ id: Number(req.params.id) }, req.body, { new: true });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findOneAndDelete({ id: Number(req.params.id) });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== CAROUSEL ROUTES ====================
app.get('/api/carousel', async (req, res) => {
    try {
        const items = await CarouselItem.find().sort({ id: 1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/carousel', async (req, res) => {
    try {
        const id = await getNextId(CarouselItem);
        const item = new CarouselItem({ id, ...req.body });
        await item.save();
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/carousel/:id', async (req, res) => {
    try {
        const item = await CarouselItem.findOneAndUpdate({ id: Number(req.params.id) }, req.body, { new: true });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/carousel/:id', async (req, res) => {
    try {
        await CarouselItem.findOneAndDelete({ id: Number(req.params.id) });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== VISIT STATS ROUTES ====================
app.post('/api/visit_stats', async (req, res) => {
    try {
        const id = await getNextId(VisitStat);
        const stat = new VisitStat({ id, ...req.body });
        await stat.save();
        res.json(stat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/visit_stats', async (req, res) => {
    try {
        const stats = await VisitStat.find();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== REVIEWS ROUTES ====================
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await Review.aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "product_id",
                    foreignField: "id",
                    as: "products"
                }
            },
            { $unwind: { path: "$products", preserveNullAndEmptyArrays: true } },
            { $sort: { created_at: -1 } }
        ]);
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/reviews/summary', async (req, res) => {
    try {
        const summaries = await Review.aggregate([
            {
                $group: {
                    _id: "$product_id",
                    reviewCount: { $sum: 1 },
                    rating: { $avg: "$rating" }
                }
            },
            {
                $project: {
                    _id: 0,
                    product_id: "$_id",
                    reviewCount: 1,
                    rating: 1
                }
            }
        ]);

        res.json(summaries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/reviews/product/:id', async (req, res) => {
    try {
        const reviews = await Review.find({ product_id: Number(req.params.id) }).sort({ created_at: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/reviews', async (req, res) => {
    try {
        const id = await getNextId(Review);
        const review = new Review({ id, ...req.body });
        await review.save();
        res.json(review);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/reviews/:id', async (req, res) => {
    try {
        await Review.findOneAndDelete({ id: Number(req.params.id) });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== ORDER ROUTES ====================
app.post('/api/orders', async (req, res) => {
    try {
        const { customerName, customerPhone, customerTelegram, message, items } = req.body;

        if (!customerName || !customerPhone || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Customer name, phone and order items are required' });
        }

        const normalizedItems = items.map((item) => ({
            product_id: Number(item.productId),
            product_name: item.productName,
            unit: item.unit || 'piece',
            quantity: Number(item.quantity || 1),
            amount_grams: item.amountGrams !== undefined ? Number(item.amountGrams) : undefined
        })).filter((item) => item.product_id && item.product_name);

        if (normalizedItems.length === 0) {
            return res.status(400).json({ error: 'Order items are invalid' });
        }

        const id = await getNextId(Order);
        const order = new Order({
            id,
            customer_name: customerName,
            customer_phone: customerPhone,
            customer_telegram: customerTelegram || '',
            message: message || '',
            items: normalizedItems
        });

        await order.save();

        let telegram = { sent: 0, skipped: true };
        try {
            telegram = await telegramBot.notifyOrder(order);
        } catch (notifyError) {
            console.error('Telegram order notification error:', notifyError);
        }

        res.json({ order, telegram });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ created_at: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    const shouldStartBot = process.env.TELEGRAM_BOT_TOKEN && process.env.START_TELEGRAM_BOT_IN_SERVER !== 'false';
    if (shouldStartBot) {
        console.log('Starting Telegram bot polling...');
        telegramBot.start();
    } else {
        console.log('Telegram bot polling skipped (token missing or START_TELEGRAM_BOT_IN_SERVER=false).');
    }
});
