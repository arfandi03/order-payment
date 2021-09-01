module.exports = (sequelize, Sequelize) => {
    const Order = sequelize.define("order", {
        order_no: {
            type: Sequelize.STRING
        },
        phone: {
            type: Sequelize.STRING
        },
        product: {
            type: Sequelize.STRING
        },
        shipping_address: {
            type: Sequelize.STRING
        },
        shipping_code: {
            type: Sequelize.STRING
        },
        price: {
            type: Sequelize.INTEGER
        },
        states: {
            type: Sequelize.ENUM('success', 'failed', 'canceled'),
            // values: ['success', 'failed', 'canceled']
        },
        types: {
            type: Sequelize.ENUM('balance', 'product')
        },
        user_id: {
            type: Sequelize.INTEGER
        }
    });

    return Order;
};