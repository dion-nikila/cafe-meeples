const $ = (selector, root = document) => root?.querySelector(selector) ?? null;
const $$ = (selector, root = document) => [...(root?.querySelectorAll(selector) ?? [])];

const plans = {
  two: { title: 'A table for two.', copy: 'Pick a day and ask about a table.', cta: 'Plan for two', href: './visit.html?party=two&v=board-mobile-5', party: '2' },
  crew: { title: 'A table for your group.', copy: 'Tell the café how many are coming.', cta: 'Plan for a group', href: './visit.html?party=crew&v=board-mobile-5', party: '3–5' },
  new: { title: 'Start with a meetup.', copy: 'Tabletop SL welcomes beginners.', cta: 'See the events', href: './play.html?v=board-mobile-5#events', party: '1' }
};

function initNavigation() {
  const toggle = $('.menu-toggle');
  const nav = $('#mobile-nav');
  if (!toggle || !nav) return;

  function closeMenu(restoreFocus = false) {
    const wasOpen = !nav.hidden;
    nav.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    if (restoreFocus && wasOpen) toggle.focus();
  }

  toggle.addEventListener('click', () => {
    const opening = nav.hidden;
    nav.hidden = !opening;
    toggle.setAttribute('aria-expanded', String(opening));
    toggle.setAttribute('aria-label', opening ? 'Close navigation' : 'Open navigation');
  });
  $$('a', nav).forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu(true);
  });
  document.addEventListener('click', event => {
    if (event.target instanceof Element && !event.target.closest('.site-header')) closeMenu();
  });
}

function initPlans() {
  const buttons = $$('[data-plan]');
  const title = $('#plan-title');
  const copy = $('#plan-copy');
  const link = $('#plan-link');
  if (!buttons.length || !title || !copy || !link) return;

  function choosePlan(key) {
    const plan = plans[key];
    if (!plan) return;
    buttons.forEach(button => {
      const active = button.dataset.plan === key;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
      const label = $('.card-select', button);
      if (label) label.textContent = active ? 'Selected' : 'Choose';
    });
    title.textContent = plan.title;
    copy.textContent = plan.copy;
    link.textContent = plan.cta;
    link.href = plan.href;
  }

  buttons.forEach(button => button.addEventListener('click', () => choosePlan(button.dataset.plan)));
  choosePlan('two');
}

const chanceCards = [
  { title: 'Coffee for two.', copy: 'Bring a friend. Plan a café visit.', link: './visit.html?party=two&v=board-mobile-5', cta: 'Plan a visit' },
  { title: 'Try a meetup.', copy: 'Find the next board-game gathering.', link: './play.html?v=board-mobile-5#events', cta: 'See the events' },
  { title: 'Coffee break.', copy: "Ask the café for today's menu.", link: './index.html?v=board-mobile-5#coffee', cta: 'Food & drinks' },
  { title: 'Bring the group.', copy: 'Ask about a table for your friends.', link: './visit.html?party=crew&v=board-mobile-5', cta: 'Plan a group visit' },
  { title: 'Puzzle night?', copy: 'Check dates for puzzles and quizzes.', link: './play.html?v=board-mobile-5#events', cta: 'See the events' },
  { title: 'Find the café.', copy: 'Get directions and opening hours.', link: './visit.html?v=board-mobile-5', cta: 'Visit Meeples' }
];

function initChance() {
  const dialog = $('#roll-dialog');
  const number = $('#roll-number');
  const title = $('#roll-title');
  const copy = $('#roll-copy');
  const link = $('#roll-link');
  if (!dialog || !number || !title || !copy || !link) return;

  let previousRoll = -1;
  const initialOverflow = document.body.style.overflow;
  copy.setAttribute('aria-live', 'polite');
  copy.setAttribute('aria-atomic', 'true');

  function drawChance() {
    // Pick from the other five cards so another roll always produces a new idea.
    const choices = chanceCards.map((_, index) => index).filter(index => index !== previousRoll);
    const index = choices[Math.floor(Math.random() * choices.length)];
    previousRoll = index;
    const card = chanceCards[index];
    number.textContent = String(index + 1).padStart(2, '0');
    title.textContent = card.title;
    copy.textContent = card.copy;
    link.href = card.link;
    link.textContent = card.cta;
    const ticket = $('#chance-number', dialog);
    if (ticket) ticket.textContent = String(index + 1).padStart(2, '0');
  }

  $('#draw-chance')?.addEventListener('click', () => {
    drawChance();
    if (!dialog.open) dialog.showModal();
  });
  $('.roll-again', dialog)?.addEventListener('click', drawChance);
  $('.dialog-close', dialog)?.addEventListener('click', () => dialog.close());
  link.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  function syncScrollLock() {
    document.body.style.overflow = dialog.open ? 'hidden' : initialOverflow;
  }
  dialog.addEventListener('close', syncScrollLock);
  new MutationObserver(syncScrollLock).observe(dialog, { attributes: true, attributeFilter: ['open'] });
}

// Calendar comparisons use the café's date, regardless of the visitor's timezone.
function colomboDate() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Colombo', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const value = type => parts.find(part => part.type === type).value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}

const today = colomboDate();
const events = [
  { date: '2026-10-20', day: 'TUE', number: '20', title: 'Puzzle Meetup', host: '', time: '5:30 pm — 9 pm', type: 'puzzles' },
  { date: '2026-10-24', day: 'SAT', number: '24', title: 'Blood on the Clocktower', host: 'Hosted by BotC SL', time: '3 pm — 7 pm', type: 'games' },
  { date: '2026-10-25', day: 'SUN', number: '25', title: 'Board Game Meetup', host: 'Hosted by Tabletop SL', time: '1:30 pm — 9 pm', type: 'games' },
  { date: '2026-10-28', day: 'WED', number: '28', title: 'Quiz Night', host: '', time: '7:15 pm onwards', type: 'puzzles' },
  { date: '2026-10-30', day: 'FRI', number: '30', title: 'Board Game Night', host: 'Hosted by Tabletop SL', time: '5:30 pm — 11 pm', type: 'games' }
];

function initEvents() {
  const list = $('#event-list');
  if (!list) return;
  list.setAttribute('aria-live', 'polite');
  list.setAttribute('aria-atomic', 'false');
  list.setAttribute('aria-relevant', 'additions text');

  function renderEvents(filter = 'all') {
    const upcoming = events.filter(event => event.date >= today && (filter === 'all' || event.type === filter));
    const rows = upcoming.map(event => {
      const row = document.createElement('a');
      row.className = 'event-row';
      row.href = 'https://www.instagram.com/cafe_meeples/p/Dd7O908E3kX/';
      row.target = '_blank';
      row.rel = 'noopener noreferrer';
      row.setAttribute('aria-label', `${event.title}, ${event.day} October ${event.number}, ${event.time}. View the café's October line-up on Instagram.`);
      row.innerHTML = `<span class="event-date"><strong>${event.number}</strong><span>OCT<br>${event.day}</span></span><div class="event-info"><h3>${event.title}</h3><p>${event.host}</p></div><span class="event-time">${event.time}</span>`;
      return row;
    });
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'lead';
      empty.style.padding = '30px 0';
      empty.textContent = 'The next round is being planned. Follow Café Meeples on Instagram for the latest dates.';
      rows.push(empty);
    }
    list.replaceChildren(...rows);
  }

  const filters = $$('[data-filter]');
  filters.forEach(button => button.addEventListener('click', () => {
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    renderEvents(button.dataset.filter);
  }));
  renderEvents();
}

function initEnquiry() {
  const form = $('#planner-form');
  const dateInput = $('#visit-date');
  const partyInput = $('#party-size');
  const timeInput = $('#visit-time');
  const result = $('#enquiry-result');
  const messageField = $('#enquiry-message');
  const copyButton = $('#copy-enquiry');
  const status = $('#copy-status');
  if (!form || !dateInput || !partyInput || !timeInput || !result || !messageField || !copyButton || !status) return;

  dateInput.min = today;
  const requestedPlan = new URLSearchParams(window.location.search).get('party');
  if (Object.hasOwn(plans, requestedPlan)) partyInput.value = plans[requestedPlan].party;
  result.tabIndex = -1;
  result.setAttribute('role', 'region');
  result.setAttribute('aria-label', 'Your table enquiry message');
  status.setAttribute('role', 'status');
  dateInput.addEventListener('input', () => dateInput.setCustomValidity(''));

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const selectedDate = new Date(`${dateInput.value}T12:00:00+05:30`);
    if (Number.isNaN(selectedDate.getTime())) return;
    const day = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Colombo', weekday: 'short' }).format(selectedDate);
    if (day === 'Mon') {
      dateInput.setCustomValidity('The café is closed on Mondays. Please choose Tuesday to Sunday.');
      dateInput.reportValidity();
      return;
    }
    if (dateInput.value < today) {
      dateInput.setCustomValidity('Please pick today or a future date.');
      dateInput.reportValidity();
      return;
    }
    const formattedDate = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Colombo', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }).format(selectedDate);
    const party = partyInput.value;
    const time = timeInput.value;
    messageField.value = party === '1'
      ? `Hi Café Meeples! I'd like to join a meetup on ${formattedDate} in the ${time}. Is anything planned, and how do I join? Thanks!`
      : `Hi Café Meeples! Do you have a table for ${party} people on ${formattedDate} in the ${time}? Please share any game fees and the current menu. Thanks!`;
    form.hidden = true;
    result.hidden = false;
    copyButton.textContent = 'Copy message';
    status.textContent = "Copy your message, then paste it into a DM.";
    result.focus();
  });

  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(messageField.value);
      status.textContent = 'Copied. Open Instagram and paste it into a DM.';
      copyButton.textContent = 'Message copied';
    } catch {
      messageField.focus();
      messageField.select();
      messageField.setSelectionRange(0, messageField.value.length);
      status.textContent = 'Copy the selected message, then paste it into a DM.';
    }
  });
}

function initMobileVisit() {
  const stickyVisit = $('.mobile-visit');
  const hero = $('#start');
  const isHome = document.body.classList.contains('home-page');
  const isPlay = document.body.classList.contains('play-page');
  if (!stickyVisit || (!isHome && !isPlay)) return;

  let pending = false;
  function updateSticky() {
    const visible = isHome && hero ? hero.getBoundingClientRect().bottom <= 0 : isPlay && window.scrollY > 200;
    stickyVisit.classList.toggle('visible', visible);
    stickyVisit.setAttribute('aria-hidden', String(!visible));
    stickyVisit.tabIndex = visible ? 0 : -1;
    pending = false;
  }
  function requestUpdate() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(updateSticky);
  }
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  updateSticky();
}

initNavigation();
initPlans();
initChance();
initEvents();
initEnquiry();
initMobileVisit();
