class ListEditingStateComponent extends StateHandlingAbstractComponent{
    constructor() {
        super();

    }


    connectedCallback(){
        this._getState();
        this._placeTableBodyContentOutOfStates();
    }


    _placeTableBodyContentOutOfStates() {
        try {
            let createSilgleRow = function (item) {
                return this._getRowAsElementWithListeners(item.label, item.message, item.isHidden)
            }.bind(this)
            let tableBodyContent = this._stringToElement(this._listToHtmlString(this._state.items, createSilgleRow));
            this._state.items.forEach((item) => {
                this.shadowRoot.querySelector('tbody').appendChild(createSilgleRow(item))
            })
        } catch (e) {
            console.warn(`${this.constructor.name}: table to edit states cannot be created. Perhaps there were no data passed...`)
        }
    }



    _getRowAsElementWithListeners(label, message, isHidden) {
        const rowElement = this._stringToElement(this._getBodyRowTemplate(label, message, isHidden));
        const {removeButton, addButton, toggleButton, labelTextbox, messageTextbox} = this._getRowChild(rowElement);
        let addNextRowFunction = this.addNextRowCallback.bind(this);
        let removeThisRowFunction = this.removeThisRowCallback.bind(this);
        let toggleHideShowRow = this._toggleHideShowRow.bind(this);
        let updateLabel = this._updateLabel.bind(this);
        let updateMessage = this._updateMessage.bind(this);
        addButton.addEventListener('click', addNextRowFunction);
        removeButton.addEventListener('click', removeThisRowFunction);
        toggleButton.addEventListener('click', toggleHideShowRow);
        labelTextbox.addEventListener('input', updateLabel);
        messageTextbox.addEventListener('input', updateMessage);

        return rowElement
    }


    _getRowChild(rowElement) {
        return {
            removeButton: rowElement.querySelector('.button.x-bg-color'),
            addButton:    rowElement.querySelector('.button.ok-bg-color'),
            toggleButton: rowElement.querySelector('td:nth-child(4)'),
            labelTextbox: rowElement.querySelector('td:nth-child(2)'),
            messageTextbox: rowElement.querySelector('td:nth-child(3)')
        }
    }


    _updateLabel(e){
        const index  = this._findRowIndex(e.target.parentNode)
        let htmlListElement = this.querySelectorAll('li')[index]
        htmlListElement.setAttribute('data-label', e.target.innerText)
    }


    _updateMessage(e){
        const index = this._findRowIndex(e.target.parentNode)
        let htmlListElement = this.querySelectorAll('li')[index]
        htmlListElement.innerText = e.target.innerText;
    }


    _toggleHideShowRow(e){
        if (e.target.innerText == 'Hidden') {
            this._showWheelElement(e)
        } else {
            this._hideWheelElement(e)
        }
    }


    _hideWheelElement(e){
        const index = this._findRowIndex(e.target.parentNode);
        this._addHiddenClassToLiAtIndex(index)
        e.target.classList.remove('ok-bg-color');
        e.target.classList.add('x-bg-color');
        e.target.innerText = 'Hidden'
    }


    _showWheelElement(e){
        const index = this._findRowIndex(e.target.parentNode);
        this._removeHiddenClassFromLiAtIndex(index)
        e.target.classList.remove('x-bg-color');
        e.target.classList.add('ok-bg-color');
        e.target.innerText = 'Visible'
    }


    removeThisRowCallback(e) {
        let rowToBeRemoved = e.target.parentNode.parentNode.parentNode;
        this._removeLiAtIndexFromInnerHtml(this._findRowIndex(rowToBeRemoved))
        this._removeElement(rowToBeRemoved);
    }



    addNextRowCallback(e) {
        let rowContainingThisAddButton = e.target.parentNode.parentNode.parentNode;
        let newRowWithListeners = this._getRowAsElementWithListeners('', '', false)
        this._addLiAtIndexToInnerHtml(this._findRowIndex(rowContainingThisAddButton))
        this._addRowAtIndex(this._findRowIndex(rowContainingThisAddButton))
    }


    _findRowIndex(rowAsElement) {
        return Array.from(this.shadowRoot.querySelector('tBody').querySelectorAll('tr')).indexOf(rowAsElement)
    }


    _addRowAtIndex(index) {
        this.shadowRoot.querySelector('tbody')
            .insertBefore(this._getRowAsElementWithListeners('','',false), this.shadowRoot.querySelector('tbody')
            .querySelectorAll('tr')[index].nextSibling)
    }


    _recreateThisComponent(isWholeListChanged){
        if (isWholeListChanged){
            this._removeTableContent();
            this._placeTableBodyContentOutOfStates();
        } else {
            // only li inside list changed, this case is taken care of in this component manualy
        }
    }

    _removeTableContent(){
        this.shadowRoot.querySelector('tbody').innerHTML = '';
    }


    _getTemplate(){
        return `
            <style>
                *{
                    --cell-border-radius: 5px;
                    box-sizing: border-box;
                }
                .center{
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    align-content: center;
                }
                .wrapper{
                    width: 100%;
                    position: relative;
                }
                table{
                    text-align: center;
                    color: white;
                    table-layout: fixed;
                    width: 100%;
                    min-width: 500px;
                }
                tbody{
                    overflow: auto;
                    position: relative;
                    height: 100%;
                }
                th{
                    background-color: rgb(100, 100, 100);
                    color: white;
                    position: sticky;
                    z-index: 10000;
                    top: 0;

                }
                tr{
                    background-color: rgb(230, 230, 230);
                    color: black;
                    width: 100%;
                }
                td,th {
                    height: 50px;
                    border-radius: var(--cell-border-radius);
                    
                }
                td:nth-child(3){
                    text-align: left;
                    
                }
                th:nth-child(1),td:nth-child(1){
                    width: 60px; 
                }
                th:nth-child(2),td:nth-child(2){
                    width: 15%;
                    padding: 10px;
                }
                th:nth-child(4),td:nth-child(4){
                    width: 70px;
                    padding: 10px;
                }
                th:nth-child(3),td:nth-child(3){
                    width: 75%;
                    padding: 10px;
                }
                .full-table-cell {
                    box-sizing: initial;
                    position: relative;
                    width: 100%;
                    height: 100%;
                    border-radius: var(--cell-border-radius);
                }
                .button{
                    border-radius: 5px;
                    color: white;
                    position: relative;
                    margin: 3px;
                    width: 20px;
                    height: 20px;
                }
                .button:hover {
                    cursor: pointer;
                    opacity: 0.5;
                    transform: scale(1.1);
                    transition: 0.2s;
                }
                .button:active {
                    background-color: rgb(200, 200, 255);
                    color: black;
                }
                .viewed-cell{
                    color: white;
                }
                .viewed-cell:hover{
                    cursor: pointer;
                    opacity: 0.5;
                }
                .ok-bg-color{
                    background-color: green;
                    color: white;
                }
                .x-bg-color{
                    background-color: red;
                    color: white;
                }
            </style>
            <div class="wrapper">
                <table>
                    ${this._getTHeadRowTemplate()}
                    <tbody>
                    </tbody>
                </table>
            </div>
        `
    }

    
    _getTHeadRowTemplate(){
        return `<thead>${this._getRowTemplate(["+/-", "Label", "Message", "V/H"], "th")}</thead>`
    }


    _getBodyRowTemplate(wheelPartLabel, relatedMessage, isHidden){
        let booleanIsHiddenConverter = function() {return isHidden?'Hidden':"Visible"}.bind(this)
        let isHiddenToBgColorClassConverter = function() {return isHidden?'x-bg-color':'ok-bg-color'}.bind(this)
        let firstRowContent = `<div class="center full-table-cell">${this._getDeleteThisRowButtonTemplate()}${this._getAddNextRowButtonTemplate()}</div>`
        let isHiddenContent = `${booleanIsHiddenConverter()}`
        return `${this._getRowTemplate([firstRowContent, wheelPartLabel, relatedMessage, isHiddenContent], 
            'td', {1: 'contenteditable=true', 2: 'contenteditable = true', 3: `class = ${isHiddenToBgColorClassConverter()}`})}`
    }


    _getAddNextRowButtonTemplate(){
        return this._getButtonTemplate('ok-bg-color', '+')
    }


    _getDeleteThisRowButtonTemplate(){
        return this._getButtonTemplate('x-bg-color', '&times;')
    }


    _getButtonTemplate(buttonClass, buttonContent){
        return `<div class = "center button ${buttonClass}">${buttonContent}</div>`
    }


    _getRowTemplate(listOfColumnContent, tdOrTh, additionalAttributesAsObj = {}) {
        let additionalAttribs = function(index) {
            return Object.keys(additionalAttributesAsObj).includes(index.toString())?additionalAttributesAsObj[index.toString()]:'';
        }
        let convertToTd = function(item, index) { return `<${tdOrTh} ${additionalAttribs(index)}>${item}</${tdOrTh}>`}.bind(this)
        return `<tr>${this._listToHtmlString(listOfColumnContent, convertToTd)}</tr>`
    }


}

window.customElements.define('editing-wheel-state-list', ListEditingStateComponent)