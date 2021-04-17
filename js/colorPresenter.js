// DEPENDENCIES:
// ColorGenerator    -> colorGenerator.js


class ColorPresenter extends AbstractComponent{
    constructor() {
        super();
        this._state = {
            nrOfColorSamples: 20
        }
        this.colorGenerator = new ColorGenerator(20)
    }

    _getStateProxyHandler() {
        return {
            set: function(obj, key, val){
                obj[key] = val;
                this._recreateColorPresenter
                return true
            }
        }
    }
    _getStateIfUndefined(){
        if(this._state == undefined) { this._state = {} } 
        if(this._state.nrOfColorSamples == undefined) {this._state.nrOfColorSamples = 50}
        return this._state
     }
    _getColorGenerator(){
        let state = this._getStateIfUndefined();
        if (this.colorGenerator == undefined) {
            this.colorGenerator = new ColorGenerator(state.nrOfColorSamples)
        }
        return this.colorGenerator
    }
    _getListOfColorSamplesAsString(){
        return this._getColorGenerator().createListOfColorsAsString()
    }
    _getListOfColorsAsHTML(){
        return this._getListOfColorSamplesAsString().map((item, index) => {
            return `<div class = "color-sample center" style = "background-color: ${item['bg']}; color: ${item['fg']};">Sample ${index}</div>`
        })
    }
    _reduceListToString(list){
        return list.reduce((acc, element)=>{
            return acc + element + '';
        })
    }
    
    _recreateColorPresenter(){
        this._removeAllShadowRootChildren();
        this._switchContent(this._getListOfColorsAsHTML(), this.shadowRoot)
    }


    attributeChangedCallback(attrName, oldVal, newVal) {
        if (attrName == 'data-nr-of-samples'){
            this.state.nrOfColorSamples = newVal
        }
    }


    _getTemplate() {
        return `
            <style>
                .color-sample {
                    margin: 0.5rem;
                    position: relative;
                    width: 100px;
                    height: 100px;
                }
                .color-samples-wrapper {
                    display: flex;
                    flex-wrap: wrap;
                }
                .center{
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    align-content: center;
                }
            </style>
            <div class="color-samples-wrapper center">${this._reduceListToString(this._getListOfColorsAsHTML())}</div>
        `
    }
}

window.customElements.define('color-presenter', ColorPresenter)
