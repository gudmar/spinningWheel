// DEPENDENCIES:
// ColorGenerator    -> colorGenerator.js
// wheelDrawer       -> wheelDrawer.js
// AbstractComponent -> abstractCustomWebComponent.js

class StateHandlingAbstractComponent extends AbstractComponent{
    constructor(){
        super()

    }
    _getState(){
        if (this._state == undefined) {
            this._state = {}
        }
        if (this._state.items == undefined) {
            this._state.items = this._getListOfEntriesFromInnerHTML();
            console.log('GET ITEMS')
        }
        return this._state
    }

    _getColorGenerator(nrOfItems){
        if ((this.colorGenerator != undefined) || (nrOfItems != this.nrOfItems)) {
            let generator = new ColorGenerator(nrOfItems);
            this.colorGenerator = generator.createIterator()
            this.nrOfItems = nrOfItems
        } else {
            
        }
        return this.colorGenerator
    }

    _onInnerHTMLChange(mutationsList, observer){
        let getItemsToCompare = function(arrayOfItems){
            let output = arrayOfItems.map((item) => {
                const {label, isHidden, message} = item
                return {label, isHidden, message}
            })
            return output
        }
        let getAddedNode = function(){
            return mutationsList.find((item) => {return item.addedNodes.length > 0 ? true : false}).addedNodes
        }
        let currnetState = this._copyArrayOfObjects(this._getState().items)
        let stateFromHtmlAfterChange = this._copyArrayOfObjects(this._getListOfEntriesFromInnerHTML.call(getAddedNode()[0]));
        if (!Comparator.areStatesEqual(getItemsToCompare(currnetState), getItemsToCompare(stateFromHtmlAfterChange))){
            this._state.items = stateFromHtmlAfterChange
            this._recreateThisComponent();
        }
    }

    // _onStateChange(){
    //     let stateFromHtmlAfterChange = this._copyArrayOfObjects(this._getState().items)
    //     let currnetState = this._getListOfEntriesFromInnerHTML()
    //     if (!Comparator.areStatesEqual(currnetState, stateFromHtmlAfterChange)){
    //         this._updateInnerHTML(stateFromHtmlAfterChange)
    //         this._state.items = []
    //         this._state.items = stateFromHtmlAfterChange.map(item => item);
    //         this._recreateThisComponent();
    //     }     
    // }

    _recreateThisComponent() {
        console.warn(`${this.constructor.name}: _recreateThisComponent needs to be overwritten`)
    }

    _updateInnerHTML(stateItems = this._state.items){
        let output = ''
        stateItems.forEach((item) => {
            output += this._createSingleLiFromStateItemAsString(item)
        })
        this._removeElement(this.querySelector('ul'));
        this.appendChild(this._stringToElement(`<ul>${output}</ul>`)) 
    }


    _createSingleLiFromStateItemAsString({label, message, isHidden}){
        let dataLabel = label == null || label == undefined ? '' : `data-label = "${label}"`;
        return `<li ${isHidden?'class = "hidden"':''} ${dataLabel}>${message}</li>`
    }



    _getListOfEntriesFromInnerHTML(){
        let allItems = this.querySelectorAll('li');
        let getObjectFromSingleEntry = function(item, index){
            // let tempGen = this._getColorGenerator(allItems.length) 
            // let color = tempGen.next();
            let labelAttribute = item.getAttribute('data-label');
            labelAttribute = labelAttribute == undefined || labelAttribute == null ? index.toString() : labelAttribute;
            return {
                label: labelAttribute,
                message: item.innerText,
                isHidden: Array.from(item.classList).includes('hidden') ? true : false,
                // fgColor: color.fg,
                // bgColor: color.bg,
                id: index
            }
        }.bind(this)
        return Array.from(allItems).map(getObjectFromSingleEntry)
    }

    _copyArrayOfObjects(arr){
        let copySingleElement = function(element){
            let copy = {};
            for (let key in element){
                copy[key] = element[key]
            }
            return copy;
        }
        return arr.map((item) => {
            return copySingleElement(item)
        })
    }

    _changeItemInStateItems(itemId, key, value){
        let stateFromHtmlAfterChange = this._copyArrayOfObjects(this._state.items);
        let getIndexOfElementToChange = function(){
            return stateFromHtmlAfterChange.findIndex((element, index)=>{
                return element.id == itemId;
            } )
        }
        let prepareNewState = function(){
            stateFromHtmlAfterChange[getIndexOfElementToChange()][key] = value;
        }
        prepareNewState()
        this._state.items = stateFromHtmlAfterChange;
        // this._recreateThisComponent();  // side effect
    }

    _addItemToStateBeforeIndex(index, item) {
        this._state.items.splice(index, 0, item)
    }

    _removeItemFromStateAtIndex(index){
        this._state.items.splice(index, 1)
    }

    

    _getListOfNotUsedEntriesFromInnerHTML(){
        let hasNotUsedClass = function(element){
            return element.classList.includes('used') ? false : true;
        }
        return this.querySelectorAll('li').filter(hasNotUsedClass)
    }
    _setElement
}





class Comparator{

    static areStatesEqual(a, b) {
        return ObjectComparator.areEqualEnumerableArrayValuesCompare(a, b)
    }

    static findAddedIndexes(currnetState, stateFromHtmlAfterChange){
        return Comparator._findItemsNotExistingInBStateItems(stateFromHtmlAfterChange, currnetState)
    }

    static findRemovedIndexes(currnetState, stateFromHtmlAfterChange) {
        return Comparator._findItemsNotExistingInBStateItems(currnetState, stateFromHtmlAfterChange)
    }

    static findIndexesOfCommonItems(stateAItems, stateBItems) {
        let setOfIndexes = new Set();
        let addIndexesFromArray = function(arr){
            arr.forEach((element) => {setOfIndexes.add(element.id)})
        }
        addIndexesFromArray(stateAItems);
        addIndexesFromArray(stateBItems);
        return Array.from(setOfIndexes)
    }

    static _findItemsNotExistingInBStateItems(aStateItems, bStateItems) {
        let output = [];
        for (let item of aStateItems) {
            if (!Comparator.isFound(bStateItems, item)) {output.push(item.id)}
        }
        return output        
    }

    static isFound(oldArrayOfItems, newItem) {
        return oldArrayOfItems.findIndex((element) => {return element.id == newItem.id}) > -1 ? true : false
    }

}


class ObjectComparator{
    static isPrimitive(a){
        let primitives = ["number", "string", "boolean", "bigint", "undefined", "null", "symbol"]
        for(let type of primitives){
            if (typeof(a) == type){
                return true
            } 
        }
        return false
    }

    static areEqualEnumerable(a, b){
        return ObjectComparator._areEqual(a, b, Object.keys)
    }


    static areEqualEnumerableArrayValuesCompare(a, b){
        return ObjectComparator._areEqual(a, b, Object.keys, ObjectComparator.haveArraysSameValues)
    }


    static areEqualNotEnumerable(a, b) {
        return  ObjectComparator._areEqual(a, b, Reflect.ownKeys)
    }


    static areEqualNotEnumerableArrayValueCompare(a, b) {
        return  ObjectComparator._areEqual(a, b, Reflect.ownKeys, ObjectComparator.haveArraysSameValues)
    }


    static areFunctionsEqual(a, b){
        // Do not use JSON.stringify, as it often returns undefined while converting functions
        return a.toString() == b.toString()
    }


    static areMapsEqual(a, b) {
        let enumerate = function(a) {
            let arr = [];
            let keys = a.keys();
            for (let key of keys) {
                arr.push(key)
            }
            return arr
        }
        let getPropValue = function(obj, key){
            return obj.get(key)
        }
        return ObjectComparator._areObjectsEqual(a, b, enumerate, getPropValue, Reflect.ownKeys)
    }

    static areSetsEqual(a, b) {
        let enumerate = function(a) {
            let arr = [];
            let keys = a.keys();
            for (let key of keys) {
                arr.push(key)
            }
            return arr
        }
        let getPropValue = function(obj, key){
            return obj.has(key)
        }
        return ObjectComparator._areObjectsEqual(a, b, enumerate, getPropValue, Reflect.ownKeys)
    }


    static areDatesEqual(a, b){
        return a.toString() == b.toString()
    }


    static areArraysEqual(a, b, keyEnumerateMethod = Object.keys){
        // Arrays are indentical in identical order. JSON.stringify cannot be used due to nested objects !!
        let comparationMethod = function(a, b, index){
            return ObjectComparator._areEqual(a[index], b[index], keyEnumerateMethod)
        }
        return ObjectComparator.compareArrays(a, b, comparationMethod)
    }


    static haveArraysSameValues(a, b, keyEnumerateMethod = Object.keys){
        // Arrays are indentical in identical order. JSON.stringify cannot be used due to nested objects !!
        let comparationMethod = function(a, b, index){
            return doesAincludeB(a, b[index], keyEnumerateMethod)
        }
        let doesAincludeB = function(aArray, b) {
            let aLen = aArray.length;
            let isElementInArray = false;
            for (let item of aArray) {
                if (ObjectComparator._areEqual(item, b, keyEnumerateMethod, ObjectComparator.haveArraysSameValues)) {isElementInArray = true}
            }
            return isElementInArray
        }
        return ObjectComparator.compareArrays(a, b, comparationMethod)
    }


    static compareArrays(a, b, arrayElementsComparationMethod){
        if (!ObjectComparator.areArrays([a, b])) {
            throw new TypeError(`${ObjectComparator.constructor.name}: areArraysEqual: arguments should be arrays`)
        } else if (!ObjectComparator._areAllOfEqualType([a, b])) {
            return false;
        } else {
            let aLen = a.length;
            let bLen = b.length;
            let nrOfCommonKeys = 0;
            if (aLen != bLen) {
                return false;
            } else {
                for (let index = 0; index < aLen; index++){
                    if (arrayElementsComparationMethod(a, b, index)) {
                        nrOfCommonKeys++;
                    } 
                }
                return nrOfCommonKeys == bLen ? true : false
            }      
    
        }
    }


    static areNull(arr) {
        return ObjectComparator._areOfSpecificType_iterable(arr, (element) => {return element === null ? true : false})
    }


    static areSpecialNumberValues(arr) {
        let isSpecialNumber = function(a){
            if (typeof(a) != 'number') {
                return false
            } else {
                return a === Number.POSITIVE_INFINITY || isNaN(a) || a === Number.NEGATIVE_INFINITY ? true : false
            }
        }
        return ObjectComparator._areOfSpecificType_iterable(arr, isSpecialNumber)
    }

    static arePrimitivesEqual(a, b){
        if (ObjectComparator.isPrimitive(a) && ObjectComparator.isPrimitive(b)) {
            return (a == b)
        }
    }

    static areArrays(arrayOfArgs){
        return ObjectComparator._areOfSpecificType(arrayOfArgs, 'Array')
    }


    static areFunctions(arrayOfArgs){
        return ObjectComparator._areOfSpecificType(arrayOfArgs, 'Function')
    }


    static areMaps(arrayOfArgs) {
        return ObjectComparator._areOfSpecificType(arrayOfArgs, 'Map')
    }


    static areSets(arrayOfArgs) {
        return ObjectComparator._areOfSpecificType(arrayOfArgs, 'Set')
    }


    static areDates(arrayOfArgs) {
        return ObjectComparator._areOfSpecificType(arrayOfArgs, 'Date')
    }

    static compareSpecialNumberValues(a, b) {
        try {
            if (!ObjectComparator.areSpecialNumberValues([a, b])) {
                throw new TypeError(`${ObjectComparator.constructor.name}: compareSpacialNumberValues: at least one passed item is not infinity/-infinity or NaN`)
            } else {
                if (isNaN(a) && isNaN(b)) {
                    return true
                } else {
                    return a === b
                }
            }
        } catch (e) {
        }
    }


    static _areEqual(a, b, keyEnumerateMethod, arrayCompareMethod = ObjectComparator.areArraysEqual){
        // dates, bigInts, Map, Set
        if (!ObjectComparator._areAllOfEqualType([a, b])) {
            return false;
        } 
        else if (ObjectComparator.areNull([a, b])) {
            return true;
        }
        else if (ObjectComparator.areSpecialNumberValues([a, b])) {
            return ObjectComparator.compareSpecialNumberValues(a, b);
        }
        else if (ObjectComparator.isPrimitive(a) && ObjectComparator.isPrimitive(b)) { 
            return ObjectComparator.arePrimitivesEqual(a, b)
        } 
        else if (ObjectComparator.areFunctions([a, b])) {
            return ObjectComparator.areFunctionsEqual(a, b)
        } 
        else if (ObjectComparator.areDates([a, b])) {
            return ObjectComparator.areDatesEqual(a, b)
        } 
        else if (ObjectComparator.areMaps([a, b])) {
            return ObjectComparator.areMapsEqual(a, b)
        }        
        else if (ObjectComparator.areSets([a, b])) {
            return ObjectComparator.areSetsEqual(a, b)
        }  
        else if (ObjectComparator.areArrays([a, b])){
            return arrayCompareMethod(a, b, keyEnumerateMethod)
        } 
        else {
            return ObjectComparator._areObjectsEqual(a, b, keyEnumerateMethod)
        }
    }


    static _isVariableOfSpecificType(variable, constructorName){
        return variable.constructor.name == constructorName ? true : false
    }


    static _areOfSpecificType_iterable(arr, isElementOfSpecificType){
        let nrOfSpecificTypeVals = 0;
        arr.forEach(element => {
           if(isElementOfSpecificType(element)) nrOfSpecificTypeVals++;
        });
        return nrOfSpecificTypeVals == arr.length ? true : false
    }

    static _areOfSpecificType(arrayOfVars, constructorName){
        for (let arg of arrayOfVars) {
            if (!ObjectComparator._isVariableOfSpecificType(arg, constructorName)) {
                return false;
            }
        }
        return true;        
    }


    static _areAllOfEqualType(arrayOfArgs){
        if (arrayOfArgs.length < 2) {
            return true
        } else {
            let type = typeof(arrayOfArgs[0])
            for (let a of arrayOfArgs) {
                if (typeof(a) != type) {
                    return false
                }
            }
        }
        return true;
    }


    static _areObjectsEqual(a, b, keyEnumerateMethod, propValueGetter = (obj, key) => {return obj[key]}, childrenKeyEnumarateMethod){
        let keysA = keyEnumerateMethod(a);
        let keysB = keyEnumerateMethod(b);  
        childrenKeyEnumarateMethod = childrenKeyEnumarateMethod == undefined ? keyEnumerateMethod : childrenKeyEnumarateMethod;
        let nrOfEqualKeys = 0;      
        // if (!ObjectComparator.haveArraysSameValues(keysA, keysB, ObjectComparator.arePrimitivesEqual)) {
        if (!ObjectComparator.areEqualNotEnumerable(keysA, keysB)) {
            return false;
        } else {
            let lenA = keysA.length;
            let lenB = keysB.length;
            for (let key of keysA) {
                if (ObjectComparator._areEqual(propValueGetter(a, key), propValueGetter(b, key), childrenKeyEnumarateMethod)) {
                    nrOfEqualKeys++;
                } else {
                    return false
                }
            }
            return ((nrOfEqualKeys == lenA) && (nrOfEqualKeys == lenB)) ? true : false
        }
    }
}