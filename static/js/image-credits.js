// Image Credits Display Manager (server-backed)
(() => {
  const parseCredits = value => {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return null;
    }
    return parsed;
  };

  const getCredits = () => {
    const value = document.body?.dataset?.imageCredits;
    return parseCredits(value);
  };

  const updateCreditDisplays = creditsOverride => {
    const credits = creditsOverride ?? getCredits();
    if (credits === null) return;
    document.querySelectorAll('[data-image-credit-count]').forEach(element => {
      element.textContent = credits;
    });
  };

  const setCredits = value => {
    const parsed = parseCredits(value);
    if (parsed === null || !document.body) {
      return false;
    }
    document.body.dataset.imageCredits = String(parsed);
    updateCreditDisplays(parsed);
    return true;
  };

  document.addEventListener('DOMContentLoaded', () => {
    updateCreditDisplays();
  });

  window.imageCredits = {
    getCredits,
    setCredits,
    updateDisplays: updateCreditDisplays,
  };
})();
