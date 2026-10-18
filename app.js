const $ = (selector, root = document) => root?.querySelector(selector) ?? null;
const $$ = (selector, root = document) => [...(root?.querySelectorAll(selector) ?? [])];

const plans = {
  two: {
    title: 'A little quality time. A little friendly rivalry.',
    copy: 'Coffee, a little rivalry, and an excellent excuse for a rematch.',
    cta: 'Plan for two',
    href: './visit.html?party=two',
    party: '2'
  },
  crew: {
    title: 'Finally, a group plan everyone can get behind.',
    copy: 'Gather your people. Ask about a table, order a round, and let the friendly rivalry begin.',
    cta: 'Bring the crew',
    href: './visit.html?party=crew',
    party: '3–5'
  },
  new: {
    title: 'Your next favourite game starts with hello.',
    copy: 'Meet new people at a community game night. Bring your curiosity; beginners are welcome.',
    cta: "See what's on",
    href: './play.html#events',
    party: '1'
  }
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
  { title: 'Make it a two-player afternoon.', copy: 'Invite your favourite human. Good coffee and a friendly rematch sound like a pretty good plan.', link: './play.html', cta: 'Pick your play' },
  { title: 'Take a proper coffee break.', copy: 'Step away from the scroll. A cup, a catch-up and a little time around the table are calling.', link: './index.html#coffee', cta: 'Take a coffee break' },
  { title: 'Release the group chat.', copy: 'Send the “are we actually doing this?” text. Turn all those maybe-plans into one good afternoon.', link: './visit.html?party=crew', cta: 'Plan a visit' },
  { title: 'Play the wild card.', copy: 'New to board games? Find a community gathering and bring your curiosity. Everyone has a first round.', link: './play.html#events', cta: 'Find a gathering' },
  { title: 'Give your brain a bonus round.', copy: 'A puzzle meetup or a quiz night could be your next good idea. Take a look at what the café has planned.', link: './play.html#events', cta: "See what's on" },
  { title: 'Meet at Meeples.', copy: "Sometimes the best move is the simple one. Pick a day, gather your people, and we'll point you towards Borella.", link: './visit.html', cta: 'Find your way here' }
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
  const board = $('.game-board');
  const tileForCard = ['.tile-start', '.tile-coffee', '.tile-social', '.tile-draw', '.tile-dice', '.tile-go'];
  let token = null;
  if (board) {
    token = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    token.setAttribute('class', 'board-token');
    token.setAttribute('aria-hidden', 'true');
    const piece = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    piece.setAttribute('href', '#i-meeple');
    token.append(piece);
    const startTile = $('.tile-start', board);
    startTile?.classList.add('landed');
    startTile?.append(token);
  }
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
    const pips = [
      [[50, 50]],
      [[31, 31], [69, 69]],
      [[31, 31], [50, 50], [69, 69]],
      [[31, 31], [69, 31], [31, 69], [69, 69]],
      [[31, 31], [69, 31], [50, 50], [31, 69], [69, 69]],
      [[31, 28], [69, 28], [31, 50], [69, 50], [31, 72], [69, 72]]
    ];
    const die = $('.dialog-die', dialog);
    if (die) {
      die.innerHTML = `<svg viewBox="0 0 100 100" class="is-rolling" aria-hidden="true"><rect x="13" y="13" width="74" height="74" rx="13" fill="var(--cream)" stroke="currentColor" stroke-width="4"/><g fill="currentColor">${pips[index].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6"/>`).join('')}</g></svg>`;
    }
    const landingTile = board && $(tileForCard[index], board);
    if (landingTile && token) {
      $$('.landed', board).forEach(tile => tile.classList.remove('landed'));
      landingTile.classList.add('landed');
      landingTile.append(token);
    }
  }

  $('#roll-dice')?.addEventListener('click', () => {
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
  { date: '2026-10-20', day: 'TUE', number: '20', title: 'Puzzle Meetup', host: 'A little patience. A shared challenge.', time: '5:30 pm — 9 pm', type: 'puzzles' },
  { date: '2026-10-24', day: 'SAT', number: '24', title: 'Blood on the Clocktower', host: 'Hosted by BotC SL', time: '3 pm — 7 pm', type: 'games' },
  { date: '2026-10-25', day: 'SUN', number: '25', title: 'Board Game Meetup', host: 'Hosted by Tabletop SL', time: '1:30 pm — 9 pm', type: 'games' },
  { date: '2026-10-28', day: 'WED', number: '28', title: 'Quiz Night', host: 'Bring your most useful random knowledge.', time: '7:15 pm onwards', type: 'puzzles' },
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
      row.innerHTML = `<span class="event-date"><strong>${event.number}</strong><span>OCT<br>${event.day}</span></span><div class="event-info"><h3>${event.title}</h3><p>${event.host}</p></div><span class="event-time">${event.time}</span><span class="event-arrow" aria-hidden="true"><svg class="ui-icon arrow-ne"><use href="#i-arrow"/></svg></span>`;
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
      ? `Hi Café Meeples! I'd love to visit on ${formattedDate} in the ${time}. I'm coming on my own and interested in joining a meetup. Is there a suitable gathering? Could you share the details and any entry fees? Thank you!`
      : `Hi Café Meeples! We'd love to visit on ${formattedDate} in the ${time}. Our group is ${party} people. Could you let us know about table availability, how playing works, any game fees, and your current menu? Thank you!`;
    form.hidden = true;
    result.hidden = false;
    copyButton.textContent = 'Copy message';
    status.textContent = "Copy your message, open the café's profile, then paste it into a DM.";
    result.focus();
  });

  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(messageField.value);
      status.textContent = 'Message copied. Open Instagram and paste it into a DM to the café.';
      copyButton.textContent = 'Message copied';
    } catch {
      messageField.focus();
      messageField.select();
      messageField.setSelectionRange(0, messageField.value.length);
      status.textContent = 'Your message is selected. Copy it, then paste it into a DM to the café.';
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
