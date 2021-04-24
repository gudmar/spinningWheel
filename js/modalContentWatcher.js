class ModalContentChangeWatcher extends Modal {
    constructor(){
        super()
        this.onContentChange = function() {
            if (this._getShadowWrappedElement().innerHTML != this._getWrappedElement().innerHTML) {
                this._getWrappedElement().innerHTML = this._getShadowWrappedElement().innerHTML
            } else {
            }
        }.bind(this)
        this._watchForContentElementChanges()
    }

    _onInnerHTMLChange() {
        if (this._getShadowWrappedElement().innerHTML != this._getWrappedElement().innerHTML) {
            this._stopWatchingForContentElementChanges();
            this.content.innerHTML = this.innerHTML
            this._watchForContentElementChanges(); 
        } else {
        }
    }

    _watchForContentElementChanges(){
        this._getShadowWrappedElement().addEventListener(this.COMPONENT_STATE_CHANGED, this.onContentChange)
    }

    _stopWatchingForContentElementChanges(){
        this._getShadowWrappedElement().removeEventListener(this.COMPONENT_STATE_CHANGED, this.onContentChange)
    }

    _getShadowWrappedElement() {
        return this.content.children[0]
    }

    _getWrappedElement() {
        return this.children[0]
    }
}

window.customElements.define('modal-content-change-watcher', ModalContentChangeWatcher)