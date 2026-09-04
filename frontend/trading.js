 /* ── Scroll reveal ── */
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    /* ── Animated bars ── */
    const barObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.bar-fill').forEach(bar => {
            const w = bar.style.width;
            bar.style.width = '0';
            setTimeout(() => {
              bar.style.transition = 'width 1.2s cubic-bezier(.4,0,.2,1)';
              bar.style.width = w;
            }, 100);
          });
        }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll('.risk-visual').forEach(el => barObserver.observe(el));

    /* ── Nav active link ── */
    const sections = document.querySelectorAll('section[id], div[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    window.addEventListener('scroll', () => {
      let cur = '';
      sections.forEach(s => {
        if (window.scrollY >= s.offsetTop - 100) cur = s.id;
      });
      navLinks.forEach(a => {
        a.style.color = a.getAttribute('href') === '#' + cur ? 'var(--gold)' : '';
      });
    });

    /* ── Form validation & submission ── */
    function handleSubmit(e) {
      e.preventDefault();
      let valid = true;

      const fname = document.getElementById('fname');
      const lname = document.getElementById('lname');
      const email = document.getElementById('email');
      const level = document.getElementById('level');
      const consent = document.getElementById('consent');

      const show = (id, show) => {
        document.getElementById(id).style.display = show ? 'block' : 'none';
      };
      const mark = (el, err) => {
        el.style.borderColor = err ? 'var(--red)' : '';
      };

      if (!fname.value.trim()) { show('fname-err', true); mark(fname, true); valid = false; }
      else { show('fname-err', false); mark(fname, false); }

      if (!lname.value.trim()) { show('lname-err', true); mark(lname, true); valid = false; }
      else { show('lname-err', false); mark(lname, false); }

      const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRx.test(email.value.trim())) { show('email-err', true); mark(email, true); valid = false; }
      else { show('email-err', false); mark(email, false); }

      if (!level.value) { show('level-err', true); mark(level, true); valid = false; }
      else { show('level-err', false); mark(level, false); }

      if (!consent.checked) { show('consent-err', true); valid = false; }
      else { show('consent-err', false); }

      if (!valid) return;

      /* Simulate sending */
     /* Send to backend */
    const btn = document.getElementById('submit-btn');
    btn.textContent = 'SENDING…';
    btn.disabled = true;
    btn.style.opacity = '.7';

    fetch('https://trading-academy-zvks.onrender.com/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: fname.value.trim(),
        lastName:  lname.value.trim(),
        email:     email.value.trim(),
        level:     level.value,
        market:    document.getElementById('markets').value
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        // Show error
        btn.textContent = 'REGISTER FOR FREE →';
        btn.disabled = false;
        btn.style.opacity = '1';
        alert('❌ ' + data.error);
      } else {
        // Show success
        document.getElementById('form-content').style.display = 'none';
        const sm = document.getElementById('success-msg');
        sm.style.display = 'block';
        sm.style.animation = 'fadeUp .6s both';
      }
    })
    .catch(err => {
      btn.textContent = 'REGISTER FOR FREE →';
      btn.disabled = false;
      btn.style.opacity = '1';
      alert('❌ Server error. Make sure the backend is running.');
    });
    }

    /* ── Smooth scroll for nav ── */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
      });
    });