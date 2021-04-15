class SvgWheelCreator{
    constructor(sizeDescriptor){
        this._setState(sizeDescriptor);
        this.template = document.createElement('template')
        this.circleGroupSelector = 'spinCircleGroupId'
        this.colorGenerator = new ColorGenerator()
    }

    _getDescriptorOrDerault(fromDescriptor, defoult) {
        return fromDescriptor == undefined ? defoult : fromDescriptor
    }


    _setState(sizeDescriptor){
        let width = undefined;
        let height = undefined;
        let viewBox = undefined;
        if (sizeDescriptor != undefined) {
            ({width, height, viewBox} = sizeDescriptor)
        }
        if (this.state == undefined) {
            this.state = {}
        }
        if (this.state.width == undefined) {this.state.width = this._getDescriptorOrDerault(width, '500px')}
        if (this.state.height == undefined) {this.state.height = this._getDescriptorOrDerault(height, '500px')}
        if (this.state.viewBox == undefined) {this.state.viewBox = this._getDescriptorOrDerault(viewBox, '0 0 500 500')}
        this.state.circleX = (parseFloat(this.state.width) / 2) + '';
        this.state.circleY = (parseFloat(this.state.height) / 2) + '';
        this.state.circleR = (Math.min(parseFloat(this.state.width), parseFloat(this.state.height)) / 2.8) + '';
    }

    _setNSAttributeToElement(element, descriptor){
        for (let field in descriptor) {
            if (field == 'd') {
                // console.log(descriptor.d)
            }
            element.setAttributeNS(null, field, descriptor[field])
        }
    }
    
    _createSvgElement(){
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        let svgDescriptor = {
            'width': this.state.width,
            'height': this.state.height,
            'viewBox': this.state.viewBox
        }
        this._setNSAttributeToElement(svg, svgDescriptor)
        // svg.setAttributeNS(null, 'width', this.state.width);
        // svg.setAttributeNS(null, 'height', this.state.height);
        // svg.setAttributeNS(null, 'viewBox', this.state.viewBox);
        return svg;       
    }

    _createCircle() {
        let circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        let circleDescriptor = {
            'cx': this.state.circleX,
            'cy': this.state.circleY,
            'r' : this.state.circleR,
            'stroke': 'black',
            'fill': 'none',
            'stroke-opacity': '1',
            'class': ''
        }
        let groupDescriptor = {
            'transform-box': 'fill-box',
            'id': this.circleGroupSelector
        }
        this._setNSAttributeToElement(circle, circleDescriptor);
        this._setNSAttributeToElement(g, groupDescriptor);
        g.appendChild(circle)
        return g
    }

    createSpinCircleElement(stateItems) {
        let svg = this._createSvgElement();
        let circle = this._createCircle();
        svg.appendChild(this._createCircle());
        this.template.appendChild(svg)
        this._devideCircleIntoArcs(stateItems);
        return this.template.querySelector('svg')

    }

    // _createCircle() {
    //     let circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    //     let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    //     circle.setAttributeNS(null, 'cx', this.state.circleX);
    //     circle.setAttributeNS(null, 'cy', this.state.circleY);
    //     circle.setAttributeNS(null, 'r', this.state.circleR);
    //     circle.setAttributeNS(null, 'stroke', 'black');
    //     circle.setAttributeNS(null, 'fill', 'none')
    //     circle.setAttributeNS(null, 'stroke-opacity', "1")
    //     circle.setAttributeNS(null, 'stroke-width', "1")
    //     circle.setAttributeNS(null, 'class', '')
    //     g.setAttributeNS(null, 'transform-box', 'fill-box');
    //     g.setAttributeNS(null, 'id', this.circleGroupSelector)
    //     g.appendChild(circle)
    //     return g;
    // }

    _polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: parseFloat(centerX) + (radius * Math.cos(angleInRadians)),
            y: parseFloat(centerY) + (radius * Math.sin(angleInRadians))
        };
    }    

    _createSVGArc(descriptor){
        let {x, y, radius, startAngle, endAngle, colors} = descriptor;
        // ([x, y, radius, startAngle, endAngle].forEach((item) => {item = parseFloat(item)}))
        let roundDown = function(nrToRound, precision = 2){
            let multiplicator = Math.pow(10, precision);
            nrToRound = parseFloat(nrToRound) * multiplicator;
            nrToRound = Math.round(nrToRound);
            return (nrToRound / multiplicator)
        }
        let describeArc = function () {
            let start = this._polarToCartesian(x, y, radius, endAngle);
            let end = this._polarToCartesian(x, y, radius, startAngle);
            let largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
            let d = [
                "M", roundDown(x), roundDown(y),
                "L", roundDown(start.x), roundDown(start.y),
                "A", roundDown(radius), roundDown(radius), 0, largeArcFlag, 0, roundDown(end.x), roundDown(end.y),
                "L", roundDown(x), roundDown(y)
            ].join(" ");
            return d;
        }.bind(this); //x, y, radius, startAngle, endAngle

        console.log(ColorGenerator.toString(colors.bg))
        console.log(colors.bg)
        let pathDescriptor = {
            'd': describeArc(), 
            'stroke': 'black',
            'stroke-width': '1',
            'stroke-linecap': 'round',
            'fill': ColorGenerator.toString(colors.bg),
            'transform-box': 'fill-box'
        }

        // let id = this.svgId + Math.random().toString(36).substr(2, 9) + 'arc';
        let p = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        this._setNSAttributeToElement(p, pathDescriptor)




        // p.setAttributeNS(null, 'd', describeArc(x, y, radius, startAngle, endAngle))
        // p.setAttributeNS(null, 'stroke', 'black')
        // p.setAttributeNS(null, 'stroke-width', '1')
        // p.setAttributeNS(null, 'stroke-linecap', 'round')
        // p.setAttributeNS(null, 'fill', fill)
        // // p.setAttributeNS(null, 'id', id)
        // p.setAttributeNS(null, 'transform-box', 'fill-box');
        return p;
    }   



    _placeSingleLabel(listOfDescriptors, index){
        let {fgColor, label} = listOfDescriptors[index];
        let {circleX, circleY, circleR} = this.state;
        let angle = 360 / listOfDescriptors.length;
        let newLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        let position = this._polarToCartesian(parseFloat(circleX), parseFloat(circleY), parseFloat(circleR) * 0.4, angle * (0.5 + index) +10);
        let labelDescriptor = {
            'fill': fgColor,
            'font-family': 'Arial, Helvetica, sans-serif',
            'font-weight': 'bold',
            'x': position.x + '',
            'y': position.y + '',
            'transfrom': `rotate(${angle * (0.5 + index) - 90}, ${position.x}, ${position.y})`,
            'font-size': label < 4 ? '35' : '25'
        }
        this._setNSAttributeToElement(newLabel, labelDescriptor)
        // newLabel.setAttributeNS(null, 'fill', fgColor)
        // newLabel.setAttributeNS(null, 'font-family', 'Arial, Helvetica, sans-serif')
        // newLabel.setAttributeNS(null, 'font-weight', 'bold')                
        // newLabel.setAttributeNS(null, 'x', position.x + '');
        // newLabel.setAttributeNS(null, 'y', position.y + '');
        // newLabel.setAttributeNS(null, 'transform', `rotate(${angle * (0.5 + i) - 90}, ${position.x}, ${position.y})`)
        // newLabel.setAttributeNS(null, 'font-size', label < 4 ? '35' : '25')
        // newLabel.appendChild(document.createTextNode(label))
        this.template.querySelector('svg').querySelector('g').appendChild(newLabel)
    }

    _devideCircleIntoArcs(stateItems) {
        let gen = new ColorGenerator(stateItems.length);
        // let targetCircle = this.template.querySelector('circle')
        let targetElement = this.template.querySelector('g')
        let colorIterator = gen.createIterator()
        let angle = (360 / stateItems.length)==360?359.999:360/stateItems.length;
        let {circleX, circleY, circleR} = this.state

        
        // console.log(tempColor)

        let addOneArc = function(item, index) {
            let tempColor = colorIterator.next().value;
            let arc = this._createSVGArc({
                x: circleX, 
                y: circleY, 
                radius: circleR, 
                startAngle: index * angle,
                endAngle: (index + 1) * angle,
                colors: tempColor
            })

            targetElement.appendChild(arc)
        }.bind(this)
        

        stateItems.forEach( (item, index) => {
            addOneArc(item, index)
        });
        this._placeLabels('labels');
    }


    _placeLabels(stateItems){
        for (let i = 0; i < stateItems.length; i++){
            this._placeSingleLabel(stateItems, i)
        }
        
    }
    

}