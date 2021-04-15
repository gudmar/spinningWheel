class SpinningWheelComponent extends StateHandlingAbstractComponent{

    constructor(){
        super()
    }

    connectedCallback(){
        this.shadowRoot.querySelector('.wrapper').appendChild(this._getWheelCreator().createSpinCircleElement(this._getState()))
    }

    _getWheelCreator() {
        if (this.wheelCreator == undefined) {
            this.wheelCreator = new SvgWheelCreator();
        }
        return this.wheelCreator
    }

    _getTemplate(){
        let wheelCreator = this._getWheelCreator();
        console.log(this._getState())
        console.log(this._getWheelCreator().createSpinCircleElement(this._getState()))
        let output = `
            <style>
                .center{
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    align-content: center;
                }
                .wrapper{
                    position: relative;
                }
            </style>
            <div class = 'wrapper center'>
            </div>
        `
        return output
    }

}

window.customElements.define('spinning-wheel', SpinningWheelComponent)