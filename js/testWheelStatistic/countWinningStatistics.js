// DEPENDENCIES:
// ColorGenerator    -> colorGenerator.js
// wheelDrawer       -> wheelDrawer.js
// AbstractComponent -> abstractCustomWebComponent.js
// StateHandlingAbstractComponent ->  stateHandlingAbstractComponent.js
// SpinningWheelComponent_testVersion -> testSStatisticsSpinningWheel.js



class WinningElementStatisticsCounter extends AbstractComponent{
    constructor() {
        super();

        this.state = {
            nrOfWheelParts: 0,
            executing: false
        }
        this._state = new Proxy(this.state, this._getStateProxyHandler())
        this._createExecutionResultsProxy();
        this.executionResults = {}
    }

    _validateNumberInput(target, oldVal, newVal, min, max){
        let informNotValid = function(){
            target.classList.add('not-valid')
            setTimeout(() => {
                target.classList.remove('not-valid')
            }, 500)
            target.innerHTML = oldVal
        }
        if (isNaN(parseInt(newVal))){
            informNotValid();
            return false;
        } else if ((parseInt(newVal) > max) || (parseInt(newVal) < min)) {
            informNotValid();
            return false
        }
        return true
    }

    connectedCallback() {
        let onExecutionPressed = function() {
            this.emptyExecutionResults();
            this._state.executing = true
        }.bind(this)
        this._rememberInputValues();
        this.shadowRoot.getElementById('executionStarterId').addEventListener('click', () => {
            onExecutionPressed();
        })
        this.shadowRoot.querySelector('.nrOfElementsInput').addEventListener('input', this._changeNrOfExecitions.bind(this))
        this._createExecutionResultsProxy();
        this.placeTableWithResultsAsString();
    }

    _rememberInputValues(){
        this._state.nrOfWheelParts = this.shadowRoot.querySelector('.nrOfElementsInput').innerHTML
    }

    _createExecutionResultsProxy() {
        let obj = {};
        let nrOfCircleParts = this._getNrOfWheelPartsFromUserInput();
        for (let i = 0; i < nrOfCircleParts; i++) {
            obj[i + ''] = 0;
        }
        delete this.executionResults
        this.executionResults =  new Proxy(obj, this._getExecutionResultsHandler)
    }

    _changeNrOfExecitions(e){
        let isValid = this._validateNumberInput(this.shadowRoot.querySelector('.nrOfElementsInput'), this._state.nrOfWheelParts, e.target.innerHTML, 1, 49)
        if (isValid) {
            this._createExecutionResultsProxy();
            this.placeTableWithResultsAsString();
            this._rememberInputValues();
        }
    }

    _getExecutionResultsHandler(){
        return {
            set: function(obj, key, val){
                if (obj[key] == undefined) {
                   
                } else {
                    if (obj[key] != val) {
                        this._changeTableIndex(parseInt[key], val)
                    }
                }
                obj[key] = val;
                return true
            }.bind(this)
        }
    }

    _getStateProxyHandler() {
        return {
            set: function(obj, key, val){
                let oldValue = obj[key]
                obj[key] = val;
                if (oldValue != val){
                    if (key == 'executing'){
                        if (val == true) {
                            this.executeTests();
                        } else {
                            this.executionTheardown();
                        }
                    } 
                }
                return true
            }.bind(this),
            get: function(obj, key) {
                return obj[key]
            }
        }
    }

    _changeTableIndex(index, val) {
        let targetTableBody = this.shadowRoot.querySelector('table').querySelector('tbody')
        let targetRow = targetTableBody.querySelectorAll('tr')[index];
        targetRow.querySelectorAll('td')[1].innerHTML = val
    }

    _getStateIfUndefined(){
        if(this._state == undefined) { this._state = {} } 
        if(this._state.listOfElementsInWheel == undefined) {this._state.listOfElementsInWheel = []}
        return this._state
     }

    createDummySpinningWheel(){
        this.testedItem = document.createElement('test-spinning-wheel')
        this.testedItem.setNrOfWheelItems(this._getNrOfWheelPartsFromUserInput())
    }

    getTestedItem() {
        if (this.testedItem == undefined || this.testedItem == null){
            this.createDummySpinningWheel();
        }
        return this.testedItem
    }
    _getNrOfWheelPartsFromUserInput(){
        return parseInt(this.shadowRoot.querySelector(".nrOfElementsInput").innerHTML)
    }
    _getNrOfExecutionsFromInput() {
        return parseInt(this.shadowRoot.querySelector(".nrOfSpinsInput").innerHTML)
    }
    countNrOfSpinWheelEntries(){
        return this.getTestedItem().querySelectorAll('li').length;
    }

    getSingleState() {
        return {
            indexNr: null,
            nrOfWins: 0
        }
    }

    emptyExecutionResults(){
        Object.keys(this.executionResults).forEach(key => {
            this.executionResults[key] = 0;
        });
    }

    initiateStates(){
        this._state.listOfElementsInWheel = [];
        for (let i = 0; i < this.countNrOfSpinWheelEntries(); i++) {
            this._state.listOfElementsInWheel.push(this.getSingleState())
        }
    }

    executeSingleSpin(testTarget) {
        testTarget.clickWheelForTestPuropses();
    }

    executeTests() {
        let testedItem = this.getTestedItem();    
        let nrOfExecutions = this._getNrOfExecutionsFromInput();
        let indexOfExecution = 0;
        this.initiateStates();
        this.executeSingleSpin(this.getTestedItem());
        this.addWinner = function(e){
            // this._state['listOfElementsInWheel'][parseInt(e.detail)].nrOfWins++;
            this.executionResults[e.detail]++;
            indexOfExecution++;
            this.executeSingleSpin(this.getTestedItem());
            if (indexOfExecution > nrOfExecutions) {
                this._state['executing'] = false;
            }
        }.bind(this)
        this.initiateStates();
        testedItem.addEventListener('spinEnded', this.addWinner)
    }
    executionTheardown() {
        let testedItem = this.getTestedItem();
        testedItem.removeEventListener('spinEnded', this.addWinner);
        this.placeTableWithResultsAsString();
        this._state.listOfElementsInWheel = [];
        delete this.testedItem;
    }

    placeTableWithResultsAsString() {
        this.shadowRoot.querySelector('.output-placeholder').innerHTML = this.getTableWithResultsAsString()
    }

    getTableWithResultsAsString() {
        let output = '';
        let tHead = `
            <thead><tr><th>Index</th><th>NrOfWind</th></tr></thead>
        `
        let listOfTrItems = Object.keys(this.executionResults).map((item, index) => {
            return `<tr><td>${item}</td><td>${this.executionResults[item]}</td></tr>`
        })
        let bodyContent = listOfTrItems.reduce((acc, element) => {return acc + element})
        let tBody = `
            <tbody>${bodyContent}</tbody>
        `
        
        return `
            <table>
                ${tHead}${tBody}
            </table>
        `

    }


    _getTemplate() {
        return `
            <style>
            .center{
                display: flex;
                justify-content: center;
                align-items: center;
                align-content: center;
            }
            .top{
                display: flex;
                flex-direction: row;
                align-items: flex-start;
                align-content: flex-start;
            }
            .left{
                display: flex;
                flex-direction: row;
                justify-content: flex-start;
            }
            .justify{
                text-align: justify;
            }
            .column{
                flex-direction: column;
            }
            .row{
                flex-direction: row;
            }
            .even{
                justify-content: space-around; 
            }
            .wrapper{

            }
            .title-bar{
                display: flex;
                position: relative;
                width: 100%;
                flex-direction: row;
                margin-top: 0.5rem;
                margin-bottom: 1rem;
            }
            .title{
                margin-left: 5rem;
                font-weight: bold;
                font-size: 1.3rem;
            }
            .output-placeholder{
                width: 100%;
                position: relative;
            }
            table{
                text-align: center;
                // border: solid thin black;
            }
            td{
                background-color: green;
                padding: 5px;
                color: white;
            }
            th{
                background-color: black;
                padding: 5px;
                color: white;                
            }
            .input{
                margin-right: 3rem;
                position: relative;
                width: 4rem;
                width: 5rem;
                height: 1.3rem;
                border: solid black thin;
                border-radius: 5px;
                background-color: white;
                transition: 250ms;
            }
            .not-valid:after{
                position: absolute;
                // width: 6rem;
                height: 1.4rem;
                line-height: 1.4rem;
                top: 2rem;
                content: '1 to 49';
                background: white;
                z-index: 10000;
            }
            .not-valid{
                background-color: red;
                transition: 250ms;
            }
            
            </style>
            <div class = "wrapper center column top">
                <div class = "title-bar center left">
                    <custom-button data-label="Start execution" value = "show" id="executionStarterId"></custom-button>
                    <div class="title">Statistics for spinning wheel</div>
                </div>
                <div class = "title-bar center">
                    <span>Nr of elements: </span>
                    <div class = "nrOfElementsInput input center" type = "number" contenteditable>10</div>
                    <span>Nr of spins: </span>
                    <div class = "nrOfSpinsInput input center" type = "number" contenteditable>100</div>
                </div>
                <div class="output-placeholder center">
                </div>
            </div>
        `
    }
}

window.customElements.define('winnig-statistics', WinningElementStatisticsCounter)
