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
                    // position: relative; 
                    height: 50px;
                    border-radius: var(--cell-border-radius);
                    padding: 10px;
                }
                td:nth-child(3){
                    text-align: left;
                }
                th:nth-child(1),td:nth-child(1){
                    width: 10%;
                }
                th:nth-child(2),td:nth-child(2){
                    width: 15%;
                }
                th:nth-child(4),td:nth-child(4){
                    width: 70px;
                }
                th:nth-child(3),td:nth-child(3){
                    width: 75%;
                }
                .full-table-cell {
                    position: relative;
                    widht: 100%;
                    height: 100%;
                    border-radius: var(--cell-border-radius);
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
        let firstRowContent = `<div class = "full-table-cell center">${this._getDeleteThisRowButtonTemplate()}${this._getAddNextRowButtonTemplate()}</div>`
        let isHiddenContent = `${booleanIsHiddenConverter()}`
        return `<tr>${this._getRowTemplate([firstRowContent, wheelPartLabel, relatedMessage, isHiddenContent], 
            'td', {2: 'contenteditable = true', 3: `class = ${isHiddenToBgColorClassConverter()}`})}</tr>`
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