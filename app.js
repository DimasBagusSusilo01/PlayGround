const verbs = [
  { word: 'begin', meaning: 'to start something', icon: '🌱', v1: 'begin', v2: 'began', v3: 'begun', ing: 'beginning' },
  { word: 'fly', meaning: 'to move through the air', icon: '🕊️', v1: 'fly', v2: 'flew', v3: 'flown', ing: 'flying' },
  { word: 'write', meaning: 'to make words on a page', icon: '✒️', v1: 'write', v2: 'wrote', v3: 'written', ing: 'writing' },
  { word: 'grow', meaning: 'to become bigger', icon: '🌿', v1: 'grow', v2: 'grew', v3: 'grown', ing: 'growing' },
  { word: 'sing', meaning: 'to make music with your voice', icon: '🎶', v1: 'sing', v2: 'sang', v3: 'sung', ing: 'singing' },
  { word: 'take', meaning: 'to carry or bring something', icon: '🧺', v1: 'take', v2: 'took', v3: 'taken', ing: 'taking' },
  { word: 'see', meaning: 'to notice with your eyes', icon: '🔭', v1: 'see', v2: 'saw', v3: 'seen', ing: 'seeing' },
  { word: 'make', meaning: 'to create something', icon: '🪡', v1: 'make', v2: 'made', v3: 'made', ing: 'making' },
  { word: 'choose', meaning: 'to pick one thing', icon: '🍄', v1: 'choose', v2: 'chose', v3: 'chosen', ing: 'choosing' },
  { word: 'bring', meaning: 'to carry something here', icon: '🪺', v1: 'bring', v2: 'brought', v3: 'brought', ing: 'bringing' },
  { word: 'eat', meaning: 'to have food', icon: '🍎', v1: 'eat', v2: 'ate', v3: 'eaten', ing: 'eating' },
  { word: 'dance', meaning: 'to move to music', icon: '💃', v1: 'dance', v2: 'danced', v3: 'danced', ing: 'dancing' }
];
const formLabels = { v1: 'V1 · BASE', v2: 'V2 · PAST', v3: 'V3 · P.P.', ing: '· ING' };
const shopItems = [
  { id: 'fox', type: 'avatar', title: 'Fern the fox', art: '🦊', desc: 'A clever little garden companion.', price: 35 },
  { id: 'owl', type: 'avatar', title: 'Olive the owl', art: '🦉', desc: 'Wise words, softer wings.', price: 45 },
  { id: 'cat', type: 'avatar', title: 'Moss the cat', art: '🐈', desc: 'A nap-loving study buddy.', price: 40 },
  { id: 'cottage', type: 'decor', title: 'Mushroom cottage', art: '🍄', desc: 'A cozy corner for your garden.', price: 30 },
  { id: 'lantern', type: 'decor', title: 'Moon lantern', art: '🏮', desc: 'A warm glow for late-night reading.', price: 25 },
  { id: 'flowers', type: 'decor', title: 'Wildflower pot', art: '🪴', desc: 'A little color for your windowsill.', price: 20 }
];
const defaultState = { coins: 25, xp: 0, rounds: 0, perfect: 0, learned: [], owned: [], avatar: '🧑‍🎨', decor: [], streak: 1 };
let state = loadState();
let view = 'home';
let flashIndex = 0;
let flashRevealed = false;
let game = null;
let toastTimer;
const root = document.getElementById('viewRoot');

function loadState() {
  try { return { ...defaultState, ...JSON.parse(localStorage.getItem('verbana-save') || '{}') }; }
  catch { return { ...defaultState }; }
}
function saveState() {
  localStorage.setItem('verbana-save', JSON.stringify(state));
  updateHeader();
}
function updateHeader() {
  document.getElementById('coinCount').textContent = state.coins;
  document.getElementById('avatarMini').textContent = state.avatar;
  document.getElementById('levelSmall').textContent = Math.floor(state.xp / 60) + 1;
}
function toast(message) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}
function setView(next) {
  view = next;
  document.querySelectorAll('.nav-link').forEach(button => button.classList.toggle('active', button.dataset.view === (next === 'quiz' || next === 'jumble' ? 'play' : next === 'flash' ? 'learn' : next)));
  const crumbs = { home: 'YOUR GARDEN　／　TODAY', learn: 'YOUR GARDEN　／　FLASHCARDS', flash: 'YOUR GARDEN　／　FLASHCARDS', play: 'YOUR GARDEN　／　PLAY MODES', quiz: 'YOUR GARDEN　／　SHUFFLE', jumble: 'YOUR GARDEN　／　JUMBLE GARDEN', shop: 'YOUR GARDEN　／　LITTLE SHOP' };
  document.getElementById('breadcrumb').textContent = crumbs[next] || crumbs.home;
  render();
}
function render() {
  if (view === 'home') renderHome();
  else if (view === 'learn') renderLearn();
  else if (view === 'flash') renderFlash();
  else if (view === 'play') renderPlay();
  else if (view === 'quiz' || view === 'jumble') renderGame();
  else if (view === 'shop') renderShop();
  updateHeader();
}
function renderHome() {
  const level = Math.floor(state.xp / 60) + 1;
  const levelProgress = state.xp % 60;
  root.innerHTML = `<div class="heading-row"><div><div class="eyebrow">A NEW DAY IN THE GARDEN</div><h1>Good morning, word gardener.</h1><p>Ready to help a few verbs bloom?</p></div><div class="day-pill">☼ &nbsp; Day ${state.rounds + 1} of your journey</div></div>
    <section class="hero"><div class="hero-copy"><div class="eyebrow">TODAY'S LITTLE ADVENTURE</div><h2>Every verb has a story.</h2><p>Meet a few new words, turn them over, and watch their forms unfold. Your garden is waiting.</p><button class="primary-button" data-action="start-shuffle">Begin today's reading &nbsp; →</button></div><div class="hero-art" aria-hidden="true"><div class="sun-disc"></div><span class="leaf one">❧</span><span class="leaf two">❧</span><div class="tarot-card"><div class="tarot-inner"><span class="star">✧</span><span class="art-leaf">🌿</span><small>THE GROWER</small></div></div></div></section>
    <div class="stats-grid"><div class="stat-card"><span class="stat-icon">✧</span><div><strong>${state.perfect}</strong><small>perfect rounds</small></div></div><div class="stat-card"><span class="stat-icon">▤</span><div><strong>${state.learned.length}<small style="display:inline"> / 12</small></strong><small>verbs discovered</small></div></div><div class="stat-card"><span class="stat-icon">♧</span><div><strong>${state.coins}</strong><small>petals collected</small></div></div></div>
    <div class="section-title"><h3>Choose your way to grow</h3><button class="text-button" data-action="go-play">See all modes →</button></div>
    <div class="mode-grid"><article class="mode-card" data-action="go-learn"><span class="mode-icon">▤</span><span class="arrow">↗</span><h4>Flip & discover</h4><p>Meet each verb and reveal its four forms.</p></article><article class="mode-card" data-action="start-shuffle"><span class="mode-icon">⤨</span><span class="arrow">↗</span><h4>Shuffle the deck</h4><p>A quick, friendly quiz to test your memory.</p></article><article class="mode-card" data-action="start-jumble"><span class="mode-icon">⌘</span><span class="arrow">↗</span><h4>Jumble garden</h4><p>Put the mixed-up letters back in order.</p></article></div>
    <div class="progress-panel"><span class="progress-badge">🌱</span><div class="progress-text"><b>Level ${level} · Seedling</b><small>${levelProgress} of 60 petals of wisdom to your next level</small></div><div class="progress-track"><div class="progress-fill" style="width:${levelProgress / 60 * 100}%"></div></div></div>`;
}
function renderLearn() {
  root.innerHTML = `<div class="heading-row"><div><div class="eyebrow">THE WORD HERBARIUM</div><h1>Meet the verbs</h1><p>Each word has four forms. Take a little time to notice their patterns.</p></div><div class="day-pill">${verbs.length} cards · ${state.learned.length} discovered</div></div><div class="card-grid">${verbs.map((verb, i) => `<article class="verb-card" data-action="open-flash" data-index="${i}"><div class="verb-illustration">${verb.icon}</div><div class="verb-word">${verb.word}</div><div class="verb-meaning">${verb.meaning}</div><div class="forms">${['v1','v2','v3','ing'].map(k => `<div class="form-chip"><small>${formLabels[k]}</small><b>${verb[k]}</b></div>`).join('')}</div></article>`).join('')}</div>`;
}
function renderFlash() {
  const verb = verbs[flashIndex];
  root.innerHTML = `<div class="study-top"><button class="text-button" data-action="back-learn">← All verbs</button><span class="study-counter">CARD ${String(flashIndex + 1).padStart(2, '0')} / ${verbs.length}</span><button class="text-button" data-action="flash-next">${flashIndex === verbs.length - 1 ? 'Start again ↻' : 'Next card →'}</button></div><div class="study-card-wrap"><div class="study-card" data-action="flip-card"><div class="study-frame"><div class="study-symbol">${verb.icon}</div><div class="study-prompt">${verb.word}</div><div class="study-meaning">${verb.meaning}</div>${flashRevealed ? `<div class="card-forms">${['v1','v2','v3','ing'].map(k => `<div><small>${formLabels[k]}</small><b>${verb[k]}</b></div>`).join('')}</div>` : `<div class="flip-hint">TAP THE CARD TO REVEAL ITS FOUR FORMS</div>`}</div></div><div class="study-controls"><button class="secondary-button" data-action="flash-prev">← Previous</button><button class="primary-button" data-action="flip-card">${flashRevealed ? 'I know this one ✓' : 'Reveal the forms'} &nbsp; →</button></div></div>`;
}
function renderPlay() {
  root.innerHTML = `<div class="heading-row"><div><div class="eyebrow">PICK A PLAYFUL PRACTICE</div><h1>Play with your words</h1><p>Complete a round without a mistake to earn 20 petals.</p></div><div class="day-pill">✦ &nbsp; +20 perfect-round reward</div></div><div class="mode-grid play-mode-grid"><article class="mode-card" data-action="start-shuffle"><span class="mode-icon">⤨</span><span class="arrow">↗</span><h4>Shuffle the deck</h4><p>Choose the right verb form in five quick questions. A fresh mix every round.</p></article><article class="mode-card" data-action="start-jumble"><span class="mode-icon">⌘</span><span class="arrow">↗</span><h4>Jumble garden</h4><p>Untangle the letters to grow the right verb form. Three little puzzles.</p></article><article class="mode-card" data-action="go-learn"><span class="mode-icon">▤</span><span class="arrow">↗</span><h4>Flashcard stroll</h4><p>Flip through the verb herbarium at your own pace. No score, just discovery.</p></article></div><div class="progress-panel"><span class="progress-badge">🏅</span><div class="progress-text"><b>Your garden record</b><small>${state.rounds} rounds played · ${state.perfect} perfect · every new round is a chance to grow</small></div><button class="secondary-button" data-action="go-shop">Visit the shop</button></div>`;
}
function shuffled(arr) { const result = [...arr]; for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; } return result; }
function startGame(type) {
  const selected = shuffled(verbs).slice(0, type === 'quiz' ? 5 : 3);
  game = { type, items: selected.map(verb => ({ verb, key: shuffled(['v1', 'v2', 'v3', 'ing'])[0] })), index: 0, mistakes: 0, answered: false, picked: [], scrambled: [] };
  view = type;
  render();
}
function renderGame() {
  if (!game) return setView('play');
  if (game.index >= game.items.length) return finishGame();
  const item = game.items[game.index];
  if (game.type === 'quiz') {
    const answer = item.verb[item.key];
    const distractors = shuffled(verbs.filter(v => v[item.key] !== answer)).slice(0, 3).map(v => v[item.key]);
    const options = shuffled([answer, ...distractors]);
    game.currentOptions = options;
    const choiceMarkup = options.map((option, i) => {
      let cls = 'option-button';
      if (game.answered && option === answer) cls += ' correct';
      else if (game.picked.includes(option)) cls += ' wrong';
      return `<button class="${cls}" data-action="quiz-answer" data-answer="${option}" ${game.answered ? 'disabled' : ''}><span>${['a','b','c','d'][i]}</span>${option}</button>`;
    }).join('');
    root.innerHTML = `<div class="study-top"><button class="text-button" data-action="quit-game">← Leave round</button><span class="study-counter">SHUFFLE · ${game.index + 1} OF ${game.items.length}</span><span class="lives">${'♥'.repeat(Math.max(0, 3 - Math.min(3, game.mistakes)))}${'♡'.repeat(Math.min(3, game.mistakes))}</span></div><section class="session-box"><div class="session-head"><div><div class="eyebrow">FIND THE RIGHT FORM</div><h2>Which word belongs here?</h2></div><span class="question-count">${game.index + 1} / ${game.items.length}</span></div><div class="question-card"><div class="question-emoji">${item.verb.icon}</div><h3>${item.verb.word}</h3><p>${item.verb.meaning}</p></div><div class="eyebrow" style="text-align:center;margin-bottom:10px">${formLabels[item.key]}</div><div class="form-options">${choiceMarkup}</div><div class="feedback ${game.answered ? (game.picked.includes(answer) ? 'good' : 'bad') : ''}">${game.answered ? (game.picked.includes(answer) ? 'Lovely! That is the right form.' : `Not quite — the answer is “${answer}”. Keep going!`) : ''}</div><div class="session-footer"><span class="question-count">A perfect round earns 20 petals ✦</span>${game.answered ? `<button class="primary-button" data-action="game-next">${game.index === game.items.length - 1 ? 'See my garden' : 'Next question'} →</button>` : ''}</div></section>`;
  } else {
    const answer = item.verb[item.key];
    if (!game.scrambled.length) game.scrambled = shuffled([...answer]);
    const selected = game.picked;
    root.innerHTML = `<div class="study-top"><button class="text-button" data-action="quit-game">← Leave round</button><span class="study-counter">JUMBLE GARDEN · ${game.index + 1} OF ${game.items.length}</span><span class="lives">${'♥'.repeat(Math.max(0, 3 - Math.min(3, game.mistakes)))}${'♡'.repeat(Math.min(3, game.mistakes))}</span></div><section class="session-box"><div class="session-head"><div><div class="eyebrow">PUT THE LETTERS IN ORDER</div><h2>Grow the right word.</h2></div><span class="question-count">${game.index + 1} / ${game.items.length}</span></div><div class="question-card"><div class="question-emoji">${item.verb.icon}</div><h3>${formLabels[item.key]}</h3><p>What is the ${item.key === 'v1' ? 'base form' : item.key === 'v2' ? 'past tense' : item.key === 'v3' ? 'past participle' : 'ing form'} of <b>${item.verb.word}</b>?</p></div><div class="jumble-answer" id="jumbleAnswer">${selected.map((letterIndex, i) => `<button class="letter-tile" data-action="remove-letter" data-index="${i}">${game.scrambled[letterIndex]}</button>`).join('')}</div><div class="jumble-bank">${game.scrambled.map((letter, i) => `<button class="letter-tile ${selected.includes(i) ? 'selected' : ''}" data-action="add-letter" data-index="${i}" ${selected.includes(i) || game.answered ? 'disabled' : ''}>${letter}</button>`).join('')}</div><div class="feedback ${game.answered ? (game.picked.map(i => game.scrambled[i]).join('') === answer ? 'good' : 'bad') : ''}">${game.answered ? (game.picked.map(i => game.scrambled[i]).join('') === answer ? 'Beautifully grown! That is right.' : `The right form is “${answer}”. Take another look next time.`) : ''}</div><div class="session-footer"><button class="text-button" data-action="jumble-clear">Clear letters</button>${game.answered ? `<button class="primary-button" data-action="game-next">${game.index === game.items.length - 1 ? 'See my garden' : 'Next puzzle'} →</button>` : `<button class="primary-button" data-action="jumble-check" ${selected.length !== game.scrambled.length ? 'disabled style="opacity:.45;cursor:not-allowed"' : ''}>Check word &nbsp; →</button>`}</div></section>`;
  }
}
function finishGame() {
  if (!game) return;
  const perfect = game.mistakes === 0;
  const earned = perfect ? 20 : 0;
  state.rounds += 1;
  if (perfect) { state.perfect += 1; state.coins += earned; state.xp += 20; }
  const learned = game.items.map(item => item.verb.word);
  state.learned = [...new Set([...state.learned, ...learned])];
  saveState();
  root.innerHTML = `<section class="completion"><div class="completion-icon">${perfect ? '🌟' : '🌱'}</div><div class="eyebrow">${perfect ? 'A PERFECT LITTLE ROUND' : 'A LOVELY BIT OF PRACTICE'}</div><h2>${perfect ? 'Your garden is glowing!' : 'Every try helps you grow.'}</h2><p>${perfect ? `Not a single mistake. You remembered every form beautifully.` : `You finished the round, and your verbs are a little more familiar now. Try again for a perfect round and earn petals.`}</p>${perfect ? `<div class="reward">✦ &nbsp; +${earned} petals</div>` : `<div class="reward">Keep practicing · perfect rounds earn 20 petals</div>`}<div><button class="primary-button" data-action="finish-home">Back to my garden &nbsp; →</button><button class="text-button" data-action="replay">Play another round</button></div></section>`;
  game = null;
}
function renderShop() {
  root.innerHTML = `<div class="heading-row"><div><div class="eyebrow">A LITTLE TREAT FOR YOURSELF</div><h1>The little shop</h1><p>Spend your petals on new friends and garden treasures.</p></div><div class="day-pill">✦ &nbsp; ${state.coins} petals to spend</div></div><div class="shop-layout"><div><div class="section-title"><h3>Garden friends & treasures</h3><span class="question-count">Owned items stay yours forever</span></div><div class="shop-items">${shopItems.map(item => { const owned = state.owned.includes(item.id); const equipped = item.type === 'avatar' && state.avatar === item.art; return `<article class="shop-card"><div class="shop-art">${item.art}</div><h4>${item.title}</h4><p>${item.desc}</p><div class="shop-card-bottom"><span class="price">${owned ? '✦ OWNED' : `✦ ${item.price} PETALS`}</span><button class="buy-button" data-action="buy" data-id="${item.id}" ${!owned && state.coins < item.price ? 'disabled' : ''}>${equipped ? 'Wearing' : owned ? item.type === 'avatar' ? 'Wear' : 'In your garden' : 'Bring home'}</button></div></article>`; }).join('')}</div></div><aside class="home-preview"><div class="preview-caption">A PEEK AT YOUR GARDEN</div><div class="room-scene"><div class="room-wall"></div><div class="room-sun"></div><div class="room-window"></div><span class="room-plant">${state.decor.includes('flowers') ? '💐' : '🌿'}</span><span class="room-avatar">${state.avatar}</span><span class="room-chair">${state.decor.includes('cottage') ? '🍄' : state.decor.includes('lantern') ? '🏮' : '🪑'}</span></div><div class="question-count">Your keepsakes are saved on this device.</div></aside></div>`;
}
function handleAction(action, target) {
  if (action === 'go-learn') setView('learn');
  else if (action === 'go-play') setView('play');
  else if (action === 'go-shop') setView('shop');
  else if (action === 'start-shuffle') startGame('quiz');
  else if (action === 'start-jumble') startGame('jumble');
  else if (action === 'open-flash') { flashIndex = Number(target.dataset.index); flashRevealed = false; setView('flash'); }
  else if (action === 'back-learn') setView('learn');
  else if (action === 'flash-next') { flashIndex = (flashIndex + 1) % verbs.length; flashRevealed = false; renderFlash(); }
  else if (action === 'flash-prev') { flashIndex = (flashIndex - 1 + verbs.length) % verbs.length; flashRevealed = false; renderFlash(); }
  else if (action === 'flip-card') { flashRevealed = !flashRevealed; state.learned = [...new Set([...state.learned, verbs[flashIndex].word])]; saveState(); renderFlash(); }
  else if (action === 'quiz-answer' && game && !game.answered) { const correct = game.items[game.index].verb[game.items[game.index].key]; game.picked = [target.dataset.answer]; if (target.dataset.answer !== correct) game.mistakes += 1; game.answered = true; renderGame(); }
  else if (action === 'game-next' && game) { game.index += 1; game.answered = false; game.picked = []; game.scrambled = []; renderGame(); }
  else if (action === 'add-letter' && game && !game.answered) { const idx = Number(target.dataset.index); if (!game.picked.includes(idx)) game.picked.push(idx); renderGame(); }
  else if (action === 'remove-letter' && game && !game.answered) { game.picked.splice(Number(target.dataset.index), 1); renderGame(); }
  else if (action === 'jumble-clear' && game) { game.picked = []; renderGame(); }
  else if (action === 'jumble-check' && game && !game.answered) { const answer = game.items[game.index].verb[game.items[game.index].key]; game.answered = true; if (game.picked.map(i => game.scrambled[i]).join('') !== answer) game.mistakes += 1; renderGame(); }
  else if (action === 'quit-game') { game = null; setView('play'); }
  else if (action === 'finish-home') setView('home');
  else if (action === 'replay') startGame(Math.random() < .5 ? 'quiz' : 'jumble');
  else if (action === 'buy') buyItem(target.dataset.id);
  else if (action === 'start-shuffle') startGame('quiz');
}
function buyItem(id) {
  const item = shopItems.find(entry => entry.id === id);
  if (!item) return;
  if (state.owned.includes(id)) {
    if (item.type === 'avatar') { state.avatar = item.art; saveState(); toast(`${item.title} is now by your side.`); }
    else toast('This keepsake is already in your garden.');
  } else if (state.coins >= item.price) {
    state.coins -= item.price;
    state.owned.push(id);
    if (item.type === 'avatar') state.avatar = item.art;
    else state.decor.push(id);
    saveState(); toast(`${item.title} is yours!`);
  } else toast('Not quite enough petals yet — try a perfect round!');
  renderShop();
}
root.addEventListener('click', event => {
  const target = event.target.closest('[data-action]');
  if (target && !target.disabled) handleAction(target.dataset.action, target);
});
document.querySelectorAll('.nav-link').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
document.getElementById('soundButton').addEventListener('click', () => toast('A peaceful garden, with or without music ♫'));
document.getElementById('profileButton').addEventListener('click', () => toast('Your progress is saved on this device.'));
updateHeader();
render();