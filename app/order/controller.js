const { Types } = require("mongoose");
const Order = require("./model");
const OrderItem = require("./order-item/model");
const DeliveryAddress = require("../deliveryAddress/model");
const CartItem = require("../cart/cart-item/model");

    const store = async (req, res, next) => {
        try {
        let { delivery_address } = req.body;
        let items = await CartItem.find({ user: req.user._id }).populate('product');
        if (!items) {
            return res.json({
            error: 1,
            message: 'You cannot create order because you have no items in cart',
            });
        }
    
        let address = await DeliveryAddress.findById(delivery_address);
        let order = new Order({
            _id: new Types.ObjectId(),
            status: 'waiting_payment',
            delivery_fee: delivery_fee,
            delivery_address: {
            provinsi: address.provinsi,
            kabupaten: address.kabupaten,
            kecamatan: address.kecamatan,
            kelurahan: address.kelurahan,
            detail: address.detail,
            },
            user: req.user._id,
        });
    
        let orderItems = await OrderItem.insertMany(
            items.map((item) => ({
            ...item,
            name: item.product.name,
            qty: parseInt(item.qty),
            price: parseInt(item.product.price),
            order: order._id,
            product: item.product._id,
            }))
        );
        orderItems.forEach((item) => order.order_items.push(item));
        await order.save();      
          // Hapus semua item di keranjang pengguna
        await CartItem.deleteMany({ user: req.user._id });

        return res.json(order);
        } catch (err) {
        if (err && err.name === 'ValidationError') {
            return res.json({
            error: 1,
            message: err.message,
            fields: err.errors,
            });
        }
        next(err);
        }
    };

    const index = async (req, res, next) => {
        try {
        let { skip = 0, limit = 10 } = req.query;

          // Hitung total dokumen (jumlah order)
        let count = await Order.find({ user: req.user._id }).countDocuments();     
          // Ambil daftar order dengan pagination
        let orders = await Order
            .find({ user: req.user._id })
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .populate('order_items') // Memuat detail item order
            .sort('-createdAt'); // Mengurutkan berdasarkan waktu pembuatan (terbaru)

          // Mengembalikan respons JSON
        return res.json({
            data: orders.map(order => order.toJSON({ virtuals: true })),
            count,
        });
        } catch (err) {
        if (err && err.name === 'ValidationError') {
            return res.json({
            error: 1,
            message: err.message,
            fields: err.errors,
            });
        }
        next(err);
        }
    };  
    
    module.exports = { store, index };