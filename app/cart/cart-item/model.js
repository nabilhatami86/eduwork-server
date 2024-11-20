const mongoose = require('mongoose');
const {model , Schema} = mongoose;

const CartItemSchema = ({
    name: {
        type: String,
        minlength: [5, 'panjang nama makanan minimal 5 karakter'],
        required: [true, 'name harus diisi']
    },

    price: {
        type: Number,
        default: 0
    },

    qty: {
        type: Number,
        require:[true, 'qty harus diisi'],
        min: [1, 'qty minimal 1']
    },
    image_url: String,

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }

});

module.exports = model('CartItem', CartItemSchema)