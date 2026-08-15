// ── CUSTOM ELEMENTS ──────────────────────────────────────────

class SwiftHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
<header>
  <div class="header-inner">
    <a href="/" class="logo" aria-label="SwiftPDF Home">
      <span class="logo-icon">⚡</span>SwiftPDF
    </a>
    <nav aria-label="Main navigation">
      <a href="/">Home</a>
      <a href="/#tools">Tools</a>
      <a href="/blog">Blog</a>
      <a href="/pricing">Pricing</a>
    </nav>
    <a href="/pricing" class="btn-pro desktop-only" id="get-pro-btn">Get Pro</a>
    <button class="hamburger" id="menu-toggle" aria-label="Toggle menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
  <nav class="mobile-nav" id="mobile-nav" aria-label="Mobile navigation">
    <a href="/">Home</a>
    <a href="/#tools">Tools</a>
    <a href="/blog">Blog</a>
    <a href="/pricing">Pricing</a>
    <a href="/pricing" class="btn-pro">Get Pro</a>
  </nav>
</header>
    `;

    const menuToggle = this.querySelector('#menu-toggle');
    const mobileNav = this.querySelector('#mobile-nav');
    
    if (menuToggle && mobileNav) {
      menuToggle.addEventListener('click', () => {
        const isOpen = mobileNav.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', isOpen);
        const spans = menuToggle.querySelectorAll('span');
        if (isOpen) {
          spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
          spans[1].style.opacity   = '0';
          spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
          spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
        }
      });
    }

    // Scroll shadow effect
    window.addEventListener('scroll', () => {
      const header = this.querySelector('header');
      if (header) {
        header.style.boxShadow = window.scrollY > 10 ? '0 2px 20px rgba(0,0,0,.08)' : 'none';
      }
    }, { passive: true });
  }
}

class SwiftFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
<footer>
  <div class="footer-inner">
    <div class="footer-top">
      <div class="footer-brand">
        <a href="/" class="logo">⚡ SwiftPDF</a>
        <p>Fast, free, and private PDF tools — right in your browser.</p>
      </div>
      <div class="footer-links">
        <div class="footer-col">
          <h5>Tools</h5>
          <ul>
            <li><a href="/merge">Merge PDF</a></li>
            <li><a href="/split">Split PDF</a></li>
            <li><a href="/compress">Compress PDF</a></li>
            <li><a href="/to-jpg">PDF to JPG</a></li>
            <li><a href="/word-to-pdf">Word to PDF</a></li>
            <li><a href="/protect">Protect PDF</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h5>Company</h5>
          <ul>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/pricing">Pricing</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h5>Legal</h5>
          <ul>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2026 SwiftPDF. All rights reserved.</p>
      <div class="privacy-badge">🛡️ All processing happens in your browser — your files never leave your device.</div>
    </div>
  </div>
</footer>
    `;
  }
}

class SwiftPremiumModal extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
<div class="modal-overlay" id="swift-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div class="modal">
    <div class="modal-icon">⭐</div>
    <h2 id="modal-title">Daily Limit Reached</h2>
    <p>You've used your free allowance for today. Upgrade to Pro for unlimited usage across all tools.</p>
    <div class="pro-features">
      <div class="pro-title">⚡ Pro Plan — $4.99/month</div>
      <ul>
        <li>✅ Unlimited conversions & edits</li>
        <li>✅ Files up to 500MB</li>
        <li>✅ Lightning fast processing</li>
        <li>✅ All 9 PDF tools unlocked</li>
      </ul>
    </div>
    <div class="modal-actions">
      <a href="/pricing" class="btn-upgrade">🚀 Upgrade Now — $4.99/month</a>
      <button class="btn-maybe" id="swift-btn-maybe">Maybe Later</button>
    </div>
  </div>
</div>
    `;

    const overlay = this.querySelector('#swift-modal-overlay');
    const btnMaybe = this.querySelector('#swift-btn-maybe');
    
    if (btnMaybe) {
      btnMaybe.addEventListener('click', () => overlay.classList.remove('open'));
    }
    if (overlay) {
      overlay.addEventListener('click', e => { 
        if (e.target === overlay) overlay.classList.remove('open');
      });
    }
  }

  show() {
    const overlay = this.querySelector('#swift-modal-overlay');
    if (overlay) overlay.classList.add('open');
  }
}

customElements.define('swift-header', SwiftHeader);
customElements.define('swift-footer', SwiftFooter);
customElements.define('swift-premium-modal', SwiftPremiumModal);

// ── GLOBAL UTILS ─────────────────────────────────────────────

window.swiftpdf = {
  getTodayKey() {
    return new Date().toISOString().slice(0, 10);
  },
  
  getCount(storageKey) {
    try {
      const d = JSON.parse(localStorage.getItem(storageKey) || '{}');
      return d[this.getTodayKey()] || 0;
    } catch {
      return 0;
    }
  },
  
  bumpCount(storageKey) {
    try {
      const today = this.getTodayKey();
      const d = JSON.parse(localStorage.getItem(storageKey) || '{}');
      d[today] = (d[today] || 0) + 1;
      // Prune old days automatically
      Object.keys(d).forEach(k => { if (k !== today) delete d[k]; });
      localStorage.setItem(storageKey, JSON.stringify(d));
    } catch {}
  },
  
  isLimitReached(storageKey, limit) {
    return this.getCount(storageKey) >= limit;
  },

  showFreemiumModal() {
    const modal = document.querySelector('swift-premium-modal');
    if (modal) modal.show();
  }
};

// Placeholder for analytics logic
console.log('Analytics initialized.');
