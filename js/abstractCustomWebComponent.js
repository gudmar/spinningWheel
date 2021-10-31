class AbstractComponent extends HTMLElement {
    constructor(){
        super();
        this.COMPONENT_STATE_CHANGED = 'componentStateChanged';

        let sH = this.attachShadow({mode: 'open'});
        this._switchContent(this._getTemplate(), sH)
        this._state = {}
        const observer = new MutationObserver(this._onInnerHTMLChange.bind(this)) //(this._onInnerHTMLChange.bind(this))
        observer.observe(this, 
            {
                subtree: true,
                childList: true,
                attributes: true,
                characterData: true
            }
        )
    }



    _removeAllShadowRootChildren() {
        while (this.shadowRoot.firstChild) {
            this.shadowRoot.removeChild(myNode.lastChild);
        }
    }

    _removeElement(element){
        element.parentNode.removeChild(element);
    }

    _onInnerHTMLChange() {
            this.content.innerHTML = this.innerHTML
            console.log('CHANGING WRAPPED CONTENT')
    }

    setStateIfNoAttrDefined(attrName, stateKey, cb){
        let attr = this.getAttribute(attrName);
        if ((attr == undefined) || attr == null) {
            cb(this.state[stateKey])
        } else {
            cb(attr)
        }
    }
    _stringToElement(htmlString){
        let template = document.createElement('template');
        template.innerHTML = htmlString;
        return template.content.cloneNode(true)        
    }
    _switchContent(htmlString, destinationElement){
        // let template = document.createElement('template');
        // template.innerHTML = htmlString;
        // destinationElement.innerText = '';
        // destinationElement.appendChild(template.content.cloneNode(true));
        destinationElement.appendChild(this._stringToElement(htmlString))
    }
    _getUniqueId() {
        let date = new Date();
        return date.getDay().toString(36) + date.getHours().toString(36) + date.getMinutes().toString(36) + date.getSeconds().toString(36) + Math.random().toString(36)
    }

    _stringOrBooleanToBoolean(val) {
        let output = val
        if (typeof(val) == 'string') {
            output = val == "false"?false:true;
        }  
        return output
    }

}