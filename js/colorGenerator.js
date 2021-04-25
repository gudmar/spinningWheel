class ColorGenerator{
    constructor(nrOfDifferentColorsToBeAvailable){
        this.seed = nrOfDifferentColorsToBeAvailable;
        if (this.seed > 50) {
            throw new Error(`${this.constructor.name}: Available 50 colors max, as later they all look similar`)
        }
    }

    generateFgBgColor(indexOfColor){
        let gbColor = this.generateColor(indexOfColor)
        return {
            fg: ColorGenerator.getContrastingFontColor(gbColor),
            bg: gbColor
        }
    }

    generateColor(indexOfColor){
        let offset = Math.floor(indexOfColor/8);
        let rgbMask = this._getIngrediances(indexOfColor)
        // if (indexOfColor % 7 == 0) {
        //     offset--;
        // }
        let colorValue = Math.floor(255 / (offset*0.7 + 1))
        colorValue = 255 - Math.floor(255 / (this.seed / 7))*offset;
        return {r: rgbMask.r?colorValue:0, g: rgbMask.g?colorValue:0, b: rgbMask.b?colorValue:0}
    }

    static getContrastingFontColor(bgColor){
        if ((bgColor.r > 128) || (bgColor.g > 128) || (bgColor.b > 128)) {
            if (((bgColor.r < 100) && (bgColor.g < 100)) && (bgColor.b > 0)) {
                return {r: 255, g: 255, b: 255}  // special condition for blue, that with black is not readable
            }
            return {r: 0, g: 0, b: 0}
        } else {
            return {r: 255, g: 255, b: 255}
        }      
    }

    createIterator(arrayOfColors = this.createListOfColors()) {
        // if createListOfColorsAsString passed then this will generate strig represintations
        let nextIndex = -1;
        return {
            next: function () {
                if (nextIndex >= arrayOfColors.length) {
                    nextIndex = 0
                } else {
                    nextIndex = nextIndex + 1;
                } 
                return {
                    value: arrayOfColors[nextIndex],
                    done: false
                }
            }
        }
    }

    createListOfColors(){
        let output = [];
        for (let index = 0; index < this.seed; index++){
            output.push(this.generateFgBgColor(index))
        }
        return output;
    }

    createListOfColorsAsString(){
        let convertAColor = function(color) {
            return {
                bg: ColorGenerator.toString(color.bg),
                fg: ColorGenerator.toString(ColorGenerator.getContrastingFontColor(color.bg))
            }
        }.bind(this)
        return this.createListOfColors().map(convertAColor)
    }

    static toString(color) {
        return `rgb(${color.r}, ${color.g}, ${color.b})`
    }

    _getIngrediances(indexOfGeneratedColor){
        indexOfGeneratedColor = indexOfGeneratedColor % 7;
        if (indexOfGeneratedColor == 0) {indexOfGeneratedColor = 7;}
        let rest = 0;
        let r = Math.floor(indexOfGeneratedColor / 4);
        rest = indexOfGeneratedColor % 4;
        let g = Math.floor(rest / 2);
        rest = rest % 2;
        let b = rest;
        return {r: r>0?true:false, g: g>0?true:false, b: b>0?true:false}
    }

}