const router = require('express').Router();
const { police_check } = require ('../middleware/index');
const cartController = require ('./controller')

router.put('/carts',
    police_check('update', 'Cart'),
    cartController.update
);

router.get('/carts',
    police_check('view', 'Cart'),
    cartController.index
);


module.exports = router