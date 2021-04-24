// infoModaj.js
// stateHandlingAbstractComponent.js
// AbstractComponent
// spinningWheelComponent

class SpinningWheelWithModalComponent extends SpinningWheelComponent{
    constructor(){
        super();
        this.afterSpinCallback = this._afterSpinCallback.bind(this);
    }
    async _afterSpinCallback({winnerLabel, winnerMessage}){
        let info = this._stringToElement(`<info-modal>Winner is: ${winnerLabel}, message: ${winnerMessage}</info-modal>`);
        document.querySelector('body').appendChild(info);
        let _resolve;
        let resolveOnClick = function(){
            _resolve(true)
        }
        let prom = new Promise((resolve) => {
            _resolve = resolve;
        })
        document.querySelector('body').addEventListener('click', resolveOnClick)
        return prom
    }
}

window.customElements.define('spinning-wheel-info', SpinningWheelWithModalComponent)