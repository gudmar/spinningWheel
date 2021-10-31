// DEPENDENCIES:
// AbstractComponent -> abstractCustomWebComponent.js


class Modal extends AbstractComponent{
    constructor(){
        super()

        this._state = {
            visible: false
        }

        this.state = new Proxy(this._state, this._getStateProxyHandler())
        this.setInitialState();
        this.content = this.shadowRoot.querySelector('.modal-content')

        
    }

    _getStateProxyHandler() {
        return {
            set: function (obj, key, val) {
                switch (key) {
                    case 'visible':
                        if (!val) {
                            obj[key] = val;
                            this.setAttribute('data-visible', false)
                            this._hide()
                        } else {
                            obj[key] = val;
                            this.setAttribute('data-visible', true)
                            this.show()
                        }
                        break;
                    default:
                            obj[key] = val;
                }
                return true;
            }.bind(this)
        }
    }

    setInitialState(){
        this.setStateIfNoAttrDefined.call(this, 'data-visible', 'visible', this._shouldBeVisible.bind(this))
    }

    nestChidElement(element){
        this.content.appendChild(element);
    }

    static get observedAttributes() {
        return ['data-visible']
    }

    connectedCallback(){
        this.closeButton = this.shadowRoot.querySelector('.modal-shut-button');
        this.closeButton.addEventListener('click', this._shouldBeVisible.bind(this, false))
        this._initialShowHide();
    }

    _initialShowHide(){
        if (this._state.visible) {
            this.show()
        } else {
            this._hide()
        }
    }

    attributeChangedCallback(attrName, oldVal, newVal) {
        if (attrName == 'data-visible'){
            newVal = this._stringOrBooleanToBoolean(newVal)
            if (this.state.visible != newVal){
                this.state.visible = newVal
            }
        }
    }

    _stringOrBooleanToBoolean(val) {
        let output = val
        if (typeof(val) == 'string') {
            output = val == "false"?false:true;
        }  
        return output
    }

    _shouldBeVisible(shouldBeVisible){
        this.state.visible = this._stringOrBooleanToBoolean(shouldBeVisible)
    }

    show(){
        this.shadowRoot.querySelector('.modal-cover').classList.remove('hidden')
        this._disableScroll();
    }
    _hide(){
        this.shadowRoot.querySelector('.modal-cover').classList.add('hidden')
        this._enableScroll();
    }

    _disableScroll(){
        window.addEventListener('touchmove', this._stopScroll);
        window.addEventListener('scroll', this._stopScroll);   
    }
    _enableScroll(scrollStopperFunction) {
        window.removeEventListener('touchmove', scrollStopperFunction);
        window.removeEventListener('scroll', scrollStopperFunction);
    }
    _stopScroll(){
        let x = window.scrollX;
        let y = window.scrollY;
        return {
            activate: function(e){
                window.scrollTo(x, y)
            }
        }
    }
    _onInnerHTMLChange() {
        // try {
            this.content.innerHTML = this.innerHTML
            
        // } catch (e) {
        //     // expected - at this moment modalMessageHolder is null;
        // }
    }

    _getTemplate(){
        return `
        <style>
        *{
            box-sizing: border-box;
        }
            .center{
                display: flex;
                justify-content: center;
                align-items: center;
                align-content: center;
            }
            .modal-cover{
                font-family: Arial, Helvetica, sans-serif;
                position: fixed;
                width: 100vw;
                height: 100vh;
                background-color: rgba(250, 250, 250, 0.5);
                top:0;
                left:0;
                z-index: 10000;
            }
            .modal-body{
                position: relative;
                width: 60%;
                max-width: 800px;
                height: 60%;
                background-color: rgb(200,200,200);
                border-radius: 10px;
                transition: 250ms;
            }
            .modal-title-bar{
                display: flex;
                justify-content: flex-end;
                width: 100%;
                height: 4rem;
            }
            .modal-content{
                position: relative;
                height:  calc( 100% - 6rem );
                padding: 1rem;
                padding-top: 0;
                overflow: auto;
            }
            .modal-shut-button{
                width: 2rem;
                height: 2rem;
                font-size: 2rem;
                background-color: red;
                color: white;
            }
            .text-big{
                font-size: 1.5rem;
                text-align: justify;
            }

            .quick-button{
                position: relative;
                width: 3rem;
                height: 3rem;
                font-size: 2rem;
                font-family: Arial, Helvetica, sans-serif;
                border-radius: 50%;
                color: black;
                background-color: rgb(200,200,200);
                transition: 250ms;
                margin: 1rem;
            }
            .quick-button:hover{
                cursor: pointer;
                background-color: dimgray;
                color: white;
                transition: 250ms;
            }
            .quick-button:active{
                background-color: goldenrod;
                color: black;
                transition: 250ms;
                transform: scale(0.9);
            }
            .modal-shut-button{
                background-color: red;
                color: white;
                z-index: 100;
            }
            .hidden{
                display: none;
            }
            @media (max-width: 880px){
                .modal-body {
                    width: 90%;
                    height: 90%;
                }
                .modal-shut-button{
                    width: 4rem;
                    height: 4rem;
                    font-size: 3rem;
                }
                .modal-title-bar {
                    height: 6rem;
                }
                .modal-content{
                    height: calc(100% - 9rem);
                }
            }
            @media (max-width: 600px){
                .modal-body {
                    width: 100%;
                    height: 100%;
                }
            }

        </style>
        <div ${(this.id == undefined || this.id == null || this.id.trim() == '') ? '' : 'id=' + this.id} class = "modal-cover center">
            <div class = "modal-body column">
                <div class = "modal-title-bar">
                    <div class="quick-button modal-shut-button center">&times;</div>
                </div>
                <div class = "modal-content">
                    ${this.innerHTML}
                </div>
            
            </div>
        </div>
        `
    }
}

window.customElements.define('hidable-modal', Modal)