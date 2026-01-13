import * as customerService from "../services/customerService.js";
export async function getCustomers(req, res, next) {
    try {
        const search = req.query.search;
        const customers = await customerService.getCustomers(search);
        res.json(customers);
    }
    catch (err) {
        next(err);
    }
}
export async function createCustomer(req, res, next) {
    try {
        const customer = await customerService.createCustomer(req.body);
        res.status(201).json(customer);
    }
    catch (err) {
        next(err);
    }
}
export async function updateCustomer(req, res, next) {
    try {
        const id = Number(req.params.id);
        const customer = await customerService.updateCustomer(id, req.body);
        res.json(customer);
    }
    catch (err) {
        next(err);
    }
}
