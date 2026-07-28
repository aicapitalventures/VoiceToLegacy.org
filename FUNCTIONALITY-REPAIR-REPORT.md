# VoiceToLegacy.org Complete Button, Link, Form, and Functionality Repair Pass v1.0

## Scope

This repair pass preserves the approved visual design and changes only interaction, routing, validation, feedback, and accessibility behavior.

## Pages inspected

- `/`
- `/how-it-works/`
- `/published-work/`
- `/about/`
- `/faq/`
- `/contact/`
- `/start/`
- `/privacy/`
- `/terms/`
- `/accessibility/`
- `/404.html`

## Controls covered

- Desktop navigation
- Mobile navigation and menu toggle
- Header logo and Home links
- Begin Your Journey / Start Intake CTAs
- Internal page and footer links
- Same-page anchor scrolling
- Fillable PDF download
- Amazon external links
- Phone and text actions
- Email actions and clipboard fallback
- FAQ expanders
- Intake-method selection
- Intake-form validation
- Intake-request confirmation and fallback actions
- GitHub Pages preview paths
- `VoiceToLegacy.org` custom-domain paths
- 404 recovery links

## Repair behavior

### Routing

All internal routes resolve from the site root on both:

- `https://VoiceToLegacy.org/`
- `https://aicapitalventures.github.io/VoiceToLegacy.org/`

The current page receives the correct active-navigation state and `aria-current="page"`.

### Mobile navigation

The menu now maintains correct `aria-expanded` and `aria-hidden` states, locks background scrolling while open, closes after selection, closes on outside click, closes with Escape, and returns focus to the toggle when appropriate.

### Phone and text

Controls labeled or presented as “Call or Text” open a clear action chooser with separate Call, Text, and Copy Number actions. This prevents ambiguous or nonfunctional behavior on desktop systems while retaining native mobile actions.

### Email

Email controls retain their `mailto:` behavior and copy the email address to the clipboard as a fallback.

### Fillable PDF

The intake download route is normalized to the correct site root and provides a visible download confirmation.

### FAQ

FAQ items now maintain accurate expanded/collapsed ARIA state, expose one answer at a time, and display accurate plus/minus state icons.

### Intake request

The form now:

- Validates all required fields.
- Focuses the first invalid field.
- Marks invalid controls visibly and semantically.
- Selects Phone or Zoom from the relevant request card.
- Builds a complete structured request.
- Copies the request to the clipboard.
- Opens a populated email request.
- Allows the visitor to copy the request again.
- Allows the visitor to download a text-file backup.
- Displays a visible completion panel and toast notification.

## Post-deployment test checklist

### Global desktop navigation

- [ ] Header logo opens the homepage.
- [ ] Home opens `/` from every page.
- [ ] How It Works opens `/how-it-works/`.
- [ ] Published Work opens `/published-work/`.
- [ ] About opens `/about/`.
- [ ] FAQ opens `/faq/`.
- [ ] Contact opens `/contact/`.
- [ ] Begin Your Journey opens `/start/`.
- [ ] The active page is underlined correctly.

### Mobile menu

- [ ] Menu button opens the menu.
- [ ] Menu button closes the menu.
- [ ] Escape closes the menu.
- [ ] Clicking outside closes the menu.
- [ ] Selecting a link closes the menu and opens the destination.
- [ ] Page scrolling is locked only while the menu is open.
- [ ] Keyboard focus moves into the menu and returns appropriately.

### Homepage CTAs

- [ ] Begin Your Author Journey opens `/start/`.
- [ ] See How It Works opens `/how-it-works/`.
- [ ] View Published Work opens `/published-work/`.
- [ ] Final Begin Your Author Journey opens `/start/`.
- [ ] Call or Text opens the action chooser.
- [ ] Call action opens the device dialer where supported.
- [ ] Text action opens the device messaging app where supported.
- [ ] Copy Number copies `502-270-8828`.

### Published Work

- [ ] Boys to Men Amazon link opens in a new tab.
- [ ] Business Credit Amazon link opens in a new tab.
- [ ] Both external links include safe opener protections.
- [ ] Begin Your Intake opens `/start/`.

### FAQ

- [ ] Every FAQ question opens its answer.
- [ ] Opening one answer closes the previously open answer.
- [ ] Plus changes to minus when open.
- [ ] `aria-expanded` changes correctly.
- [ ] Contact Voice to Legacy opens `/contact/`.

### Contact page

- [ ] Phone card opens Call/Text/Copy choices.
- [ ] Email opens the default email application.
- [ ] Email address is copied as fallback.
- [ ] Choose Intake Method opens `/start/`.

### Start page

- [ ] Download Intake Form downloads the correct PDF.
- [ ] The downloaded PDF opens and remains fillable.
- [ ] Email Completed Form opens a composed email.
- [ ] Request Phone Intake selects Phone and scrolls to the form.
- [ ] Request Zoom Intake selects Zoom and scrolls to the form.
- [ ] Call or Text opens the action chooser.
- [ ] Email Zoom Request opens a composed email.
- [ ] Empty form submission identifies required fields.
- [ ] Invalid email is rejected.
- [ ] Completed form produces the confirmation panel.
- [ ] Open Email Request produces a populated email.
- [ ] Copy Request Again copies the complete request.
- [ ] Save Request Backup downloads a `.txt` file.

### Footer and legal pages

- [ ] Every Explore link works from every page.
- [ ] Prospective Author Intake opens `/start/`.
- [ ] Call or Text opens the action chooser.
- [ ] Email Elijah opens email and copies the address.
- [ ] Privacy opens `/privacy/`.
- [ ] Terms opens `/terms/`.
- [ ] Accessibility opens `/accessibility/`.
- [ ] The copyright year is current.

### Custom domain and fallback routes

- [ ] `https://voicetolegacy.org/` loads.
- [ ] `https://www.voicetolegacy.org/` redirects or loads correctly.
- [ ] HTTPS is enforced.
- [ ] A nonexistent URL displays the custom 404 page.
- [ ] Return Home on the 404 page opens `/`.
- [ ] Begin Your Journey on the 404 page opens `/start/`.

### Browser and device matrix

- [ ] Chrome desktop.
- [ ] Edge desktop.
- [ ] Firefox desktop.
- [ ] Safari desktop where available.
- [ ] Chrome Android.
- [ ] Safari iPhone.
- [ ] Keyboard-only navigation.
- [ ] Reduced-motion preference.

## Release gate

Merge only after the checklist passes on the branch preview or after a controlled merge followed by immediate production verification. Do not modify the approved logos, backgrounds, typography, page copy, or visual layout during this repair pass.
