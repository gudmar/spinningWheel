// DEPENDENCIES:
// ColorGenerator    -> colorGenerator.js
// wheelDrawer       -> wheelDrawer.js
// AbstractComponent -> abstractCustomWebComponent.js
// StateHandlingAbstractComponent ->  stateHandlingAbstractComponent.js


class SpinningWheelComponent extends StateHandlingAbstractComponent{

    constructor(){
        super()
        this.animationSettings = {
            interval: 1,
            angle: 30,
            angleIncrement: 20,
            deltaAngle: function() {return Math.random() * 30 + 30},
            deltaAngleAttenuationFactor: 0.99,
            maxInterval: 300,
            animationRejectAfterSeconds: 10
        }
        this.diameter = 600;
    }

    connectedCallback(){
        this._addSpinningWheel();
        console.log("SPINNING WHEEL ADDED")
    }

    _addSpinningWheel(newStateItems = this._getStateNotHiddenItems()){
        let animation = this._resolveAnimation.bind(this)
        this.shadowRoot.querySelector('.wrapper').appendChild(this._getWheelCreator().createSpinCircleElement(this._getStateNotHiddenItems(newStateItems)))
        this.objectToSpin = this.shadowRoot.querySelector('g')
        this.objectToSpin.addEventListener('click', animation)
    }

    _getStateNotHiddenItems(){
        let output = this._getState().items.filter((element, index) => {
            return element.isHidden == true ? false : true
        })
        return output
    }

    async _resolveAnimation(cb) {
        let emitOnAnimationEnd = function(winnerIndex) {
            const event = new CustomEvent('spinEnded', {
                detail: winnerIndex
            })
            this.dispatchEvent(event)
        }.bind(this)
        let setParameterOnAnimationEnd = function(winnerIndex) {
            this.setAttribute('data-winnerIndex', winnerIndex)
        }.bind(this)
        let log = function(message) {
            console.log(`And the winner is: ${this._getWinner(message).label}`)
            console.log(`Winning message: ${this._getWinner(message).message}`)
        }.bind(this)
        let outputWinnerIndex = function(winnerIndex) {
            setParameterOnAnimationEnd(winnerIndex)
            emitOnAnimationEnd(winnerIndex)
        }.bind(this)
        let hideWinner = function(winnerIndex){
            // this._changeItemInStateItems(this._getWinner(winnerIndex).id, 'isHidden', true);
            this._addHiddenClassToNotHiddenLiAtIndex(winnerIndex)
            this._recreateThisComponent();
            
        }.bind(this)

        let promiseCB = async function(resolve, reject){
            let angle = await this._animate();
            log(angle)
            let winnerIndex = this._getWinnerIndex(angle)
            outputWinnerIndex(this._getWinner(winnerIndex).id)
            console.log('%cWinning index :' + winnerIndex, "background-color: yellow")
            hideWinner(winnerIndex)    
            console.log('Line above - hide winner responsivble for hiding element !!')
        }.bind(this)

        return new Promise(promiseCB) 
    }

    _addHiddenClassToNotHiddenLiAtIndex(index){
        let htmlItems = this.querySelectorAll('li:not(.hidden)');
        htmlItems[index].classList.add('hidden')
    }

    _getWinner(totalAngle) {
        let itemList = this._getStateNotHiddenItems();
        return itemList[this._getWinnerIndex(totalAngle)]
    }
    _getWinnerIndex(totalAngle) {
        let itemList = this._getStateNotHiddenItems();
        let nrOfCircleItemsInSingleCircle = itemList.length;
        let angleOfEachCirclePart = 360 / nrOfCircleItemsInSingleCircle;
        let nrOfCirclePartsFromSpinning = Math.floor(totalAngle / angleOfEachCirclePart)
        let winnerIndex = nrOfCirclePartsFromSpinning % nrOfCircleItemsInSingleCircle;
        let recalculatedIndexDueToOpositeSpinDirection = itemList.length -1 -winnerIndex
        return recalculatedIndexDueToOpositeSpinDirection
    }

    _animate() {
        let {interval, angle, angleIncrement, deltaAngle, deltaAngleAttenuationFactor, maxInterval, animationRejectAfterSeconds} = this.animationSettings;
        let radius = this.diameter/2;
        let movedObject = this.objectToSpin;
        deltaAngle = deltaAngle();
        let singleAnimationFrame = function() {
            movedObject.setAttributeNS(null, 'transform', `rotate(${angle}, ${radius}, ${radius})`);
            if (deltaAngle > 1) {
                angle += deltaAngle;
                deltaAngle *= 0.99;
            } else {
                return new Promise((resolve, reject) => {
                    resolve(angle)
                })
            }
        }

        return (async function() {
            let inter
            let _angle = angle;
            let _deltaAngle = deltaAngle;
            let promiseAnimate = new Promise((resolve, reject) => {
                inter = setInterval(function () {
                    movedObject.setAttributeNS(null, 'transform', `rotate(${_angle}, ${radius}, ${radius})`);
                    if (deltaAngle > 1) {
                        _angle += deltaAngle;
                        deltaAngle *= 0.99;
                    } else {
                        clearInterval(inter)
                        resolve(_angle)
                    }
                }.bind(this, resolve), inter)
            }
        )
            let promiseRejectAnimation = new Promise((resolve, reject) => {
                let tout = setTimeout(() => {
                    clearTimeout(tout)
                    reject('animate: not resolved')
                }, 5000)
            }
        )
        return Promise.race([
            promiseAnimate, promiseRejectAnimation
        ])
        })()

    }

    _recreateThisComponent(newStateItems = this._state.items){
        this._removeElement(this.shadowRoot.querySelector('svg'))
        this._addSpinningWheel(newStateItems);
    }

    _getWheelCreator() {
        if (this.wheelCreator == undefined) {
            this.wheelCreator = new SvgWheelCreator(this.diameter);
        }
        return this.wheelCreator
    }

    _getTemplate(){
        let wheelCreator = this._getWheelCreator();
        let output = `
            <style>
                .center{
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    align-content: center;
                }
                .wrapper{
                    position: relative;
                }
            </style>
            <div class = 'wrapper center'>
            </div>
        `
        return output
    }

    clickWheelForTestPuropses(){
        let ev = new Event('click')
        this.objectToSpin.dispatchEvent(ev);
    }

}

window.customElements.define('spinning-wheel', SpinningWheelComponent)