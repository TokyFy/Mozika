const shuffleArray = (arrayInput: any[] , constant : number  = -1) => {

    const array = [...arrayInput]

    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        if (i !== constant && j !== constant) {
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    return array
}

console.log(shuffleArray([1,2,3,4,5] , 0))