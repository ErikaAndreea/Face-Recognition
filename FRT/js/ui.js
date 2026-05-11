function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function titleCase(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function setStatus(value) {
  setText("status", value);
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

export function updateMetrics(faceData) {
  if (!faceData) {
    setText("age", "--");
    setText("gender", "--");
    setText("emotion", "--");
    return;
  }

  const age = Math.round(faceData.age);
  const genderProbability = Math.round(faceData.genderProbability * 100);
  const emotionConfidence = Math.round(faceData.emotionConfidence * 100);

  setText("age", String(age));
  setText("gender", `${titleCase(faceData.gender)} (${genderProbability}%)`);
  setText("emotion", `${titleCase(faceData.emotion)} (${emotionConfidence}%)`);
}
