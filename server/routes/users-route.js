const express = require('express');
const router = express.Router();
const userController = require('../controllers/user-controller');

/* GET home page. */
router.route('/user')
    .post(userController.create);

router.route('/user/:id')
    .get(userController.getUserById);


router.route('/user/self')
    .get(userController.getUser)
    .put(userController.updateUser);

module.exports = router;