class InfoModal extends Modal {
    constructor(){
        super();
    }


    _getTemplate(){
        return `
        <style>
        *{
            box-sizing: border-box;
        }
            .center{
                display: flex;
                justify-content: center;
                align-items: center;
                align-content: center;
            }
            .modal-cover{
                font-family: Arial, Helvetica, sans-serif;
                position: fixed;
                width: 100vw;
                height: 100vh;
                background-color: rgba(250, 250, 250, 0.5);
                top:0;
                left:0;
                z-index: 10000;
            }
            .modal-body{
                position: relative;
                width: 60%;
                max-width: 800px;
                height: 60%;
                background-color: rgb(200,200,200);
                border-radius: 10px;
                transition: 250ms;
            }
            .modal-content{
                position: relative;
                height:  calc( 100% - 6rem );
                padding: 1rem;
                padding-top: 0;
                overflow: auto;
                font-size: 2rem;
            }
            .text-big{
                font-size: 1.5rem;
                text-align: justify;
            }

            @media (max-width: 750px){
                .modal-body {
                    width: 90%;
                    height: 90%;
                }
                .modal-content{
                    height: calc(100% - 9rem);
                }
            }
        </style>
        <div ${(this.id == undefined || this.id == null || this.id.trim() == '') ? '' : 'id=' + this.id} class = "modal-cover center">
            <div class = "modal-body center">
                <div class = "modal-content center">
                    ${this.innerHTML}
                </div>            
            </div>
        </div>
        `
    }

connectedCallback(){
    let killMe = function(e){
        this.parentNode.removeChild(this)
    }.bind(this)
    this.closeButton = this.shadowRoot.querySelector('.modal-cover');
    this.closeButton.addEventListener('click', killMe)
}

}
window.customElements.define('info-modal', InfoModal)
