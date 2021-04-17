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

    _getStateIfUndefined(){
        if(this._state == undefined) { this._state = {} } 
        if(this._state.listOfElementsInWheel == undefined) {this._state.listOfElementsInWheel = []}
        return this._state
     }

    createDummySpinningWheel(){
        this.testedItem = document.createElement('test-spinning-wheel')
        this.testedItem.setNrOfWheelItems(this.getNrOfWheelPartsFromUserInput())
    }

    getTestedItem() {
        if (this.testedItem == undefined || this.testedItem == null){
            this.createDummySpinningWheel();
        }
        return this.testedItem
    }
    getNrOfWheelPartsFromUserInput(){
        return parseInt(this.shadowRoot.querySelector(".nrOfElementsInput").value)
    }
    getNrOfExecutionsFromInput() {
        return parseInt(this.shadowRoot.querySelector(".nrOfSpinsInput").value)
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
        let nrOfExecutions = this.getNrOfExecutionsFromInput();
        let indexOfExecution = 0;
        this.initiateStates();
        this.executeSingleSpin(this.getTestedItem());
        this.addWinner = function(e){
            this._state['listOfElementsInWheel'][parseInt(e.detail)].nrOfWins++;
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
        this.placeTableWithResultsAsStrint();
        this._state.listOfElementsInWheel = [];
        delete this.testedItem;
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
                <div class="output-placeholder center">
                </div>
            </div>
        `
    }
}

window.customElements.define('winnig-statistics', WinningElementStatisticsCounter)
