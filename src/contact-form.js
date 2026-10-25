// Contact form → Web3Forms (https://web3forms.com), submitted with fetch so the page never reloads.

// ┌──────────────────────────────────────────────────────────────────┐
// │ FILL IN: free access key from https://web3forms.com, created     │
// │ with info@unbound3d.com. Submissions are emailed there.          │
// └──────────────────────────────────────────────────────────────────┘
const WEB3FORMS_ACCESS_KEY = 'YOUR_WEB3FORMS_ACCESS_KEY'

const ENDPOINT = 'https://api.web3forms.com/submit'

const form = document.querySelector('[data-contact-form]')

if (form) {
  const status = form.querySelector('[data-form-status]')
  const submit = form.querySelector('.contact-submit')
  const submitLabel = submit.querySelector('.contact-submit-label')
  const fields = ['name', 'email', 'phone', 'message'].map((n) => form.elements[n])

  // Preselect interest from ?interest=… (links from the Lynx 350 and procurement pages)
  const interest = new URLSearchParams(location.search).get('interest')
  if (interest && form.elements.interest.querySelector(`option[value="${CSS.escape(interest)}"]`)) {
    form.elements.interest.value = interest
  }

  const showError = (input, show) => {
    const error = document.getElementById(`${input.id}-error`)
    input.toggleAttribute('aria-invalid', show)
    if (error) error.hidden = !show
    if (show) {
      // Restart the shake animation
      input.classList.remove('shake')
      void input.offsetWidth
      input.classList.add('shake')
    }
  }

  const validate = (input) => {
    const value = input.value.trim()
    if (input.name !== 'phone' || value) input.value = value
    const ok = input.checkValidity() && !(input.required && !value)
    showError(input, !ok)
    return ok
  }

  // Validate on blur; once a field has shown an error, re-check as the user types
  fields.forEach((input) => {
    input.addEventListener('blur', () => { if (input.value) validate(input) })
    input.addEventListener('input', () => { if (input.hasAttribute('aria-invalid')) validate(input) })
  })

  const setStatus = (type, html) => {
    status.hidden = false
    status.className = `form-status form-status--${type}`
    status.innerHTML = html
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const invalid = fields.filter((input) => !validate(input))
    if (invalid.length) {
      invalid[0].focus()
      return
    }

    // Honeypot filled → silently pretend success
    if (form.elements.botcheck.value) {
      setStatus('success', '<strong>Thanks — message sent.</strong> We reply within 1 business day.')
      form.reset()
      return
    }

    if (WEB3FORMS_ACCESS_KEY.startsWith('YOUR_')) {
      setStatus('error', 'The form isn’t connected yet. Please email <a href="mailto:info@unbound3d.com">info@unbound3d.com</a> or message us on <a href="https://wa.me/917558150570">WhatsApp</a>.')
      return
    }

    const data = Object.fromEntries(new FormData(form))
    const interestLabel = form.elements.interest.selectedOptions[0].textContent
    const payload = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: `Website inquiry: ${interestLabel} — ${data.name}`,
      from_name: 'unbound3d.com contact form',
      replyto: data.email,
      ...data,
      interest: interestLabel,
    }
    delete payload.botcheck

    submit.disabled = true
    submit.setAttribute('aria-busy', 'true')
    submitLabel.textContent = 'Sending…'
    status.hidden = true

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || json.success === false) throw new Error(json.message || `HTTP ${res.status}`)

      form.reset()
      setStatus('success', '<strong>Thanks — message sent.</strong> We reply within 1 business day.')
    } catch {
      setStatus('error', 'Sorry, your message didn’t send. Please try again, or email <a href="mailto:info@unbound3d.com">info@unbound3d.com</a> or message us on <a href="https://wa.me/917558150570">WhatsApp</a>.')
    } finally {
      submit.disabled = false
      submit.removeAttribute('aria-busy')
      submitLabel.textContent = 'Send message'
    }
  })
}
