function containNumber(word :string){
    const rule = new RegExp('[0-9]', 'g')
    return rule.test(word)
}

function containLetter(word:string){
    const rule = new RegExp('[a-z]', 'g')
    return rule.test(word)
}

function containCap(word:string){
    const rule = new RegExp('[A-Z]', 'g')
    return rule.test(word)
}

function containSpecial(word:string){
    const rule = new RegExp('[?!:;,.&#~+-/*]', 'g')
    return rule.test(word)
}

export function isValid(password:string){
    if (!containNumber(password)){
        throw new Error("Le mot de passe doit contenir au moins un chiffre")
    }
    if (!containLetter(password)){
        throw new Error("Le mot de passe doit contenir au moins une lettre")
    }
    if (!containSpecial(password)){
        throw new Error("Le mot de passe doit contenir au moins un caractère spécial (?!:;,.&#~+-/*)")
    }
    if (!containCap(password)){
        throw new Error("Le mot de passe doit contenir au moins une lettre majuscule")
    }
}