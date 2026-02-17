// Check local storage
let localSto = localStorage.getItem('theme'),
    themeToSet = localSto

// If local storage is not set, we check the OS preference
if (!localSto) {
    themeToSet = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Set the correct theme
document.documentElement.setAttribute('data-theme-mode', themeToSet)