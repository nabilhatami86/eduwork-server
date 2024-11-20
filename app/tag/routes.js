const router = require('express').Router();
const { police_check } = require('../middleware/index')

const tagController = require('./controller');

router.get ('/tag', tagController.index);

router.post ('/tag', 
    police_check('create', 'Tags'),
    tagController.store);

router.put ('/tag/:id', 
    police_check('update', 'Tags'),
    tagController.update);

router.delete ('/tag/:id', 
    police_check('delete', 'Tags'),
    tagController.destroy);



module.exports = router;