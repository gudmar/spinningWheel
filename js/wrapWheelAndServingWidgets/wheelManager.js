class WheelControlWrapper extends StateHandlingAbstractComponent {
    constructor(){
        super();
        this.supportedNodeNames = ['SPINNING-WHEEL', 'EDITING-WHEEL-STATE-LIST']
        this.subscribersStates = this._getSubscribersStates()
        this._addEventListenersToEachSubscribent();
        this._updateEachSubscriberOnThisInnerHtmlChange()

        console.log({subscribersStates: this.subscribersStates})
    }


    _onInnerHTMLChange(mutationsList, observer){
        if (mutationsList[0].type == 'attributes') {
            this._restartManager();
            return null
        }

        let getItemsToCompare = function(arrayOfItems){
            let output = arrayOfItems.map((item) => {
                const {label, isHidden, message} = item
                return {label, isHidden, message}
            })
            return output
        }
        let mutationTarget = mutationsList[0].target;
        let getUlHtmlAfterChange = function(){
            if (mutationTarget.nodeName == "LI") {return mutationTarget.parentNode;}
            else if (mutationTarget.nodeName == "UL") {return mutationTarget}
            else {return mutationTarget.querySelector('ul')}
        }
        let getStateCopyAfterChange = function(){
            return  this._copyArrayOfObjects(this._getListOfEntriesFromInnerHTML.call(getUlHtmlAfterChange(mutationTarget)))
        }.bind(this)
        let currnetState = this._copyArrayOfObjects(this._getState().items)
        let stateFromHtmlAfterChange = getStateCopyAfterChange()
        if (!Comparator.areStatesEqual(getItemsToCompare(currnetState), getItemsToCompare(stateFromHtmlAfterChange))){
            this._state.items = stateFromHtmlAfterChange
            this._recreateThisComponent();
            this._emitEventOnStateChange();
        }
        console.log(mutationsList)
    }


    _restartManager(){
        this._removeEventListenersFromEachSubscriber();
        this._state = undefined;
        this._getState();
        this.subscribersStates = undefined;
        this.subscribersStates = this._getSubscribersStates()
        this._addEventListenersToEachSubscribent();
    }


    // _recreateThisComponent(){
        
    // }


    _addEventListenersToEachSubscribent(){
        console.log(this.subscribersStates)
        for(let subscriber in this.subscribersStates){
            document.getElementById(subscriber).addEventListener(this.COMPONENT_STATE_CHANGED, this.subscribersStates[subscriber].eventListenerCallback)
        }
    }


    _removeEventListenersFromEachSubscriber(){
        for(let subscriber in this.subscribersStates){
            document.getElementById(subscriber).removeEventListener(this.this.COMPONENT_STATE_CHANGED, this.subscribersStates[subscriber].eventListenerCallback)
        }        
    }



    _getSubscribersStates(){
        let validSubscribers = {};
        let fillSubscribers = function(id) {
            let currentElement = document.getElementById(id);
            if (this.supportedNodeNames.includes(currentElement.nodeName)) {
                validSubscribers[id] = (this._getSubscriberDescriptor(currentElement))
            }
        }.bind(this)
        this._getListOfSubscriberIds().forEach((id) => fillSubscribers(id));
        return validSubscribers
    }


    _getSubscriberDescriptor(element) {
        return {
            listOfItems: this._getTargetsListOfDescriptors(element),
            eventListenerCallback: this._updateThisInnerHtmlOnSubscribersChange.bind(this),
            isProcessed: false  // is this really needed
        }
    }


    _updateEachSubscriberOnThisInnerHtmlChange() {
        let newUlDescriptor = this._getTargetsListOfDescriptors(this)
        let updateSingleSubscriber = function(id) {
            // if (id != procedureInitiatorId) {
                let currentElement = document.getElementById(id)
                this.subscribersStates[id].isProcessed = true; // as event will be triggered, on event listner this will be resetted to false
                this._changeTargetElementsUlElement(currentElement, newUlDescriptor)
            // }
        }.bind(this)
        Object.keys(this.subscribersStates).forEach((id) => {updateSingleSubscriber(id)})      
    }


    _updateThisInnerHtmlOnSubscribersChange(event) {
        let procedureInitiatorId = event.target.id
        let newUlDescriptor = this._getTargetsListOfDescriptors(event.target)
        let currentDescriptor = this._getTargetsListOfDescriptors(this)
        if (this.subscribersStates[procedureInitiatorId].isProcessed) {
            this.subscribersStates[procedureInitiatorId].isProcessed = false;
        } else if (!Comparator.areStatesEqual(newUlDescriptor, currentDescriptor)){
            this._changeTargetElementsUlElement(this, newUlDescriptor)
            // _emitEventOnStateChange();
        }
    }


    _changeTargetElementsUlElement(targetElement, newUlDescriptor) {
        this._removeElement.call(targetElement, targetElement.querySelector('ul'))
        targetElement.appendChild(this._makeUlFromDescirptor(newUlDescriptor))
    }


    _makeUlFromDescirptor(ulDescriptor){
        return `<ul>${this._listToHtmlString(ulDescriptor, this._createSingleLiFromStateItemAsString(ulDescriptor))}</ul>`
    }


    _getTargetsListOfDescriptors(element){
        console.warn(`${this.constructor.name}: case when this is null not supported`)
        let listOfListElements = element.querySelector('li');
        let getLiDescriptor = this._getSingleLiDescriptor.bind(this)
        return Array.from(listOfListElements).map(getLiDescriptor)
    }


    _getSingleLiDescriptor(liElement){
        let isHidden = liElement.classList.contains('hidden') ? true : false;
        let _label = liElement.getAttribute('data-label');
        _label = (_label == undefined || _label == null) ? this._getNextUniqueLabel() : _label
        let _message = liElement.innerText;
        return {
            label: _label,
            message: _message,
            isHidden: _isHidden,
        }
    }


    _getNextUniqueLabel() {
        // console.warn(`${this.constructor.name}: implement getNextUniqueLabel`)
        return ''
    }


    _getListOfSubscriberIds(){
        let subscriberIds = this.getAttribute('data-subscribers-ids');
        if (subscriberIds == null || subscriberIds == undefined) return []
        return subscriberIds.split(',').map((item) => {return item.trim()});
    }


    _getTemplate(){
        return `
            <style>
                :host{
                    display: none;
                }
            </style>
        `
    }
}


window.customElements.define('wheel-alike-components-mediator', WheelControlWrapper)