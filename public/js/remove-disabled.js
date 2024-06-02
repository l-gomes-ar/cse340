const form = document.querySelector("form")
form.addEventListener("change", function () {
    const updateBtn = document.querySelector('input[type="submit"]')
    updateBtn.removeAttribute("disabled")
})