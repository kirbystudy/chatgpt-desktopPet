class PopupComponent {
    constructor() {
        this.overlay = null
        this.popup = null
        this.closeButton = null
        this.title = null
        this.content = null

        this.createPopup()

        this.closeButton.addEventListener('click', this.closePopup.bind(this))
        // this.overlay.addEventListener('click', this.handleOverlayClick.bind(this))
    }

    createPopup() {
        this.overlay = document.createElement('div')
        this.overlay.id = 'overlay'

        this.popup = document.createElement('div')
        this.popup.id = 'popup'

        const popupHeader = document.createElement('div')
        popupHeader.id = 'popup-header'

        this.title = document.createElement('h3')
        this.title.id = 'popup-title'
        popupHeader.appendChild(this.title)

        this.closeButton = document.createElement('button')
        this.closeButton.id = 'close-button'
        const closeButtonImg = document.createElement('img')
        closeButtonImg.src = path.resolve(__dirname, '../../image/window-close.png')

        this.closeButton.appendChild(closeButtonImg)
        popupHeader.appendChild(this.closeButton)

        this.content = document.createElement('div')
        this.content.id = 'popup-content'
        const paragraphElement = document.createElement('p')
        this.content.appendChild(paragraphElement)

        this.popup.appendChild(popupHeader)
        this.popup.appendChild(this.content)

        this.overlay.appendChild(this.popup)
        document.body.appendChild(this.overlay)
    }

    openPopup(titleText, contentText) {
        this.title.innerText = titleText
        this.content.firstChild.innerText = contentText
        this.overlay.style.display = 'block'
    }

    closePopup() {
        this.overlay.style.display = 'none'
    }

    // 点击外部元素关闭弹窗
    // handleOverlayClick(event) {
    //     if (event.target === this.overlay) {
    //         this.closePopup()
    //     }
    // }
}
