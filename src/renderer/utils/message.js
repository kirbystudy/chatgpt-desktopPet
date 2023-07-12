function showMessage(message, type) {
    const container = document.getElementById('message-container');

    // 创建消息元素
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.className = `message ${type}`;

    // 将消息元素添加到容器中
    container.appendChild(messageElement);

    setTimeout(() => {
        messageElement.style.transform = 'translateY(0)';
        messageElement.style.opacity = '1';
    }, 100);

    setTimeout(() => {
        messageElement.style.transform = 'translateY(-100px)';
        messageElement.style.opacity = '0';
        setTimeout(() => {
          container.removeChild(messageElement);
        }, 300);
      }, 3000);
}