import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb+srv://Kyro_Project:azimov_3444@cluster0.mgauugq.mongodb.net/premium_tools_db?retryWrites=true&w=majority&appName=Cluster0';

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected to premium_tools_db');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};
