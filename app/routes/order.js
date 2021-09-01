const order = require("../controllers/order.js");
const router = require("express").Router();
const { body, check } = require("express-validator")
const { ensureAuthenticated } = require("../middleware/auth.js")
const paginate = require('express-paginate');

// router.use(ensureAuthenticated);

// Create a new balance Order
router.post("/balance", [
    check("phone")
    .isLength({ min: 7 , max: 12 })
    .withMessage("Mobile number must be between 7 and 12 characters long")
    .isMobilePhone("id-ID")
    .withMessage("Mobile number not valid"),
    check("price", "Price is required").notEmpty(),
], order.createBalance);
// Topup Balance Page
router.get("/balance", order.createBalance);
// Create a new product Order
router.post("/product", [
    check("product")
    .isLength({ min: 10 , max: 150 })
    .withMessage("Product must be between 10 and 150 characters long"),
    check("shipping_address")
    .isLength({ min: 10 , max: 150 })
    .withMessage("Shipping Address must be between 10 and 150 characters long"),
    check("price", "Price is required").notEmpty(),
], order.createProduct);
// Product page
router.get("/product", order.createProduct);
// Retrieve all Orders
router.get("/", paginate.middleware(20, 50), (req, res) => {
    order.findAll(req, res);
});
// Success Page
router.get("/success/:id", order.success);
// Payment order page
router.get("/payment/:id", order.payOrder);
// Process order
router.post("/payment/:id", order.payOrder);
// Generate fake data
router.get('/fake', (req, res) => {
    order.generateFakeData(req, res);
});

module.exports = router;
