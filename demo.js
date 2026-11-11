const preview = document.querySelector("#preview");
const viewport = document.querySelector("#viewport");
const form = document.querySelector("#enquiry");
const email = form.elements.namedItem("email");
const customer = form.elements.namedItem("customer");
const details = form.elements.namedItem("details");
const error = document.querySelector("#email-error");
const feedback = document.querySelector("#feedback");
const summary = document.querySelector("#check-summary");
const description = document.querySelector("#state-description");
const outputs = Array.from(document.querySelectorAll("#checks output"));

function submissionResult(values) {
  if (preview.dataset.version === "before") return "broken";
  if (!values.emailValid) return "invalid-email";
  if (!values.customer.trim() || !values.details.trim()) return "incomplete";
  return "success";
}

function clearFeedback() {
  feedback.textContent = "";
  delete feedback.dataset.state;
  error.hidden = true;
  email.removeAttribute("aria-invalid");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearFeedback();
  const result = submissionResult({
    emailValid: email.validity.valid,
    customer: customer.value,
    details: details.value,
  });
  if (result === "invalid-email") {
    error.hidden = false;
    email.setAttribute("aria-invalid", "true");
    email.focus();
  } else if (result === "incomplete") {
    feedback.dataset.state = "invalid";
    feedback.textContent = "Enter your name and what you need.";
    (customer.value.trim() ? details : customer).focus();
  } else if (result === "success") {
    feedback.dataset.state = "success";
    feedback.textContent = "Enquiry accepted in this demo.";
  }
});

form.addEventListener("input", clearFeedback);

function resetChecks() {
  for (const output of outputs) {
    delete output.dataset.state;
    output.textContent = "Ready";
  }
  summary.textContent = "";
}

function bindSwitcher(key) {
  const buttons = Array.from(document.querySelectorAll(`button[data-${key}]`));
  for (const button of buttons) {
    button.addEventListener("click", () => {
      preview.dataset[key] = button.dataset[key];
      for (const item of buttons) item.setAttribute("aria-pressed", String(item === button));
      clearFeedback();
      resetChecks();
      description.textContent = preview.dataset.version === "after"
        ? "The repaired form fits the mobile preview and handles both valid and invalid enquiries. Try it or run the checks."
        : "The original form clips the email field on mobile and gives no response on submit. Run the checks to reproduce the issues.";
    });
  }
}

bindSwitcher("version");
bindSwitcher("device");

document.querySelector("#verify").addEventListener("click", () => {
  const testValues = { customer: "Jordan Lee", details: "A quote for two oak shelves." };
  const results = [
    viewport.scrollWidth <= viewport.clientWidth,
    submissionResult({ ...testValues, emailValid: false }) === "invalid-email",
    submissionResult({ ...testValues, emailValid: true }) === "success",
  ];
  for (const [index, passed] of results.entries()) {
    outputs[index].dataset.state = passed ? "pass" : "fail";
    outputs[index].textContent = passed ? "Pass" : "Fail";
  }
  const passes = results.filter(Boolean).length;
  summary.textContent = `${passes} of ${results.length} checks passed in this view.`;
});
