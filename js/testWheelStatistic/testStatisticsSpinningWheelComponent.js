// DEPENDENCIES:
// ColorGenerator    -> colorGenerator.js
// wheelDrawer       -> wheelDrawer.js
// AbstractComponent -> abstractCustomWebComponent.js
// StateHandlingAbstractComponent ->  stateHandlingAbstractComponent.js


class SpinningWheelComponent_testVersion extends StateHandlingAbstractComponent{

    constructor(){
            super()
        this.animationSettings = {
            interval: 0,
            angle: 30,
            angleIncrement: 20,
            deltaAngle: function() {return Math.random() * 30 + 30},
            deltaAngleAttenuationFactor: 0.99,
            maxInterval: 300,
            animationRejectAfterSeconds: 10
        }
        this.diameter = 600;


        let animation = this._resolveAnimation.bind(this)
        this.shadowRoot.querySelector('.wrapper').appendChild(this._getWheelCreator().createSpinCircleElement(this._getState().items))
        this.objectToSpin = this.shadowRoot.querySelector('g')
        this.objectToSpin.addEventListener('click', animation)
    }



    connectedCallback(){
        // let animation = this._animate.bind(this)
        let animation = this._resolveAnimation.bind(this)
        this.shadowRoot.querySelector('.wrapper').appendChild(this._getWheelCreator().createSpinCircleElement(this._getState().items))
        this.objectToSpin = this.shadowRoot.querySelector('g')
        this.objectToSpin.addEventListener('click', animation)

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
        let outputWinnerIndex = function(winnerIndex) {
            setParameterOnAnimationEnd(winnerIndex)
            emitOnAnimationEnd(winnerIndex)
        }.bind(this)

        let promiseCB = async function(resolve, reject){
            let angle = await this._animate();
            outputWinnerIndex(this._getWinnerIndex(angle))
        }.bind(this)

        return new Promise(promiseCB)
    }

    _getWinner(totalAngle) {
        let itemList = this._getState().items;
        return itemList[this._getWinnerIndex(totalAngle)].label
    }
    _getWinnerIndex(totalAngle) {
        let itemList = this._getState().items;
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


        return (async function() {
            let inter
            let _angle = angle;
            let _deltaAngle = deltaAngle;
            let promiseAnimate = new Promise((resolve, reject) => {
                    movedObject.setAttributeNS(null, 'transform', `rotate(${_angle}, ${radius}, ${radius})`);
                    let isResolved = false;
                    while(!isResolved){
                        if (_deltaAngle > 1) {
                            _angle += _deltaAngle;
                            _deltaAngle *= 0.99;
                        } else {
                            isResolved = true
                            resolve(_angle)
                        }
                    }
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

    _

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

    setNrOfWheelItems(nr) {
        let createDummyLi = function(nr){
            let output = '';
            for (let i = 0; i < nr; i++){
                output = output + `<li>${i}</li>`
            }
            return output;
        }
        let listToAdd = this._stringToElement(`<ul>${createDummyLi(nr)}</ul>`)
        this.appendChild(listToAdd)
    }

}

window.customElements.define('test-spinning-wheel', SpinningWheelComponent_testVersion)