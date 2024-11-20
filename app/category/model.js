const  mongoose  = require("mongoose");
const {model, Schema} = mongoose;

const categorySchema = Schema ({
    
    name:{
        type: String,
        minLength:[3, 'panjang nama kategori minimal 3 karakter'],
        maxLength:[20, 'panjang nama kateori maksimal 20 karakter'],
        required: [true, ' nama kategori harus diiisi']
    }

}, {timestamps: true});

module.exports = model('Category', categorySchema)
