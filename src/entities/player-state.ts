export class PlayerState {
    numOfPotionsBrewed: number;
    ingredients: number[];
    score: number;

    constructor() {
        this.numOfPotionsBrewed = 0;
        this.ingredients = [0, 0, 0, 0];
        this.score = 0;
        this.update = this.update.bind(this);
    }

    update({
        numOfPotionsBrewed,
        ingredients,
        score,
    }: {
        numOfPotionsBrewed: number;
        ingredients: number[];
        score: number;
    }): void {
        this.numOfPotionsBrewed = numOfPotionsBrewed;
        this.ingredients = ingredients;
        this.score = score;
    }
}
