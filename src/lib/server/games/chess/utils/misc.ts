export function valueInArray(v : number[], arr : number[][]) {
    if (arr.some(el => areElementsArrayEqual(v, el))){
        return true
    } return false
}

export function areElementsArrayEqual(el1 : number[], el2 : number[]) {
    return el1[0] === el2[0] && el1[1] === el2[1]
        
}

export function deleteArrayElement(el : number[], array : number[][]) {
    // console.log("delete ", el, "in array", array)
    return array.filter(e => !areElementsArrayEqual(e, el))
}




