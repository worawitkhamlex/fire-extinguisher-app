/**
 * SPA Router
 * ----------
 * Simple hash-based router for single-page navigation.
 */

const routes = {};
let currentScreen = null;
let appContainer = null;

export function registerRoute(path, renderFn) {
  routes[path] = renderFn;
}

export function navigate(path) {
  window.location.hash = path;
}

export function getParams() {
  const hash = window.location.hash.slice(1); // remove #
  const [path, query] = hash.split('?');
  const params = {};
  if (query) {
    for (const pair of query.split('&')) {
      const [k, v] = pair.split('=');
      params[decodeURIComponent(k)] = decodeURIComponent(v || '');
    }
  }
  return { path, params };
}

export function initRouter(container) {
  appContainer = container;

  const handleRoute = async () => {
    const { path, params } = getParams();
    const route = path || 'home';
    const renderFn = routes[route];

    if (renderFn) {
      currentScreen = route;
      appContainer.innerHTML = '';
      await renderFn(appContainer, params);
      updateNav(route);
      window.scrollTo(0, 0);
    } else {
      navigate('home');
    }
  };

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

function updateNav(route) {
  document.querySelectorAll('.bottom-nav__item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.route === route);
  });
}

export function getCurrentScreen() {
  return currentScreen;
}
