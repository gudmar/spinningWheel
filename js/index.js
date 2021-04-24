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

    placeAllElements(whereId){
        let element = this.getElementFromString(this.getAllElementsAsString())
        console.log(element)
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
            itemsAsString = itemsAsString + this.singleElementTemplate(i, this.getDummyUlContentAsString())
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
            console.log(openingFunction)
            currentButton.addEventListener('click', openingFunction)
        }
    }

    singleElementTemplate(id, content){
        return `
            <div class = "wheel-edit-wrapper">
                <spinning-wheel id = ${this.getWheelId}></spinning-wheel>
                <modal-content-change-watcher data-visible=false id = ${this.getModalId(id)}>
                    <editing-wheel-state-list id = ${this.getEditorId}>
                    </editing-wheel-state-list>
                </modal-content-change-watcher>
                <custom-button id = ${this.getButtonId(id)} data-label="Clear console"  value="show" ></custom-button>
                <wheel-alike-components-mediator data-subscribers-ids = "${this.getEditorId}, ${this.getWheelId}" id = "${this.getMediatorId(id)}">
                    ${content}
                </wheel-alike-components-mediator>
            </div>
        `
    }
}