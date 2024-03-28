const mongoose = require('mongoose');
const { Schema } = mongoose;
const Task = require('./Task');

const categorySchema = new Schema({
    _id : Schema.Types.ObjectId,
    name: { 
        type: String, 
        required: [true, 'Name is required'],
        lowercase: true,
        trim: true,
    },
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: [true, 'User is required'],
    },
    tasks: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Task' 
    }],
});

// Ensure category names are unique per user
categorySchema.index({ name: 1, user: 1 }, { unique: true });

// Pre hook for 'remove' method
categorySchema.pre('remove', async function(next) {
    await Task.remove({ _id: { $in: this.tasks } });
    next();
});

module.exports = mongoose.model('Category', categorySchema);