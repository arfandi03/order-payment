const rupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR"
    }).format(number);
}

const order_no = (number) => {
    return number.toString().replace(/\d{4}(?=.)/g, '$& ');
}