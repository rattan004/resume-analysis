import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // The URI is read from process.env.MONGODB_URI
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        // Exit process with failure
        process.exit(1);
    }
};

export default connectDB;