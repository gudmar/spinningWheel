class ShowHideButton extends HTMLElement{
    constructor(){
        super();
        let temp = document.createElement('template');
        temp.innerHTML = this._getTemplate();
        let shadow = this.attachShadow({mode: 'open'});
        shadow.appendChild(temp.content.cloneNode(true))
    }
    attachAction(callback, trigger = 'click') {
        this.addEventListener(trigger, callback)
    }

    _setInitialValue(name, defaultValue) {
        // Check if parameter is defined as attr in html or if it is defigned via constructor and sets a proper value
        let attr = this.getAttribute(name);
        if (attr == undefined || attr == null) {
            this.setAttribute(name, defaultValue)
        } else {
        }
    }
    
    connectedCallback() {
        this._setInitialValue('value', 'hide');
        this._setInitialValue('data-name-show', '+');
        this._setInitialValue('data-name-hide', '&#215;');
        this._setInitialValue('data-size', 'small')
        this['data-size'] != 'small'?this._changeButtonToBig():'';
        this.value == 'show'? this._changeButtonToShow():this._changeButtonToHide();
        this.attachAction(this._toggleShowHideButton)
    }
    _changeButtonToBig() {
        this.shadowRoot.querySelector('.button').classList.remove('button-min')
    }
    _toggleShowHideButton() {
        this._isThisShowButton()?this._changeButtonToHide():this._changeButtonToShow();
    }
    _isThisShowButton(){
        return this.shadowRoot.querySelector('.button').classList.contains('button-show');
    }
    _addClassAndContentToButton(_class, _content){
        let button = this.shadowRoot.querySelector('.button')
        button.classList.remove('button-show');
        button.classList.remove('button-hide');
        button.classList.add(_class);
        button.innerHTML = _content;
    }
    _changeButtonToShow(){
        this._addClassAndContentToButton('button-show', this.getAttribute('data-name-show'))
    }
    _changeButtonToHide(){
        this._addClassAndContentToButton('button-hide', this.getAttribute('data-name-hide'))
    }
    _getTemplate(){
        return `
            <style>
            .button{
                display: flex;
                justify-content: center;
                align-items: center;
                position: relative;
                height: 1.2rem;
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
            .button-hide{
                background-color: rgb(170,0,0);
            }
            .button-show{
                background-color: rgb(0,170,0);
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
            <div class="button position-right-top button-min" >X</div>
        `
    }
}

window.customElements.define('show-hide-button', ShowHideButton)
