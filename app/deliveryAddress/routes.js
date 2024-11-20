const router = require('express').Router();
const deliveryAddressController = require('./controller');
const { police_check } =  require ('../middleware/index')


router.post('/deliveryaddresses',
    police_check('create', 'DeliveryAddress'),
    deliveryAddressController.store
);

router.get('/deliveryaddresses',
    police_check('view', 'DeliveryAddress'),
    deliveryAddressController.index);

router.put('/deliveryaddresses/:id',
    police_check('update', 'DeliveryAddress'),
    deliveryAddressController.update
);

router.delete('/deliveryaddresses/:id',
    police_check('delete', 'DeliveryAddress'),
    deliveryAddressController.destroy
)



module.exports = router;