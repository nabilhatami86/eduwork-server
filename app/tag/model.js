const  mongoose  = require("mongoose");
const {model, Schema} = mongoose;

const tagSchema = Schema ({
    
    name:{
        type: String,
        minLength:[3, 'panjang nama tag minimal 3 karakter'],
        maxLength:[20, 'panjang nama tag maksimal 20 karakter'],
        required: [true, ' nama tag harus diiisi']
    }

}, {timestamps: true});

module.exports = model('Tags', tagSchema)
