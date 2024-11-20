const mongoose = require('mongoose');
const { model, Schema } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Invoice = require('../invoice/model');

const orderSchema = new Schema({
    status: {
        type: String,
        enum: ['waiting_payment', 'processing', 'in_delivery', 'delivered'],
        default: 'waiting_payment'
    },

    delivery_fee: {
        type: Number,
        default: 0
    },

    delivery_address: {
        provinsi: { type: String, required: [true, 'provinsi harus diisi'] },
        kabupaten: { type: String, required: [true, 'kabupaten harus diisi'] },
        kecamatan: { type: String, required: [true, 'kecamatan harus diisi'] },
        kelurahan: { type: String, required: [true, 'kelurahan harus diisi'] },
        detail: { type: String }
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    order_items: [{ type: Schema.Types.ObjectId, ref: 'OrderItem' }]
}, { timestamps: true });

// Menggunakan plugin AutoIncrement
orderSchema.plugin(AutoIncrement, { inc_field: 'order_number' });

// Virtual field untuk menghitung jumlah item
orderSchema.virtual('items_count').get(function () {
    return this.order_items.reduce((total, item) => total + (item.qty || 0), 0);
});

// Middleware post-save untuk membuat Invoice
orderSchema.post('save', async function () {
    const sub_total = this.order_items.reduce((total, item) => total + (item.price * item.qty || 0), 0);

    const invoice = new Invoice({
        user: this.user,
        order: this._id,
        sub_total: sub_total,
        delivery_fee: parseInt(this.delivery_fee, 10), // Perbaikan typo
        total: parseInt(sub_total + this.delivery_fee, 10),
        delivery_address: this.delivery_address // Perbaikan typo
    });

    await invoice.save();
});

module.exports = model('Order', orderSchema);
