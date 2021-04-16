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
        // let animation = this._animate.bind(this)
        let animation = this._resolveAnimation.bind(this)
        this.shadowRoot.querySelector('.wrapper').appendChild(this._getWheelCreator().createSpinCircleElement(this._getState()))
        this.objectToSpin = this.shadowRoot.querySelector('g')
        this.objectToSpin.addEventListener('click', animation)

    }

    async _resolveAnimation(cb) {
        let log = function(message) {
            console.log(message)
            console.log(`And the winner is: ${this._getWinner(message)}`)
        }.bind(this)

        let promiseCB = async function(resolve, reject){
            let angle = await this._animate();
            log(angle)
        }.bind(this)

        return new Promise(promiseCB)
    }

    _getWinner(totalAngle) {
        let itemList = this._getState();
        let nrOfCircleItemsInSingleCircle = itemList.length;
        let angleOfEachCirclePart = 360 / nrOfCircleItemsInSingleCircle;
        let nrOfCirclePartsFromSpinning = Math.floor(totalAngle / angleOfEachCirclePart)
        let winnerIndex = nrOfCirclePartsFromSpinning % nrOfCircleItemsInSingleCircle;
        return itemList[itemList.length - 1 - winnerIndex].label
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

    _

    _getWheelCreator() {
        if (this.wheelCreator == undefined) {
            this.wheelCreator = new SvgWheelCreator(this.diameter);
        }
        return this.wheelCreator
    }

    _getTemplate(){
        let wheelCreator = this._getWheelCreator();
        // console.log(this._getState())
        // console.log(this._getWheelCreator().createSpinCircleElement(this._getState()))
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

}

window.customElements.define('spinning-wheel', SpinningWheelComponent)