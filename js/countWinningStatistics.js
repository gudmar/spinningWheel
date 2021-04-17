class WinningElementStatisticsCounter extends AbstractComponent{
    constructor() {
        super();

        this.state = {
            listOfElementsInWheel: [],
            executing: false
        }
        this._state = new Proxy(this.state, this._getStateProxyHandler())
    }

    connectedCallback() {
        this.shadowRoot.getElementById('executionStarterId').addEventListener('click', () => {this._state.executing = true})
    }

    _getStateProxyHandler() {
        return {
            set: function(obj, key, val){
                console.log(`proxy ${key} ${val}`)
                let oldValue = obj[key]
                obj[key] = val;
                if (oldValue != val){
                    if (key == 'executing'){
                        if (val == true) {
                            console.log('Starting execution')
                            this.executeTests();
                        } else {
                            console.log('Ending execution')
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

    _getStateIfUndefined(){
        if(this._state == undefined) { this._state = {} } 
        if(this._state.listOfElementsInWheel == undefined) {this._state.listOfElementsInWheel = []}
        return this._state
     }

    attributeChangedCallback(attrName, oldVal, newVal) {
    
    }

    createDummySpinningWheel(){
        let nrOfInputs = parseInt(this.shadowRoot.querySelector(".nrOfElementsInput").value)
        this.testedItem = document.createElement('test-spinning-wheel')
        console.log(this.testedItem)
        this.testedItem.setNrOfWheelItems(nrOfInputs)
    }

    getTestedItem() {
        if (this.testedItem == undefined || this.testedItem == null){
            this.createDummySpinningWheel();
        }
        return this.testedItem
        // let testedItemSelector = this.getAttribute('data-tested-item-selector');
        // let getTestedItemBySelector = function(selector) {
        //     let testedItem = document.querySelector(selector)
        //     if (testedItem == null || testedItem == undefined) {
        //         return undefined
        //     } else {
        //         return testedItem
        //     }
        // }.bind(this)
        // let testedItem = getTestedItemBySelector(testedItemSelector);
        // testedItem = testedItem==undefined?getTestedItemBySelector('spinning-wheel'):undefined;
        // if (testedItem != undefined) {
        //     return testedItem
        // } else {
        //     throw (`${this.constructor.name}: No spinning wheel instance found in DOM. Will not execute.`)
        // }
    }
    getNrOfExecutions() {
        // let nrOfExecutions = this.getAttribute('data-nr-of-executions');
        // return (nrOfExecutions==undefined || nrOfExecutions == null) ? 10 : nrOfExecutions
        return this.shadowRoot.querySelector(".nrOfSpinsInput").value
    }
    getNrOfSpinWheelEntries(){
        return this.getTestedItem().querySelectorAll('li').length;
    }

    getSingleState() {
        return {
            indexNr: null,
            nrOfWins: 0
        }
    }

    initiateStates(){
        this._state.listOfElementsInWheel = [];
        console.log(this._state)
        for (let i = 0; i < this.getNrOfSpinWheelEntries(); i++) {
            this._state.listOfElementsInWheel.push(this.getSingleState())
        }
    }

    executeSingleSpin(testTarget) {
        testTarget.clickWheelForTestPuropses();
    }

    executeTests() {
        let testedItem = this.getTestedItem();    
        let nrOfExecutions = this.getNrOfExecutions();
        let indexOfExecution = 0;
        this.initiateStates();
        this.executeSingleSpin(this.getTestedItem());
        this.addWinner = function(e){
            console.log('Execution nr : ' + indexOfExecution)
            this._state['listOfElementsInWheel'][parseInt(e.detail)].nrOfWins++;
            indexOfExecution++;
            this.executeSingleSpin(this.getTestedItem());
            if (indexOfExecution > nrOfExecutions) {
                this._state['executing'] = false;
            }
        }.bind(this) //, indexOfExecution, nrOfExecutions)
        this.initiateStates();
        testedItem.addEventListener('spinEnded', this.addWinner)
    }
    executionTheardown() {
        let testedItem = this.getTestedItem();
        testedItem.removeEventListener('spinEnded', this.addWinner);
        this.placeTableWithResultsAsStrint();
        this._state.listOfElementsInWheel = [];
    }

    placeTableWithResultsAsStrint() {
        this.shadowRoot.querySelector('.output-placeholder').innerHTML = this.getTableWithResultsAsString()
    }

    getTableWithResultsAsString() {
        let output = '';
        let tHead = `
            <thead><tr><th>Index</th><th>NrOfWind</th></tr></thead>
        `
        let listOfTrItems = this.state.listOfElementsInWheel.map((item, index) => {
            return `<tr><td>${index}</td><td>${item.nrOfWins}</td></tr>`
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
            input{
                margin-right: 3rem;
                position: relative;
                width: 4rem;
            }
            </style>
            <div class = "wrapper center column top">
                <div class = "title-bar center left">
                    <custom-button data-label="Start execution" value = "show" id="executionStarterId"></custom-button>
                    <div class="title">Statistics for spinning wheel</div>
                </div>
                <div class = "title-bar center">
                    <span>Nr of elements: </span>
                    <input class = "nrOfElementsInput" type = "number" value = "10">
                    <span>Nr of spins: </span>
                    <input class = "nrOfSpinsInput" type = "number" value = "10">
                </div>
                <div class="output-placeholder">
                </div>
            </div>
        `
    }
}

window.customElements.define('winnig-statistics', WinningElementStatisticsCounter)
