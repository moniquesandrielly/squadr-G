/**
 * Script Principal de Navegação e Interatividade do Squad G
 */
document.addEventListener('DOMContentLoaded', () => {
  // Controle do Menu Mobile (Hambúrguer)
  const menuToggle = document.getElementById('btn-menu-toggle');
  const navMenu = document.getElementById('menu-principal');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isExpanded));
      navMenu.classList.toggle('is-open', !isExpanded);
    });

    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
      if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Fechar ao pressionar Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        navMenu.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Destaque da página ativa no menu
  const currentPath = window.location.pathname.split('/').pop() || 'home.html';
  const navLinks = document.querySelectorAll('.nav-menu a');
  navLinks.forEach((link) => {
    const linkPath = link.getAttribute('href').split('/').pop();
    if (
      linkPath === currentPath ||
      (currentPath === '' && linkPath === 'home.html') ||
      (currentPath === 'index.html' && linkPath === 'home.html')
    ) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
});
