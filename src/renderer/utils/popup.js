const overlay = document.getElementById('overlay');
const popup = document.getElementById('popup');
const closeButton = document.getElementById('close-button');
const title = document.getElementById('popup-title');
const content = document.getElementById('popup-content');

function openPopup(titleText, contentText) {
    title.innerText = titleText;
    content.innerText = contentText;
    overlay.style.display = 'block';
}

function closePopup() {
    overlay.style.display = 'none';
}

closeButton.addEventListener('click', closePopup);

overlay.addEventListener('click', function (event) {
    if (event.target === overlay) {
        closePopup();
    }
});