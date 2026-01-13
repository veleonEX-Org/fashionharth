import * as taskService from "../services/taskService.js";
export async function getTasks(req, res, next) {
    try {
        const assignedTo = req.query.assignedTo ? Number(req.query.assignedTo) : undefined;
        const status = req.query.status;
        const tasks = await taskService.getTasks(assignedTo, status);
        res.json(tasks);
    }
    catch (err) {
        next(err);
    }
}
export async function createTask(req, res, next) {
    try {
        const task = await taskService.createTask(req.body);
        res.status(201).json(task);
    }
    catch (err) {
        next(err);
    }
}
export async function updateTask(req, res, next) {
    try {
        const id = Number(req.params.id);
        const task = await taskService.updateTask(id, req.body);
        res.json(task);
    }
    catch (err) {
        next(err);
    }
}
export async function deleteTask(req, res, next) {
    try {
        const id = Number(req.params.id);
        await taskService.deleteTask(id);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
}
