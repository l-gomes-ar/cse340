const pwBtn = document.querySelector('#showPw');

pwBtn.addEventListener('click', () => {
    const pwInput = document.querySelector('#pwInput');
    const type = pwInput.getAttribute('type');
    if (type == 'password') {
        pwInput.setAttribute('type', 'text');
        pwBtn.textContent = 'Hide';
    } else {
        pwInput.setAttribute('type', 'password');
        pwBtn.textContent = 'Show';
    }
});