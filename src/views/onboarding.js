// Onboarding bei Erstnutzung: 2 Screens (Intro + Garderobe-Auswahl).

import { el } from '../helpers.js';
import { setGarderobe, setOnboarded } from '../settings.js';
import illuShopping from '../assets/undraw_shopping_a55o.svg';
import illuBags from '../assets/undraw_shopping-bags_nfsf.svg';
import avatarMale from '../assets/undraw_cool-guy-avatar_qjc4.svg';
import avatarFemale from '../assets/undraw_stylish-girl-avatar_m8po.svg';

const CHOICES = [
  { label: 'Herrengarderobe', gender: 'male', avatars: [avatarMale] },
  { label: 'Damengarderobe', gender: 'female', avatars: [avatarFemale] },
  // female-Baum ist die umfangreichere Variante (deckt Herren- + Damenteile ab)
  { label: 'Gemischt', gender: 'female', avatars: [avatarMale, avatarFemale] },
];

export function onboardingView(onDone) {
  const root = el('div', { class: 'onboarding' });
  let step = 0;

  function dots(aktiv) {
    return el('div', { class: 'onb-dots' }, [0, 1].map((i) =>
      el('span', { class: 'onb-dot' + (i === aktiv ? ' active' : '') })
    ));
  }

  function renderIntro() {
    root.replaceChildren(
      el('div', { class: 'onb-illu' }, [el('img', { src: illuShopping, alt: '' })]),
      el('h2', { class: 'onb-title' }, 'Digitalisier deinen Kleiderschrank und erhalte Outfit-Vorschläge'),
      el('div', { class: 'onb-spacer' }),
      dots(0),
      el('button', { class: 'primary onb-cta', onclick: () => { step = 1; render(); } }, 'Weiter'),
    );
  }

  function renderGarderobe() {
    root.replaceChildren(
      el('div', { class: 'onb-illu' }, [el('img', { src: illuBags, alt: '' })]),
      el('h2', { class: 'onb-title' }, 'Enthält dein Kleiderschrank eher Teile aus der Herren- oder aus der Damengarderobe?'),
      el('div', { class: 'onb-choices' },
        CHOICES.map((c) => el('button', { class: 'onb-choice', onclick: () => finish(c) }, [
          el('span', { class: 'onb-choice-av' }, c.avatars.map((src) => el('img', { class: 'onb-av', src, alt: '' }))),
          el('span', { class: 'onb-choice-label' }, c.label),
        ]))
      ),
      el('p', { class: 'onb-hint muted small' }, 'Auswahl kann später geändert werden.'),
      el('div', { class: 'onb-spacer' }),
      dots(1),
    );
  }

  function finish(choice) {
    setGarderobe(choice.gender, choice.label);
    setOnboarded(true);
    onDone();
  }

  function render() {
    if (step === 0) renderIntro();
    else renderGarderobe();
  }

  render();
  return root;
}
