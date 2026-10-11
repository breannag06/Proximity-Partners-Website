(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  // Mobile menu
  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  // Hairline under header once the page scrolls
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Prefill business type when a plan's CTA is used
  var typeSelect = document.getElementById('f-type');
  document.querySelectorAll('[data-plan]').forEach(function (link) {
    link.addEventListener('click', function () {
      var plan = link.getAttribute('data-plan');
      if (!typeSelect || plan === 'founding') return;
      typeSelect.value = plan;
    });
  });

  // Audit form: until a form service is connected, send the request as a pre-filled email
  var auditForm = document.querySelector('form[data-mailto]');
  if (auditForm) {
    auditForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = auditForm.elements;
      var body = [
        'Name: ' + f.name.value,
        'Business: ' + f.business.value,
        'Phone or email: ' + f.contact.value,
        'Business type: ' + f.business_type.value
      ].join('\n');
      window.location.href = 'mailto:' + auditForm.getAttribute('data-mailto') +
        '?subject=' + encodeURIComponent('Free Maps audit request: ' + f.business.value) +
        '&body=' + encodeURIComponent(body);
      var status = auditForm.querySelector('.form-status');
      status.innerHTML = 'Your email app should open with this filled in. Hit send and you&rsquo;re done. ' +
        'If nothing opened, email <a href="mailto:go@proximitypartners.business">go@proximitypartners.business</a> or text 210-537-3885.';
      status.hidden = false;
    });
  }

  // PayPal subscription buttons (one SDK load, one button per plan).
  // Plan IDs live on each .paypal-slot in index.html.
  var PAYPAL_CLIENT_ID = 'BAAUO3E8Cng2mw2qwKUlkLZTrb5TeXG2_Wm2oirWcadB8GSUd4MiQ5yYqpWFhTSdkddDbTfqV-OLhuL8Pw';
  var paySlots = document.querySelectorAll('.paypal-slot');
  if (paySlots.length) {
    var payFailed = function () {
      paySlots.forEach(function (slot) {
        slot.innerHTML = '<p class="plan-pay-fallback">PayPal didn\u2019t load. Email <a href="mailto:go@proximitypartners.business">go@proximitypartners.business</a> and I\u2019ll send you a link.</p>';
      });
    };
    var renderPayPal = function () {
      if (!window.paypal) return payFailed();
      paySlots.forEach(function (slot) {
        window.paypal.Buttons({
          style: { shape: 'pill', color: 'silver', layout: 'vertical', label: 'paypal' },
          createSubscription: function (data, actions) {
            return actions.subscription.create({ plan_id: slot.getAttribute('data-plan-id') });
          },
          onApprove: function (data) {
            window.location.href = '/subscribed.html?plan=' +
              encodeURIComponent(slot.getAttribute('data-plan-name')) +
              '&id=' + encodeURIComponent(data.subscriptionID);
          }
        }).render(slot);
      });
    };
    var loadPayPal = function () {
      var s = document.createElement('script');
      s.src = 'https://www.paypal.com/sdk/js?client-id=' + PAYPAL_CLIENT_ID + '&vault=true&intent=subscription';
      s.setAttribute('data-sdk-integration-source', 'button-factory');
      s.onload = renderPayPal;
      s.onerror = payFailed;
      document.head.appendChild(s);
    };
    // Load the SDK only when the plans come near the screen
    if ('IntersectionObserver' in window) {
      var payIO = new IntersectionObserver(function (entries) {
        if (!entries.some(function (e) { return e.isIntersecting; })) return;
        payIO.disconnect();
        loadPayPal();
      }, { rootMargin: '800px 0px' });
      paySlots.forEach(function (slot) { payIO.observe(slot); });
    } else {
      loadPayPal();
    }
  }

  // Fade and rise on scroll
  var items = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach(function (el) { io.observe(el); });
})();
