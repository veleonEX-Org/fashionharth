import * as userService from "../services/userService.js";
export async function getAllUsers(req, res, next) {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    }
    catch (err) {
        next(err);
    }
}
export async function updateUserRole(req, res, next) {
    try {
        const id = Number(req.params.id);
        const { role } = req.body;
        const user = await userService.updateUserRole(id, role);
        res.json(user);
    }
    catch (err) {
        next(err);
    }
}
