class ListEditingStateResponsiveComponent extends StateHandlingAbstractComponent{
    constructor() {
        super();
        this.tableBodyId = "tableBodyId";
        this.maxWheelLabelLength = 7;
    }


    connectedCallback(){
        this._getState();
        this._placeTableBodyContentOutOfStates();
    }

    _getRowAsElementWithListeners(label, message, isHidden) {
        const rowElement = this._stringToElement(this._getBodyRowTemplate(label, message, isHidden));
        const {removeButton, addButton, toggleButton, labelTextbox, messageTextbox} = this._getRowChild(rowElement);
        let addNextRowFunction = this.addNextRowCallback.bind(this);
        let removeThisRowFunction = this.removeThisRowCallback.bind(this);
        let toggleHideShowRow = this._toggleHideShowRow.bind(this);
        let updateLabel = this._updateLabel.bind(this);
        let updateMessage = this._updateMessage.bind(this);
        let limitLabelLength = this._limitLabelLength.bind(this);
        addButton.addEventListener('click', addNextRowFunction);
        removeButton.addEventListener('click', removeThisRowFunction);
        toggleButton.addEventListener('click', toggleHideShowRow);
        labelTextbox.addEventListener('input', updateLabel);
        labelTextbox.addEventListener('keydown', limitLabelLength);
        messageTextbox.addEventListener('input', updateMessage);

        return rowElement
    }


    _placeTableBodyContentOutOfStates() {
        try {
            let createSilgleRow = function (item) {
                return this._getRowAsElementWithListeners(item.label, item.message, item.isHidden)
            }.bind(this)
            let tableBodyContent = this._stringToElement(this._listToHtmlString(this._state.items, createSilgleRow));
            this._state.items.forEach((item) => {
                this.shadowRoot.querySelector('.table-body').appendChild(createSilgleRow(item))
            })
        } catch (e) {
            console.warn(`${this.constructor.name}: table to edit states cannot be created. Perhaps there were no data passed...`)
        }
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
        this.shadowRoot.querySelector('.table-body').innerHTML = '';
    }

    _updateLabel(e){
        const index  = this._findRowIndex(e.target.parentNode)
        let htmlListElement = this.querySelectorAll('li')[index]
        htmlListElement.setAttribute('data-label', e.target.innerText)
    }

    _limitLabelLength(e){
        if (e.target.innerText.length > this.maxWheelLabelLength) {
            e.preventDefault();
            this.showRedBackground(e);
        }
    }
    showRedBackground(e){
        e.target.style.backgroundColor = 'rgb(255, 150,150)';
        e.target.style.color = 'white';
        let removeColor = function removeColor(e){
            e.style.backgroundColor = '';
            e.style.color = '';
        }.bind(this, e.target);
        setTimeout(removeColor, 500)
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

    addNextRowCallback(e) {
        let rowContainingThisAddButton = e.target.parentNode.parentNode.parentNode;
        let newRowWithListeners = this._getRowAsElementWithListeners('', '', false)
        this._addLiAtIndexToInnerHtml(this._findRowIndex(rowContainingThisAddButton))
        this._addRowAtIndex(this._findRowIndex(rowContainingThisAddButton))
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

    _addRowAtIndex(index) {
        this.shadowRoot.querySelector('.table-body')
            .insertBefore(this._getRowAsElementWithListeners('','',false), this.shadowRoot.querySelector('.table-body')
            .querySelectorAll('.tr')[index].nextSibling)
    }

    _getRowChild(rowElement) {
        return {
            removeButton: rowElement.querySelector('.button.x-bg-color'),
            addButton:    rowElement.querySelector('.button.ok-bg-color'),
            toggleButton: rowElement.querySelector('.td:nth-child(4)'),
            labelTextbox: rowElement.querySelector('.td:nth-child(2)'),
            messageTextbox: rowElement.querySelector('.td:nth-child(3)')
        }
    }


    _addRowAtIndex(index) {
        this.shadowRoot.querySelector('.table-body')
            .insertBefore(this._getRowAsElementWithListeners('','',false), this.shadowRoot.querySelector('.table-body')
            .querySelectorAll('.tr')[index].nextSibling)
    }

    _findRowIndex(rowAsElement) {
        return Array.from(this.shadowRoot.querySelector('.table-body').querySelectorAll('.tr')).indexOf(rowAsElement)
    }

    // _removeTableContent(){
    //     this.shadowRoot.querySelector('.table-body').innerHTML = '';
    // }

    _getStyle(){
        return`
        <style>
            *{
                --cell-border-radius: 5px;
                --cell-height: 50px;
                box-sizing: border-box;
                font-family: Arial;
                font-size: 1.4rem;
                --font-size-small: 0.9rem;
                --border-color:#d0d7de;
                --header-color:f7f6fa;
                --font-color:#24292f;
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
                padding-top:1rem;
                padding-bottom:1rem;
                border-radius: 7px;
                // background-color: rgba(240,240,240,0.5);
                margin-top: 1rem;
                margin-bottom: 1rem;
            }
            .center-start{
                display: flex;
                justify-content: flex-start;
                align-items: center;
                align-content: center;               
            }
            .table{
                display: table;
                text-align: center;
                color: white;
                table-layout: fixed;
                width: 94%;
                min-width: 500px;
                border-collapse: separate;
                border-spacing: 3px;
                max-width: 1000px;
            }
            .table-head{
                display: table-header-group;
            }
            .table-body{
                overflow: auto;
                position: relative;
                height: 100%;
                display: table-row-group;
            }
            .full-table-cell {
                box-sizing: initial;
                position: relative;
                width: 100%;
                height: 100%;
                border-radius: var(--cell-border-radius);
            }
            .th{
                background-color: var(--header-color);
                border:solid thin var(--border-color);
                color: var(font-color);
                position: sticky;
                z-index: 10;
                top: 0;
                display: table-cell;


            }
            .tr{
                background-color: rgb(230, 230, 230);
                color: black;
                width: 100%;
                display:table-row;
            }
            .td,.th {
                height: var(--cellHeight);
                border-radius: var(--cell-border-radius);
                display: table-cell;
                border-collapse: separate;
                border-radius: 5px;
                word-break: break-word;
            }
            .td{background-color: white;}
            .td:nth-child(4){
                font-size: var(--font-size-small);
                
            }
            .td:nth-child(3){
                overflow-y:auto;
                line-height: var(--font-size);
                
            }
            
            .button{
                border-radius: 5px;
                color: white;
                position: relative;
                margin: 3px;
                width: 20px;
                height: 20px;
            }
            .button:hover:after{
                position: absolute;
                content: attr(data-label);
                background-color: white;
                color: black;
                border-radius: 5px;
                top:16px;
                width: 70px;
                z-index:10;
            }
            .button:hover {
                cursor: pointer;
                transform: scale(1.1);
                transition: 0.2s;
                z-index: 5;
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
            @media only screen and (min-width: 510px){
                .td:nth-child(3){
                    text-align: left;
                    
                }
                .td:nth-child(2){max-width: 100px;}
                .th:nth-child(1),.td:nth-child(1){
                    width: 60px; 
                }
                .th:nth-child(2),.td:nth-child(2){
                    width: 15%;
                    padding: 10px;
                }
                .th:nth-child(4),.td:nth-child(4){
                    width: 70px;
                    padding: 10px;
                }
                .th:nth-child(3),.td:nth-child(3){
                    width: 75%;
                    padding: 10px;
                    max-width: 600px;
                }
                .td:last-child{
                    cursor: pointer;
                }
            }
            @media only screen and (max-width: 510px){
                .table-head{display: none}
                .table{
                    display:flex;
                    flex-direction:column;
                    justify-content: center;
                    min-width: 450px;

                }
                .tr{
                    display:flex;
                    flex-direction:column;
                    width: 100%;
                    align-items: flex-end;
                    border: solid thin #f6f9fa;
                    border-radius: 7px;
                    margin-top: 8px;
                    margin-bottom: 8px;
                }
                .td{
                    width: 70%;
                    max-width: 70%;
                    height: var(--cell-height);
                    line-height: var(--cell-height);
                    border: solid thin #f3f4f5;
                    border-radius: 7px;
                    display: inline-block;
                }
                .td:nth-child(3):before{
                    height: calc( var(--cell-height) * 4);
                }
                .td:nth-child(3){
                    height: calc( 4 * var(--cell-height));
                }
                .td:before{
                    position: absolute;
                    left: 0;
                    width: 30%;
                    content: attr(data-label);
                    height: var(--cell-height);
                    line-height: var(--cell-height);
                    border: solid thin #f6f9fa;
                    border-radius: 7px;
                    background-color: rgba(150, 130,100,0.8);
                    color:white;
                    font-size: 1.1rem;
                    z-index: 10;
                }
            }
            @media only screen and (max-width: 650px){
                .th{
                    font-size: 1rem;
                }
            }

            @media only screen and (max-width: 460px){
                .table{
                    min-width: 400px;
                }
            }

            @media only screen and (max-width: 420px){
                .table{
                    min-width: 300px;
                    font-size: var(--font-size-small);
                }
            }

        </style>
        `
    }

    _getTemplate(){

        return `
            ${this._getStyle()}
            <div class="wrapper center">
                <div class="table">           
                    ${this._getTHeadRowTemplate()}
                    <div class="table-body" id=${this.tableBodyId}></div>             
                </div>
            </div>
        
            
        `
    }
    // 
    _getTHeadRowTemplate(){
        return `<div class="table-head">${this._getRowTemplate(["+/-", "Label", "Message", "V/H"], "th")}</div>`
    }


    _getBodyRowTemplate(wheelPartLabel, relatedMessage, isHidden){
        
        let booleanIsHiddenConverter = function() {return isHidden?'Hidden':"Visible"}.bind(this)
        let isHiddenToBgColorClassConverter = function() {return isHidden?'x-bg-color':'ok-bg-color'}.bind(this)
        let firstRowContent = `
            <div class="center full-table-cell">
                ${this._getDeleteThisRowButtonTemplate()}${this._getAddNextRowButtonTemplate()}
            </div>
            `
        let isHiddenContent = `${booleanIsHiddenConverter()}`
        return `${this._getRowTemplate(
            [firstRowContent, wheelPartLabel, relatedMessage, isHiddenContent], 
            'td', 
            {
                0: 'data-label = "+/-"',
                1: 'contenteditable=true data-label="Label"', 
                2: 'contenteditable = true data-label="Message"', 
                3: `data-label="Visibility"`
            },{
                3: `${isHiddenToBgColorClassConverter()}`
            }
        )}`
    }

    _getRowTemplate(listOfColumnContent, tdOrTh, additionalAttributesAsObj = {}, additionalClassesAsObj={}) {
        let additionalAttribs = function(index) {
            return additionalItems(index, additionalAttributesAsObj);
        }
        let additionalClasses = function(index) {
            return additionalItems(index, additionalClassesAsObj);
        }
        let additionalItems = function(index, additionalItems) {
            return Object.keys(additionalItems).includes(index.toString())?additionalItems[index.toString()]:'';
        }
        let convertToTd = function(item, index) { 
            return `
                    <div class="${tdOrTh} ${additionalClasses(index)}" ${additionalAttribs(index)}>${item}</div>
                   `
        }.bind(this)
        return `<div class="tr">${this._listToHtmlString(listOfColumnContent, convertToTd)}</div>`
    }

    _getAddNextRowButtonTemplate(){
        return this._getButtonTemplate('ok-bg-color', '+', 'add after')
    }

    _getDeleteThisRowButtonTemplate(){
        return this._getButtonTemplate('x-bg-color', '&times;', 'delete')
    }

    _getButtonTemplate(buttonClass, buttonContent, label){
        return `<div class = "center button ${buttonClass}" data-label="${label}">${buttonContent}</div>`
    }

}
window.customElements.define('editing-wheel-state-list-responsive', ListEditingStateResponsiveComponent)