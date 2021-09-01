const db = require("../models");
const Order = db.orders;
const Op = db.Sequelize.Op;
const { validationResult } = require("express-validator");
const faker = require('faker');
const moment = require('moment');
const paginate = require('express-paginate');

// Create and Save a new biling Order
exports.createBalance = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    unpaid = await getUnpaidOrder(req.user.id);
    if (!errors.isEmpty()) {
        res.render("order/balance", {
            title: "Topup Balance Page",
            layout: "layouts/base",
            errors: errors.array(),
            user: req.user,
            unpaid
        });
    } else if (Object.keys(req.body).length !== 0) {
        try {
            let newOrder = {
                order_no: getRandomNumber(),
                phone: req.body.phone,
                price: req.body.price,
                types: "balance",
                user_id: req.user.id
            }
            const order = await Order.create(newOrder)
            req.flash("success_msg", "Billing order added successfully")
            res.redirect(`/order/success/${order.id}`);
        } catch (error) {
            console.log(error);
            req.flash("error_msg", "Ups! Something went wrong!");
            res.redirect('/order');
        }
        return
    }
    res.render("order/balance", {
        layout: "layouts/base",
        title: "Topup Balance Page",
        user: req.user,
        unpaid
    });

};

// Create and Save a new product Order
exports.createProduct = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    unpaid = await getUnpaidOrder(req.user.id);
    if (!errors.isEmpty()) {
        res.render("order/product", {
            title: "Product Page",
            layout: "layouts/base",
            errors: errors.array(),
            user: req.user,
            unpaid
        });
    } else if (Object.keys(req.body).length !== 0) {
        try {
            let newOrder = {
                order_no: getRandomNumber(),
                product: req.body.product,
                shipping_address: req.body.shipping_address,
                price: priceEncode(req.body.price),
                types: "product",
                user_id: req.user.id
            }
            // Save Order in the database
            const order = await Order.create(newOrder)
            req.flash("success_msg", "Product order added successfully")
            res.redirect(`/order/success/${order.id}`);      
        } catch (error) {
            console.log(error);
            req.flash("error_msg", "Ups! Something went wrong!");
            res.redirect('/order');
        }
        return
    }
    res.render("order/product", {
        layout: "layouts/base",
        title: "Product Page",
        user: req.user,
        unpaid
    });
};

// Retrieve all Orders from the database.
exports.findAll = async (req, res) => {
    const order_no = req.query.order;
    const condition = order_no ? { order_no: { [Op.like]: `%${order_no}%` }, user_id: req.user.id } : { user_id: req.user.id };
    const results = await Order.findAndCountAll({ limit: req.query.limit, offset: req.skip, where: condition })
    const itemCount = results.count;
    const pageCount = Math.ceil(results.count / req.query.limit);
    unpaid = await getUnpaidOrder(req.user.id);
    res.render('order', {
        layout: "layouts/base",
        title: "Order History",
        orderValue: order_no,
        active: req.query.page,
        orders: results.rows,
        pageCount,
        itemCount,
        pages: paginate.getArrayPages(req)(3, pageCount, req.query.page),
        user: req.user,
        unpaid

    });

};

// Find a single Order with an id
exports.success = async (req, res) => {
    const id = req.params.id;
    try {
        order = await Order.findByPk(id);
        unpaid = await getUnpaidOrder(req.user.id);

        res.render("order/success", {
            title: "Success Create Page",
            layout: "layouts/base",
            order,
            user: req.user,
            unpaid
        });
    } catch (err) {
        req.flash("error_msg", "Ups! Something went wrong!");
        res.redirect('/order');
    }
};

// Pay order
exports.payOrder = async (req, res) => {
    const id = req.params.id;
    try {
        const order = await Order.findByPk(id);
        if (order.states != null) {
            req.flash("error_msg", "Ups! cannot process this order 1");
            res.redirect('/order');
            return
        }
        if (req.body.order != null) {
            const status = getStatusPay();
            let message_type = (status === "success") ? "success_msg" : "error_msg";
            let message = (status === "success") ? "Pay order success" : "Pay order failed";

            update_order = {
                shipping_code: (order.types === "product") ? faker.random.alphaNumeric(8) : null,
                states: status
            }

            if (order.user_id != req.user.id) {
                req.flash("error_msg", "Ups! cannot process this order 2");
                res.redirect('/order');
                return
            }   

            update_order = await Order.update(update_order, {
                where: { id: id }
            })    

            if (order.types == "product") {
                message_type = "success_msg";
                message = "Pay order success";
            }

            req.flash(message_type, message);
            res.redirect('/order');
            

            return;
        }
        unpaid = await getUnpaidOrder(req.user.id);
        res.render("order/payment", {
            title: "Payment order",
            layout: "layouts/base",
            order,
            user: req.user,
            unpaid
        });
    } catch (err) {
        console.log(err);
        req.flash("error_msg", "Ups! Something went wrong!");
        res.redirect('/order');
    }

};

// generate fake data
exports.generateFakeData = async (req, res) => {
    let temp;
    try {
        // add billing orders
        for (let i = 1; i <= 25; i++) {
            let newOrder = {}

            newOrder.order_no = getRandomNumber();
            newOrder.phone = getRandomNumber("081", 9);
            temp = faker.commerce.price();
            temp = Math.floor(temp * 10000);
            temp = temp + (temp * 0.5);
            newOrder.price = temp;
            // newOrder.states = faker.datatype.number(2);
            newOrder.types = "balance";
            newOrder.user_id = req.user.id;

            await Order.create(newOrder);
        }
        // add product orders
        for (let i = 1; i <= 25; i++) {
            let newOrder = {}

            newOrder.order_no = getRandomNumber();
            newOrder.product = faker.commerce.productName();
            newOrder.shipping_address = faker.address.streetAddress();
            // newOrder.shipping_code = faker.random.alphaNumeric(8);
            temp = faker.commerce.price();
            temp = Math.floor(temp * 10000);
            temp = temp + 10000;
            newOrder.price = temp;
            // newOrder.states = faker.datatype.number(2);
            newOrder.types = "product";
            newOrder.user_id = req.user.id;

            await Order.create(newOrder);
        }
        req.flash("success_msg", "Orders added successfully")
    } catch (err) {
        console.log(err);
        req.flash("error_msg", "Ups! Something went wrong!");
    }
    res.redirect('/order');
};

function getRandomNumber(prefix = "", count = 10) {
    for (let i = 1; i <= count; i++) {
        prefix += faker.datatype.number(9);
    }
    return prefix;
}

function priceEncode(value) {
    const replacer = new RegExp("[.]", 'g')
    value = value.replace(replacer, "");
    return parseInt(value);
}

function getStatusPay() {
    const time = parseInt(moment().format("H"));
    const probably = Math.floor(Math.random() * 10) + 1; // 1 to 10
    let status;
    if (time => 9 && time <= 17) {
        status = (probably <= 9) ? "success" : "failed";
    } else {
        status = (probably <= 4) ? "success" : "failed";
    }
    return status;
}

const getUnpaidOrder = async (user_id) => {
    try {
        const results = await Order.findAndCountAll({ where: { states: null, user_id } });
        return results.count;
    } catch (error) {
        console.log(error);
    }
}

