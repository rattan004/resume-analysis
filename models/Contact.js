import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true,
        maxlength: [200, 'Subject cannot exceed 200 characters']
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true,
        maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    status: {
        type: String,
        enum: ['new', 'in-progress', 'resolved'],
        default: 'new'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low'
    },
    adminNotes: {
        type: String,
        trim: true,
        maxlength: [500, 'Admin notes cannot exceed 500 characters']
    }
}, {
    timestamps: true
});

// Index for better query performance
contactSchema.index({ email: 1, createdAt: -1 });
contactSchema.index({ status: 1 });
contactSchema.index({ createdAt: -1 });

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;