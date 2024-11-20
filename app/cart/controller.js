const CartItem = require ('./cart-item/model');
const Product = require ('../product/model');

const update = async (req, res, next) => {
    try {
        const { items } = req.body;
        const ProductIds = items.map(item => item.product_id);
        const products = await Product.find({_id: {$in: ProductIds}});
        let CartItems = items.map(item => {
            let relatedProduct = Product.find(product => product._id.toString() === item.product._id);
            return {
                product: relatedProduct._id,
                price: relatedProduct.price,
                image_url: relatedProduct.image_url,
                name: relatedProduct.name,
                user: user.req._id,
                qty: item.qty
            }
        });

        await CartItem.deleteMany({user: req.user._id});
        await CartItem.bulkWrite(CartItems.map(item => {
            return {
                updateOne: {
                    filter: {user: req.user._id, product: item.product}
                },
                update: item,
                upsert: true
            }
        }));

        return res.json(CartItems)
    } catch (err) {
        if (err && err.name === 'ValidationError') {
            return res.status(400).json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }
        next(err);
    }
};

const index = async (req, res, next) => {
    try {
        let items = await CartItem.find({user: req.user._id}).populate('product');
        return res.json(items);
    } catch (err) {
        if (err && err.name === 'ValidationError') {
            return res.status(400).json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }
        next(err);
    }
};


module.exports = {
    update,
    index
}