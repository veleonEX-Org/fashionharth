import * as lookService from "../services/lookService.js";
export async function toggleFavorite(req, res, next) {
    try {
        const userId = req.user.id;
        const { itemId, action } = req.body; // action: 'add' or 'remove'
        if (action === 'remove') {
            await lookService.removeFavorite(userId, itemId);
        }
        else {
            await lookService.addFavorite(userId, itemId);
        }
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
}
export async function getFavorites(req, res, next) {
    try {
        const favorites = await lookService.getFavorites(req.user.id);
        res.json(favorites);
    }
    catch (err) {
        next(err);
    }
}
export async function saveLook(req, res, next) {
    try {
        const look = await lookService.saveLook(req.user.id, req.body);
        res.status(201).json(look);
    }
    catch (err) {
        next(err);
    }
}
export async function getSavedLooks(req, res, next) {
    try {
        const looks = await lookService.getSavedLooks(req.user.id);
        res.json(looks);
    }
    catch (err) {
        next(err);
    }
}
