export function showIntro() {
  return new Promise((resolve) => {
    const intro = document.getElementById("intro");
    const button = document.getElementById("introContinue");

    if (!intro || !button) {
      document.body.classList.remove("intro-active");
      resolve();
      return;
    }

    button.focus();

    const finish = () => {
      intro.classList.add("intro--leaving");
      document.body.classList.remove("intro-active");

      const cleanup = () => {
        intro.remove();
        resolve();
      };

      intro.addEventListener("transitionend", cleanup, { once: true });
      window.setTimeout(cleanup, 1600);
    };

    const onContinue = () => {
      button.removeEventListener("click", onContinue);
      document.removeEventListener("keydown", onKeyDown);
      finish();
    };

    const onKeyDown = (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onContinue();
      }
    };

    button.addEventListener("click", onContinue);
    document.addEventListener("keydown", onKeyDown);
  });
}
