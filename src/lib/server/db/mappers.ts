import type { ObjectId } from "mongodb"

export function mapperDB<T extends {_id : ObjectId}>(doc : T): Omit<T, "_id"> & {id : string}{
    const {_id, ...obj} = doc
    return {
        ...obj,
        id : _id.toString()
    }
}


// export function arrayMapperDB<T extends {_id : ObjectId}>(doc : T): Omit<T, "_id"> & {id : string}{
//     const {_id, ...obj} = doc
//     return {
//         ...obj,
//         id : _id.toString()
//     }
// }