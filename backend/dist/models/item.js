export function toPublicItem(row) {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        status: row.status,
        createdBy: row.created_by,
        roleAccess: row.role_access,
        metadata: row.metadata,
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString(),
        price: Number(row.price),
        category: row.category,
        story: row.story,
        isTrending: row.is_trending,
        imageUrl: row.image_url,
    };
}
