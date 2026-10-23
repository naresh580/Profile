const printButton = document.querySelector("#print-page");
const commandButton = document.querySelector("#open-commands");
const commandDialog = document.querySelector("#command-dialog");
const closeCommandButton = document.querySelector("#close-commands");
const commandSearch = document.querySelector("#command-search");
const commandItems = [...document.querySelectorAll(".command-item")];
const commandEmpty = document.querySelector("#command-empty");

printButton?.addEventListener("click", () => window.print());
document.querySelectorAll("[data-print-resume]").forEach((button) => {
  button.addEventListener("click", () => window.print());
});

window.addEventListener("beforeprint", () => {
  document.querySelectorAll("[data-counter]").forEach((element) => {
    const target = Number(element.dataset.counter);
    const decimals = Number(element.dataset.decimals ?? 0);
    element.textContent = target.toFixed(decimals);
  });
});

function openCommandPalette() {
  if (!(commandDialog instanceof HTMLDialogElement) || commandDialog.open) return;

  commandDialog.showModal();
  commandSearch?.focus();
}

commandButton?.addEventListener("click", openCommandPalette);
closeCommandButton?.addEventListener("click", () => commandDialog?.close());

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && commandDialog?.open) {
    event.preventDefault();
    commandDialog.close();
    return;
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openCommandPalette();
  }
});

commandSearch?.addEventListener("input", () => {
  const query = commandSearch.value.trim().toLowerCase();
  let visibleCount = 0;

  commandItems.forEach((item) => {
    const searchableText = `${item.dataset.search ?? ""} ${item.textContent}`.toLowerCase();
    const matches = searchableText.includes(query);
    item.hidden = !matches;
    if (matches) visibleCount += 1;
  });

  if (commandEmpty) commandEmpty.hidden = visibleCount > 0;
});

commandItems.forEach((item) => {
  item.addEventListener("click", (event) => {
    commandDialog?.close();

    if (item.dataset.action === "print") {
      event.preventDefault();
      window.print();
    }
  });
});

commandDialog?.addEventListener("click", (event) => {
  if (event.target === commandDialog) commandDialog.close();
});

document.querySelectorAll(".architecture-card").forEach((card) => {
  const nodes = [...card.querySelectorAll("[data-architecture-node]")];
  const detail = card.querySelector(".diagram-detail");

  nodes.forEach((node) => {
    node.setAttribute("aria-pressed", "false");
    node.addEventListener("click", () => {
      nodes.forEach((otherNode) => {
        otherNode.setAttribute("aria-pressed", String(otherNode === node));
      });

      if (detail) detail.textContent = node.dataset.detail ?? "";
    });
  });
});

const typewriterNodes = [...document.querySelectorAll("[data-typewriter]")];
const reducedMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

if (!reducedMotionPreference.matches) {
  typewriterNodes.forEach((node, nodeIndex) => {
    const text = node.textContent ?? "";
    node.textContent = "";

    window.setTimeout(() => {
      let characterIndex = 0;
      const typeNextCharacter = () => {
        node.textContent = text.slice(0, characterIndex + 1);
        characterIndex += 1;
        if (characterIndex < text.length) {
          window.setTimeout(typeNextCharacter, 24);
        }
      };

      typeNextCharacter();
    }, 260 + nodeIndex * 170);
  });
}

if ("IntersectionObserver" in window) {
  const reducedMotion = reducedMotionPreference.matches;
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(
    ".section-intro, .impact-card, .architecture-card, .case-card, .timeline-item, .ai-orbit, .ai-copy, .ai-topics, .stack-card, .credential-card, .knowledge-grid span, .education-detail",
  ).forEach((element) => {
    element.classList.add("reveal");
    revealObserver.observe(element);
  });

  if (!reducedMotion) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        const target = Number(element.dataset.counter);
        const decimals = Number(element.dataset.decimals ?? 0);
        const startedAt = performance.now();
        const duration = 900;

        function updateCounter(now) {
          const progress = Math.min((now - startedAt) / duration, 1);
          element.textContent = (target * progress).toFixed(decimals);
          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            observer.unobserve(element);
          }
        }

        requestAnimationFrame(updateCounter);
      });
    }, { threshold: 0.6 });

    document.querySelectorAll("[data-counter]").forEach((element) => {
      counterObserver.observe(element);
    });
  }
}
