// Temporary no-build setup: static HTML pages load content/<lang>/<section>.md and render it with marked.
// Needs a web server to preview (fetch does not work on file://), e.g. `python -m http.server`.

const LANGS = [
    { code: 'en', name: 'English' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'de', name: 'Deutsch' },
];

// Page chrome that is not markdown. kn is partly placeholder English (TODO: translate).
const UI = {
    en: {
        nav: { about: 'About', work: 'Work', projects: 'Projects', resume: 'Resume', other: 'Other' },
        nameTop: 'ವರುಣ್ ಘಟ್ ರವಿಕುಮಾರ್', name: 'Varun Ghat Ravikumar',
        tagline: 'AI ML Engineer with a passion for NLP, Computer Vision, and Data Science.',
        buttons: { resume: 'Resume', contact: 'Contact' },
    },
    kn: {
        nav: { about: 'About', work: 'Work', projects: 'Projects', resume: 'ರೆಸ್ಯೂಮೇ', other: 'Other' },
        nameTop: 'Varun Ghat Ravikumar', name: 'ವರುಣ್ ಘಟ್ ರವಿಕುಮಾರ್',
        tagline: 'ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಎಂಜಿನಿಯರ್. ಭಾಷೆಗಳನ್ನು ಕಲಿಯಲು ಹಾಗೂ ಸಂರಕ್ಷಿಸಲು ಆಸಕ್ತಿಯುಳ್ಳವನು.',
        buttons: { resume: 'ರೆಸ್ಯೂಮೇ', contact: 'ಸಂಪರ್ಕಿಸಿ' },
    },
    de: {
        nav: { about: 'Über mich', work: 'Arbeit', projects: 'Projekte', resume: 'Lebenslauf', other: 'Sonstiges' },
        nameTop: '', name: 'Varun Ghat Ravikumar',
        tagline: 'AI ML Engineer mit einer Leidenschaft für NLP, Computer Vision und Data Science.',
        buttons: { resume: 'Lebenslauf (CV)', contact: 'Kontaktieren' },
    },
};

const LINKS = {
    github: 'https://github.com/varunghat',
    email: 'varunghat.ravikumar@uzh.ch',
    resume: 'data/resume_website.pdf',
};

function currentLang() {
    const fromUrl = new URLSearchParams(location.search).get('lang');
    let lang = fromUrl;
    try { lang = lang || localStorage.getItem('lang'); } catch (e) {}
    return UI[lang] ? lang : 'en';
}

// Switch language in place (no page reload, so a #hash in the URL can't block it).
function setLang(lang) {
    try { localStorage.setItem('lang', lang); } catch (e) {}
    const url = new URL(location.href);
    url.searchParams.delete('lang');
    history.replaceState(null, '', url.toString());
    render(lang);
}

function renderNav(lang) {
    const t = UI[lang].nav;
    const options = LANGS.map(l => `<option value="${l.code}"${l.code === lang ? ' selected' : ''}>${l.name}</option>`).join('');
    document.getElementById('nav').innerHTML = `
        <div class="navbar">
            <a href="index.html#about">${t.about}</a>
            <a href="projects.html">${t.projects}</a>
            <a href="${LINKS.resume}">${t.resume}</a>
            <div class="spacer"></div>
            <select id="language-selector">${options}</select>
        </div>`;
    document.getElementById('language-selector').addEventListener('change', e => setLang(e.target.value));
}

function renderProfile(lang) {
    const el = document.getElementById('profile');
    if (!el) return;
    const t = UI[lang];
    el.innerHTML = `
        <img src="images/photo.jpg" alt="Profile Picture" class="profile-pic">
        <div class="profile-details">
            ${t.nameTop ? `<h1 class="name-top">${t.nameTop}</h1>` : ''}
            <h1>${t.name}</h1>
            <p class="tagline">${t.tagline}</p>
            <div class="buttons">
                <a href="${LINKS.resume}" class="resume-button">${t.buttons.resume}</a>
                <a href="mailto:${LINKS.email}" class="resume-button">${t.buttons.contact}</a>
                <a href="${LINKS.github}" target="_blank" class="resume-button">GitHub</a>
            </div>
        </div>`;
}

async function renderSections(lang, scrollToHash) {
    const host = document.getElementById('sections');
    const files = host.dataset.files.split(',');
    const parts = await Promise.all(files.map(async f => {
        const res = await fetch(`content/${lang}/${f}.md`, { cache: 'no-cache' });
        if (!res.ok) throw new Error(`${f}.md: ${res.status}`);
        return `<section id="${f}">${marked.parse(await res.text())}</section>`;
    }));
    host.innerHTML = parts.join('');
    host.querySelectorAll('a[href^="http"]').forEach(a => a.target = '_blank');
    if (scrollToHash && location.hash) {
        const target = document.querySelector(location.hash);
        if (target) target.scrollIntoView();
    }
}

document.addEventListener('DOMContentLoaded', () => render(currentLang(), true));

function render(lang, scrollToHash = false) {
    document.documentElement.lang = lang;
    renderNav(lang);
    renderProfile(lang);
    renderSections(lang, scrollToHash).catch(err => {
        document.getElementById('sections').innerHTML =
            `<p>Could not load content (${err.message}). Serve the site over HTTP, e.g. <code>python -m http.server</code>.</p>`;
    });
}
