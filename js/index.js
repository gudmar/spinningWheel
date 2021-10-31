class ManySpinningWheelsAdder{
    constructor(nrOfWheels){
        this.nrOfWheels = nrOfWheels
    }

    getWheelId(id) {
        return `${id}-wheel`
    }
    getEditorId(id){
        return `${id}-editor`
    }
    getMediatorId(id){
        return `${id}-mediator`
    }
    getModalId(id){
        return `${id}-modal`
    }
    getButtonId(id){
        return `${id}-button`
    }
    getWrapperId(id) {
        return `${id}-arepper`
    }

    placeAllElements(whereId){
        let element = this.getElementFromString(this.getAllElementsAsString())
        document.getElementById(whereId).appendChild(element)
    }

    getElementFromString(htmlString){
        let temp = document.createElement('template')
        temp.innerHTML = htmlString
        return temp.content.cloneNode(true)
    }
    
    getAllElementsAsString(){
        let itemsAsString = ''
        for (let i = 0; i < this.nrOfWheels; i++){
            itemsAsString = itemsAsString + this.singleElementTemplate(i,)
        }
        return itemsAsString
    }

    getDummyUlContentAsString(nrOfItems = 7){
        let itemsAsString = '';
        for(let i = 0; i<nrOfItems; i++){
            itemsAsString = itemsAsString + `<li data-label = ${i}>Some message nr ${i}</li>`
        }
        return `<ul>${itemsAsString}</ul>`
    }

    activateButtons() {
        let openEditorInstance = function(index){
            let i = index;
            return {
                openEditor: function() {
                    document.getElementById(this.getModalId(i)).setAttribute('data-visible', true)
                }.bind(this)
            }
        }.bind(this)
        for (let i = 0; i < this.nrOfWheels; i++){
            let currentButton = document.getElementById(this.getButtonId(i));
            let openingFunction = openEditorInstance.call(this, i).openEditor
            currentButton.addEventListener('click', openingFunction)
        }
    }

    addMediatorsToEachWrapper(){
        let allWrappers = document.querySelectorAll('.wheel-edit-wrapper');
        let singleMediatorAsString = function(id){
            return `
            <wheel-alike-components-mediator data-subscribers-ids = "${this.getEditorId(id)}, ${this.getWheelId(id)}" id = "${this.getMediatorId(id)}">
                <ul></ul>
            </wheel-alike-components-mediator>
            `
        }.bind(this)
        let addMediatorToSingleWrapper = function(item, id){
            let mediatorsParent = document.getElementById(this.getWrapperId(id))
            mediatorsParent.appendChild(this.getElementFromString(singleMediatorAsString(id)));
            document.getElementById(this.getMediatorId(id)).innerHTML = this.getDummyUlContentAsString()
        }.bind(this)
       allWrappers.forEach(addMediatorToSingleWrapper)
    }


    addMasterMediatorForAllMediatorObjects(){
        let getDataSubscribersIdsOfAllMediators = function(){
            let output = []
            for(let i = 0; i < this.nrOfWheels; i++) {
                output.push(this.getMediatorId(i))
            }
            return output.join(', ')
        }.bind(this)
        let mediator = document.createElement('wheel-alike-components-mediator')
        console.log('before appending')
        document.querySelector('body').appendChild(mediator)
        console.log('after appending')
        mediator.innerHTML = `
            <ul>
                <li data-label="1">1</li>
                <li data-label="2">1</li>
                <li data-label="3">1</li>
            </ul>
        `
        mediator.setAttribute('data-subscribers-ids', getDataSubscribersIdsOfAllMediators())
        mediator.setAttribute('id', 'master-mediator-id')
    }

    singleElementTemplate(id){
        return `
            <div class = "wheel-edit-wrapper" id = ${this.getWrapperId(id)}>
                <spinning-wheel-info id = ${this.getWheelId(id)}><ul></ul></spinning-wheel-info>
                <modal-content-change-watcher data-visible=false id = ${this.getModalId(id)}>

                    <!--
                    <editing-wheel-state-list id = ${this.getEditorId(id)}>
                        <ul></ul>
                    </editing-wheel-state-list>
                    -->

                    <editing-wheel-state-list-responsive id = ${this.getEditorId(id)}>
                        <ul></ul>
                    </editing-wheel-state-list-responsive>
                </modal-content-change-watcher>
                <custom-button id = ${this.getButtonId(id)} data-label="Edit content"  value="show" ></custom-button>
            </div>
        `
    }
}