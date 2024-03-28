const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { Schema } = mongoose;

//The fields for the Task
const taskSchema = new Schema({
    _id : Schema.Types.ObjectId,
    title: { 
        type: String, 
        required: [true, 'Title is required'],
    },
    description: { 
        type: String, 
        required: [true, 'Description is required'],
    },
    status: { 
        type: String, 
        default: "pending",
        enum: {
            values: ['pending', 'ongoing', 'completed'],
            message: 'Status is either: pending, ongoing, completed'
        },
        required: [true, 'Status is required'],
    },
    dueDate: { 
        type: Date,
        default: () => Date.now() + 7*24*60*60*1000, // 7 days from now
        required: [true, 'Due date is required'],
    },
    category: { 
        type: Schema.Types.ObjectId, 
        ref: 'Category',
        required: [true, 'Category is required'],
    },
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: [true, 'User is required'],
    },
}, {
    timestamps: true, // adds createdAt and updatedAt fields
});

// Add pagination
taskSchema.plugin(mongoosePaginate);

// Add indexes
taskSchema.index({ status: 1, dueDate: -1, category: 1, user: 1 });

module.exports = mongoose.model('Task', taskSchema);