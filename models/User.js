import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        // Select false prevents the password hash from being returned in query results by default
        select: false, 
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { 
    // Mongoose option to ensure virtual properties (like 'id' for front-end use) are included 
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual property to use _id as a standard 'id' field, which matches your existing in-memory structure
UserSchema.virtual('id').get(function() {
    return this._id.toHexString();
});


export default mongoose.model('User', UserSchema);
