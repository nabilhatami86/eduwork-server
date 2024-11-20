const router = require('express').Router();
const { police_check } = require ('../middleware/index');
const orderController = require ('./controller')

router.post('/order',
    police_check('update', 'Order'),
    orderController.store
);

router.get('/order',
    police_check('view', 'Order'),
    orderController.index
);


module.exports = router