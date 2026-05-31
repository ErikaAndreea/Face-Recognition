function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

export function setNotice(value) {
  setText("notice", value);
}

export function setDramaticText(panelId, text, tone = "searching") {
  const element = document.getElementById(panelId);
  if (!element) {
    return;
  }

  element.textContent = text;
  element.classList.remove(
    "dramatic-text--searching",
    "dramatic-text--tracking",
    "dramatic-text--alert"
  );
  element.classList.add(`dramatic-text--${tone}`);
}
