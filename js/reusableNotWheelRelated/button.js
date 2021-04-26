class CustomButton extends AbstractComponent{

    // Here some button effects could be added - like wobbling button etc

    constructor(){
        super();
        this.state = {
            label: 'Button'
        }
        this.setInitialState();
    }

    _onInnerHTMLChange(){
        
    }


    attachAction(callback, trigger = 'click') {
        this.addEventListener(trigger, callback)
    }

    // setStateIfNoAttrDefined(attrName, stateKey, cb){
    //     let attr = this.getAttribute(attrName);
    //     if ((attr == undefined) || attr == null) {
    //         cb(this.state[stateKey])
    //     } else {
    //         cb(attr)
    //     }
    // }

    setInitialState(){
        this.setStateIfNoAttrDefined('label', 'label', this.setButtonLabel.bind(this))
    }

    setButtonLabel(label) {
        this.shadowRoot.querySelector('.button').innerHTML = label
    }


    attributeChangedCallback(attrName, oldVal, newVal) {

        if (attrName == 'data-label'){
            this.setButtonLabel(newVal)
        }
    }


    connectedCallback() {
        // let cb = function (){
        //     this.innerHTML = "Content"
        // }.bind(this)
        // setTimeout(cb, 700)
    }
    _changeButtonToBig() {
        this.shadowRoot.querySelector('.button').classList.remove('button-min')
    }


    static get observedAttributes() {
        return ['data-label']
    }

    _getTemplate(){
        return `
            <style>
            *{
                position: relative;
            }
            .button-wrapper{
                display: inline-block
            }
            .button{
                display: flex;
                justify-content: center;
                align-items: center;
                // position: relative;
                // height: 1.2rem;
                // max-width: 100px;
                display: flex;
                
                text-align: center;
                color: white;
                background-color: blue;
                font-family: Arial;
                border-radius: 5px;
                padding: 5px;
                transition: 0.2s;
            }
            .button-min{
                border-radius: 50%;
                width: 0.7rem;
                height: 0.7rem;
            }
            .button:hover {
                cursor: pointer;
                background-color: rgb(120, 120, 255);
                transition: 0.2s;
            }
            .button:active {
                background-color: rgb(200, 200, 255);
                color: black;
            }
            </style>
            <div class = "button-wrapper">
                <div class="button position-right-top" ></div>
            </div>
        `
    }
}

window.customElements.define('custom-button', CustomButton)
