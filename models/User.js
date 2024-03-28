const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');
const zxcvbn = require('zxcvbn');

//The fields for the User
const userSchema = new Schema({
    _id : Schema.Types.ObjectId,
    username: { 
        type: String, 
        required: [true, 'Username is required'], 
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'],
        validate: {
            validator: (password) => {
                const { score } = zxcvbn(password);
                return score >= 3; // password strength must be at least 3
            },
            message: (props) => `Password is too weak. Strength: ${zxcvbn(props.value).score}/4`
        }
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'], 
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Email is invalid'] 
    },
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
});

userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});

//The following operation is used to compare the password entered by the user with the password stored in the database
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);