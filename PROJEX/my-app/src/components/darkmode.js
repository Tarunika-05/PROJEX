export const initializeDarkMode = () => {
    if (typeof window !== 'undefined') {
      if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        return true;
      } else {
        document.documentElement.classList.remove('dark');
        return false;
      }
    }
    return false;
};