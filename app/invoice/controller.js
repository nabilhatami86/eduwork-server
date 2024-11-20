const { subject } = require ('@casl/ability');
const Invoice = require ('./model');
const policyFor = require ('../middleware/index');

const show = async(req, res, next) => {
    try{
        let policy = policyFor(req.user);
        let subjectInvoice = subject ('Invoice', {...invoice, user_id: invoice.user._id});
        if(!policy.can('read', subjectInvoice)) {
            return res.json({
                err:1,
                msg: 'You do not have permission to view this invoice.',
            });
        }

        let { order_id } = req.params;
        let invoice = await Invoice.findOne({ order_id }).populate('order').populate('user');

        return res.json(invoice)
    }catch (err) {
        return res.json({
            err: 1,
            msg: 'Error fetching invoice',
        });
    }
};


module.exports = {show};