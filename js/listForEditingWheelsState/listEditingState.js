class ListEditingStateComponent extends StateHandlingAbstractComponent{
    constructor() {
        super();

    }
    connectedCallback(){
        this._placeTableBodyContentOutOfStates();
    }
    _placeTableBodyContentOutOfStates(){
        console.warn('Handle no list case - empty tag')
        this._getState(); // id , label  items
        let createSilgleRow = function(item){
            return this._getBodyRowTemplate(item.id, item.label, item.isHidden)
        }.bind(this)
        console.log(this._state)
        let tableBodyContent = this._stringToElement(this._listToHtmlString(this._state.items, createSilgleRow));
        this.shadowRoot.querySelector('tbody').appendChild(tableBodyContent)
    }

    _recreateThisComponent(){

    }

    _getTemplate(){
        return `
            <style>
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
                }
                th{
                    background-color: rgb(100, 100, 100);
                    color: white;
                }
                tr{
                    background-color: rgb(230, 230, 230);
                    color: black;
                }
                tr:nth(3){
                    text-align: left;
                }
                .full-table-cell {
                    position: relative;
                    widht: 100%;
                    height: 100%;
                }
                .button{
                    border-radius: 5px;
                    color: white;
                    position: relative;
                    width: 1rem;
                    height: 1rem;
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
                }
                .x-bg-color{
                    background-color: red;
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
        return this._getRowTemplate(["+/-", "Label", "Message", "V/H"], "th")
    }

    _getBodyRowTemplate(wheelPartLabel, relatedMessage, isHidden){
        let booleanIsHiddenConverter = function() {return isHidden?'Hidden':"Visible"}.bind(this)
        let isHiddenToBgColorClassConverter = function() {return isHidden?'x-bg-color':'ok-bg-color'}.bind(this)
        let firstRowContent = `<div class = "full-table-cell center">${this._getDeleteThisRowButtonTemplate()}${this._getAddNextRowButtonTemplate()}</div>`
        let isHiddenContent = `<div class = "full-table-cell viewed-cell center ${isHiddenToBgColorClassConverter()}">${booleanIsHiddenConverter()}</div>`
        return `<tr>${this._getRowTemplate([firstRowContent, wheelPartLabel, relatedMessage, isHiddenContent], 'td', {2: 'contenteditable = true'})}</tr>`
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

    _listToHtmlString(listOfItems, cbConvertingSilgleElementToHTMLString){
        let listOfHtmlStrings = listOfItems.map(cbConvertingSilgleElementToHTMLString);
        return listOfHtmlStrings.reduce((acc, item) => {
            return acc + item;
        })
    }


}

window.customElements.define('editing-wheel-state-list', ListEditingStateComponent)