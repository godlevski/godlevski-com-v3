import { Photo } from '../../types';
import { easeInOutCubic } from '../../utils/math';

const TRANSITION_MS = 480;

interface PreviewElements {
  overlay:    HTMLElement;
  imgWrap:    HTMLElement;
  img:        HTMLImageElement;
  info:       HTMLElement;
  haiku:      HTMLElement;
  meta:       HTMLElement;
  links:      HTMLElement;
  emailLink:  HTMLAnchorElement;
  btnPrev:    HTMLElement;
  btnNext:    HTMLElement;
  btnClose:   HTMLElement;
  btnToggle:  HTMLElement;
  btnCopy:    HTMLElement;
  btnCart:    HTMLButtonElement;
}

export class Preview {
  private el: PreviewElements;
  private photos:   Photo[]  = [];
  private current:  number   = 0;
  private open:     boolean  = false;
  private onClose:      () => void;
  private onLoadStart:  () => void;
  private onLoadEnd:    () => void;
  private onCartToggle: (photo: Photo) => void;
  private getIsInCart:  (photo: Photo) => boolean;

  // Touch state for swipe
  private swipeStartX = 0;

  constructor(
    onClose: () => void,
    onLoadStart: () => void,
    onLoadEnd: () => void,
    onCartToggle: (photo: Photo) => void,
    getIsInCart: (photo: Photo) => boolean,
  ) {
    this.onClose      = onClose;
    this.onLoadStart  = onLoadStart;
    this.onLoadEnd    = onLoadEnd;
    this.onCartToggle = onCartToggle;
    this.getIsInCart  = getIsInCart;
    this.el = this.build();
    this.bind();
  }

  // ── Public API ────────────────────────────────────────────────────────────

  show(photos: Photo[], startId: string, fromRect: DOMRect): void {
    if (this.open) return;
    this.photos  = photos;
    this.current = photos.findIndex(p => p.id === startId);
    if (this.current < 0) this.current = 0;

    this.pushUrl(this.photos[this.current].id);
    this.populate(this.current);
    this.animateIn(fromRect);
    this.open = true;
  }

  syncCart(): void {
    if (!this.open) return;
    this.updateCartBtn(this.photos[this.current]);
  }

  hide(): void {
    if (!this.open) return;
    // Cancel any in-flight image load
    this.el.img.onload  = null;
    this.el.img.onerror = null;
    this.el.img.src     = '';
    this.onLoadEnd();
    this.animateOut(() => {
      this.el.overlay.style.display = 'none';
      this.el.info.classList.remove('visible');
      this.collapseInfo();
      document.body.style.overflow  = '';
      this.open = false;
      history.pushState(null, '', location.pathname);
      this.onClose();
    });
  }

  // ── Build DOM ─────────────────────────────────────────────────────────────

  private build(): PreviewElements {
    const overlay = el('div', 'pv-overlay');
    overlay.style.display = 'none';

    const imgWrap = el('div', 'pv-img-wrap');
    const img     = document.createElement('img');
    img.className = 'pv-img';
    imgWrap.appendChild(img);

    const info      = el('div', 'pv-info');
    const btnToggle = el('button', 'pv-toggle');
    btnToggle.setAttribute('aria-label', 'toggle info');
    btnToggle.innerHTML = '<span class="pv-toggle-icon"></span>';

    const haiku = el('div', 'pv-haiku');
    const meta  = el('div', 'pv-meta');
    const links = el('div', 'pv-links');

    const instLink = el('a', 'pv-link');
    (instLink as HTMLAnchorElement).href   = 'https://instagram.com/intraverses';
    (instLink as HTMLAnchorElement).target = '_blank';
    instLink.textContent = '↗ instagram';

    const emailLink = el('a', 'pv-link') as HTMLAnchorElement;
    emailLink.href  = 'mailto:d.godlevski@gmail.com';
    emailLink.textContent = '✉ inquire about a print';

    const btnCopy = el('button', 'pv-link pv-link--copy');
    btnCopy.textContent = '⎘ copy link';

    const btnCart = el('button', 'pv-link pv-link--cart') as HTMLButtonElement;
    btnCart.textContent = '+ add to cart';

    links.append(instLink, emailLink, btnCopy, btnCart);
    info.append(btnToggle, haiku, meta, links);

    const btnPrev  = el('button', 'pv-btn pv-btn--prev');
    btnPrev.setAttribute('aria-label', 'previous');
    btnPrev.textContent = '←';

    const btnNext  = el('button', 'pv-btn pv-btn--next');
    btnNext.setAttribute('aria-label', 'next');
    btnNext.textContent = '→';

    const btnClose = el('button', 'pv-btn pv-btn--close');
    btnClose.setAttribute('aria-label', 'close');
    btnClose.textContent = '×';

    overlay.append(imgWrap, info, btnPrev, btnNext, btnClose);
    document.body.appendChild(overlay);

    return { overlay, imgWrap, img, info, haiku, meta, links, emailLink, btnPrev, btnNext, btnClose, btnToggle, btnCopy, btnCart };
  }

  private bind(): void {
    this.el.btnClose.addEventListener('click',   () => this.hide());
    this.el.btnPrev.addEventListener('click',    () => this.navigate(-1));
    this.el.btnNext.addEventListener('click',    () => this.navigate(1));
    this.el.overlay.addEventListener('keydown',  this.onKey);
    this.el.btnToggle.addEventListener('click',  () => this.toggleInfo());
    this.el.btnCopy.addEventListener('click',    () => this.copyLink());
    this.el.btnCart.addEventListener('click',    () => {
      const photo = this.photos[this.current];
      this.onCartToggle(photo);
      this.updateCartBtn(photo);
    });

    // Swipe
    this.el.overlay.addEventListener('touchstart', (e) => {
      this.swipeStartX = e.touches[0].clientX;
    }, { passive: true });
    this.el.overlay.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - this.swipeStartX;
      if (Math.abs(dx) > 50) this.navigate(dx < 0 ? 1 : -1);
    }, { passive: true });

    // Click outside image to close
    this.el.overlay.addEventListener('click', (e) => {
      if (e.target === this.el.overlay) this.hide();
    });
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  private navigate(dir: -1 | 1): void {
    const next = this.current + dir;
    if (next < 0 || next >= this.photos.length) return;
    this.current = next;
    this.replaceUrl(this.photos[this.current].id);
    this.crossFade(this.current);
    this.updateNav();
  }

  private populate(idx: number): void {
    const photo = this.photos[idx];
    this.el.img.src = '';          // clear old image immediately
    this.onLoadStart();
    this.el.img.onload  = () => this.onLoadEnd();
    this.el.img.onerror = () => this.onLoadEnd();
    this.el.img.src = photo.src;
    this.el.haiku.innerHTML = photo.haiku.map(line => `<span>${line || '&nbsp;'}</span>`).join('');
    this.updateMeta(photo);
    this.updateEmailSubject(photo.title);
    this.updateCartBtn(photo);
    this.updateNav();
  }

  private crossFade(idx: number): void {
    const photo = this.photos[idx];
    this.el.img.style.opacity = '0';
    this.onLoadStart();
    const next = new Image();
    next.onload = () => {
      this.el.img.src = next.src;
      this.el.img.style.opacity = '1';
      this.onLoadEnd();
    };
    next.onerror = () => this.onLoadEnd();
    next.src = photo.src;
    this.el.haiku.innerHTML = photo.haiku.map(line => `<span>${line || '&nbsp;'}</span>`).join('');
    this.updateMeta(photo);
    this.updateEmailSubject(photo.title);
    this.updateCartBtn(photo);
  }

  private updateCartBtn(photo: Photo): void {
    const inCart = this.getIsInCart(photo);
    this.el.btnCart.textContent = inCart ? '✓ selected' : '+ add to cart';
    this.el.btnCart.classList.toggle('pv-link--cart-active', inCart);
  }

  private updateMeta(photo: Photo): void {
    this.el.meta.innerHTML =
      `<span>${photo.title}  ·  ${photo.year}</span>` +
      `<span class="pv-edition">edition of ${photo.edition}</span>`;
  }

  private updateEmailSubject(title: string): void {
    this.el.emailLink.href = `mailto:d.godlevski@gmail.com?subject=${encodeURIComponent(`Purchase inquiry — ${title}`)}`;
  }

  private updateNav(): void {
    (this.el.btnPrev as HTMLButtonElement).disabled = this.current === 0;
    (this.el.btnNext as HTMLButtonElement).disabled = this.current === this.photos.length - 1;
  }

  private toggleInfo(): void {
    const expanded = this.el.info.classList.toggle('expanded');
    this.setToggleIcon(expanded);
  }

  private expandInfo(): void {
    this.el.info.classList.add('expanded');
    this.setToggleIcon(true);
  }

  private collapseInfo(): void {
    this.el.info.classList.remove('expanded');
    this.setToggleIcon(false);
  }

  private setToggleIcon(expanded: boolean): void {
    const icon = this.el.btnToggle.querySelector('.pv-toggle-icon');
    if (icon) icon.classList.toggle('up', !expanded);
  }

  // ── Transitions ───────────────────────────────────────────────────────────

  private animateIn(fromRect: DOMRect): void {
    const overlay = this.el.overlay;
    const wrap    = this.el.imgWrap;

    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    overlay.setAttribute('tabindex', '-1');
    overlay.focus();

    const startT = performance.now();

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Target: centered, up to 80vw × 85vh
    const maxW = vw * 0.80;
    const maxH = vh * 0.85;

    const animate = (now: number) => {
      const t = Math.min((now - startT) / TRANSITION_MS, 1);
      const e = easeInOutCubic(t);

      // Interpolate from fromRect → target centered rect
      const targetW = maxW;
      const targetH = maxH;
      const targetX = (vw - targetW) / 2;
      const targetY = (vh - targetH) / 2;

      const cw = fromRect.width  + (targetW - fromRect.width)  * e;
      const ch = fromRect.height + (targetH - fromRect.height) * e;
      const cx = fromRect.left   + (targetX - fromRect.left)   * e;
      const cy = fromRect.top    + (targetY - fromRect.top)    * e;

      wrap.style.cssText = `
        position: fixed;
        left: ${cx}px; top: ${cy}px;
        width: ${cw}px; height: ${ch}px;
        transition: none;
      `;

      overlay.style.background = `rgba(5,5,8,${0.96 * e})`;

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        // Settle: switch to CSS layout
        wrap.style.cssText = '';
        this.el.info.classList.add('visible');
        this.expandInfo();
      }
    };

    requestAnimationFrame(animate);
  }

  private animateOut(done: () => void): void {
    const overlay = this.el.overlay;
    const startT  = performance.now();
    const startBg = 0.96;

    const animate = (now: number) => {
      const t = Math.min((now - startT) / (TRANSITION_MS * 0.6), 1);
      const e = easeInOutCubic(t);
      overlay.style.background = `rgba(5,5,8,${startBg * (1 - e)})`;
      this.el.info.style.opacity    = String(1 - e);
      this.el.imgWrap.style.opacity = String(1 - e);
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        this.el.info.style.opacity    = '';
        this.el.imgWrap.style.opacity = '';
        done();
      }
    };

    requestAnimationFrame(animate);
  }

  private pushUrl(id: string): void {
    history.pushState(null, '', `${location.pathname}?p=${id}`);
  }

  private replaceUrl(id: string): void {
    history.replaceState(null, '', `${location.pathname}?p=${id}`);
  }

  private copyLink(): void {
    navigator.clipboard.writeText(location.href).then(() => {
      const btn = this.el.btnCopy;
      btn.textContent = '✓ copied';
      setTimeout(() => { btn.textContent = '⎘ copy link'; }, 2000);
    });
  }

  private onKey = (e: KeyboardEvent): void => {
    if (e.key === 'Escape')      this.hide();
    if (e.key === 'ArrowLeft')   this.navigate(-1);
    if (e.key === 'ArrowRight')  this.navigate(1);
  };
}

function el(tag: string, className: string): HTMLElement {
  const e = document.createElement(tag);
  e.className = className;
  return e;
}
