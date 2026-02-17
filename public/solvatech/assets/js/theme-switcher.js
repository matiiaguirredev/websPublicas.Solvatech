// Switch Function
const ThemeToggleSwicher = () => {
    // Get root element and data-theme-mode value
    const rootElem = document.documentElement
    let dataThemeMode = rootElem.getAttribute('data-theme-mode'),
        newTheme

    newTheme = (dataThemeMode === 'light') ? 'dark' : 'light'

    // Set the new HTML attribute
    rootElem.setAttribute('data-theme-mode', newTheme)

    // Set the new local storage item
    localStorage.setItem('theme', newTheme)

}

// Add event listner for the theme switcher
document.querySelector('#theme-toggle').addEventListener('click', ThemeToggleSwicher)