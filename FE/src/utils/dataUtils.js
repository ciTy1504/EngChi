/**
 * @param {any} data - Dữ liệu có thể là object, array, hoặc giá trị nguyên thủy.
 * @returns {any} - Dữ liệu đã được chuẩn hóa.
 */
export function normalizeMongoData(data) {
    if (Array.isArray(data)) {
        return data.map(item => normalizeMongoData(item));
    }

    if (data !== null && typeof data === 'object') {
        if (data._id && data._id.$oid) {
            data._id = data._id.$oid;
        }

        const newObj = {};
        for (const key in data) {
            newObj[key] = normalizeMongoData(data[key]);
        }
        return newObj;
    }
    return data;
}