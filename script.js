(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  const THEME_KEY = "shridhar-academic-theme";
  const savedTheme = (() => {
    try {
      const value = localStorage.getItem(THEME_KEY);
      return value === "dark" || value === "light" ? value : null;
    } catch (_) {
      return null;
    }
  })();
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  root.dataset.theme = savedTheme || systemTheme;

  function syncThemeButton() {
    const dark = root.dataset.theme === "dark";
    $$('meta[name="theme-color"]').forEach((meta) => meta.setAttribute("content", dark ? "#141413" : "#F6F1E8"));
    const button = $("#themeToggle");
    if (!button) return;
    button.setAttribute("aria-pressed", String(dark));
    button.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  }

  syncThemeButton();
  $("#themeToggle")?.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    try { localStorage.setItem(THEME_KEY, root.dataset.theme); } catch (_) {}
    syncThemeButton();
  });

  const menuToggle = $("#menuToggle");
  const mobileNav = $("#mobileNav");
  if (menuToggle && mobileNav) {
    const setMenu = (open) => {
      mobileNav.hidden = !open;
      mobileNav.classList.toggle("is-open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    menuToggle.addEventListener("click", () => {
      setMenu(mobileNav.hidden);
    });
    $$("a", mobileNav).forEach((link) => {
      link.addEventListener("click", () => {
        setMenu(false);
      });
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !mobileNav.hidden) {
        setMenu(false);
        menuToggle.focus();
      }
    });
    window.matchMedia("(min-width: 920px)").addEventListener("change", () => setMenu(false));
  }

  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  const progress = $("#scrollProgress");
  const header = $(".site-header");
  const updateScroll = () => {
    const doc = document.documentElement;
    if (progress) {
      const max = doc.scrollHeight - doc.clientHeight;
      progress.style.width = `${max > 0 ? (doc.scrollTop / max) * 100 : 0}%`;
    }
    header?.classList.toggle("is-scrolled", doc.scrollTop > 8);
  };
  window.addEventListener("scroll", updateScroll, { passive: true });
  window.addEventListener("resize", updateScroll);
  updateScroll();

  const navLinks = $$(".nav a");
  const sections = $$("main section[id]");
  if ("IntersectionObserver" in window && navLinks.length && sections.length) {
    const byId = new Map(navLinks.map((link) => [link.getAttribute("href").slice(1), link]));
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.remove("is-active");
          link.removeAttribute("aria-current");
        });
        const active = byId.get(entry.target.id);
        active?.classList.add("is-active");
        active?.setAttribute("aria-current", "location");
      });
    }, { rootMargin: "-42% 0px -50% 0px" });
    sections.forEach((section) => navObserver.observe(section));
  }

  function scrollToHashTarget() {
    if (!location.hash) return;
    try {
      document.querySelector(location.hash)?.scrollIntoView({ block: "start" });
    } catch (_) {}
  }

  if (location.hash) {
    window.setTimeout(scrollToHashTarget, 120);
    window.addEventListener("load", () => {
      window.setTimeout(scrollToHashTarget, 120);
      window.setTimeout(scrollToHashTarget, 650);
    });
  }

  function initPapers() {
    const list = $("#paperList");
    const search = $("#paperSearch");
    const count = $("#pubCount");
    const empty = $("#paperEmpty");
    if (!list || !search || !count) return;

    const papers = $$(".paper", list);
    let topic = "all";

    function apply() {
      const query = search.value.trim().toLowerCase();
      let visible = 0;
      let previousYear = null;
      papers.forEach((paper) => {
        const text = `${paper.textContent} ${paper.dataset.search || ""}`.toLowerCase();
        const topics = (paper.dataset.topic || "").split(/\s+/);
        const topicMatch = topic === "all" || topics.includes(topic);
        const queryMatch = !query || text.includes(query);
        const show = topicMatch && queryMatch;
        paper.hidden = !show;
        // Show each year once, on the first visible paper of that year.
        paper.classList.toggle("is-first", show && visible === 0);
        paper.classList.toggle("is-year-start", show && paper.dataset.year !== previousYear);
        if (show) {
          previousYear = paper.dataset.year;
          visible += 1;
        }
      });
      count.textContent = String(visible);
      list.hidden = visible === 0;
      if (empty) empty.hidden = visible !== 0;
    }

    list.classList.add("is-grouped");

    const chips = $$(".filter-chip");
    function selectTopic(value) {
      topic = value;
      chips.forEach((chip) => {
        const active = chip.dataset.filter === topic;
        chip.classList.toggle("is-active", active);
        chip.setAttribute("aria-pressed", String(active));
      });
      apply();
    }

    search.addEventListener("input", apply);
    chips.forEach((button) => {
      button.addEventListener("click", () => {
        selectTopic(button.dataset.filter);
      });
    });
    function revealLinkedPaper(hash = location.hash) {
      if (!hash.startsWith("#paper-")) return;
      const paper = document.getElementById(hash.slice(1));
      if (!paper?.classList.contains("paper")) return;
      search.value = "";
      selectTopic("all");
      paper.scrollIntoView({ block: "start" });
    }
    window.addEventListener("hashchange", () => revealLinkedPaper());
    $$("a[href^='#paper-']").forEach((link) => {
      link.addEventListener("click", () => revealLinkedPaper(link.getAttribute("href")));
    });
    selectTopic("all");
    revealLinkedPaper();
  }

  initPapers();

  function initContactModal() {
    const modal = $("#studioModal");
    if (!modal || typeof modal.showModal !== "function") return;

    const openers = $$("[data-inquiry-open]");
    const closers = $$("[data-inquiry-close]", modal);
    const form = $("#studioInquiry");
    const mail = $("#preparedMail");
    const status = $("#inquiryStatus");
    let lastFocus = null;
    let previousOverflow = "";

    function open(event) {
      event.preventDefault();
      if (modal.open) return;
      lastFocus = event.currentTarget;
      previousOverflow = body.style.overflow;
      modal.showModal();
      body.style.overflow = "hidden";
      $("#inquiryKind")?.focus();
    }

    function close() {
      modal.close();
    }

    openers.forEach((button) => button.addEventListener("click", open));
    closers.forEach((button) => button.addEventListener("click", close));
    modal.addEventListener("close", () => {
      body.style.overflow = previousOverflow;
      if (lastFocus?.isConnected) lastFocus.focus();
    });
    modal.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
      const focusable = $$("a[href], button, input, select, textarea", modal)
        .filter((element) => !element.disabled && element.getClientRects().length);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    });

    function updateDraft() {
      const kind = $("#inquiryKind")?.value || "Recruiting conversation";
      const name = $("#inquiryName")?.value.trim() || "A possible collaborator";
      const email = $("#inquiryEmail")?.value.trim();
      const brief = $("#inquiryBrief")?.value.trim() || "I would like to discuss a possible role or collaboration.";
      const subject = encodeURIComponent(`${kind} with Shridhar`);
      const bodyText = [
        "Hi Shridhar,",
        "",
        `Conversation type: ${kind}`,
        `Name: ${name}`,
        email ? `Email: ${email}` : null,
        "",
        "Brief:",
        brief,
      ].filter((line) => line !== null).join("\n");
      if (mail) mail.href = `mailto:shridhar.stark@gmail.com?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
    }

    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      updateDraft();
      if (status) status.textContent = "Draft prepared. Open your mail app to review and send it.";
    });
    form?.addEventListener("input", updateDraft);
    form?.addEventListener("change", updateDraft);
    mail?.addEventListener("click", (event) => {
      if (!form.reportValidity()) event.preventDefault();
      updateDraft();
    });
    updateDraft();
  }

  initContactModal();

  function initReveal() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) return;

    const targets = [
      ...$$(".hero__copy > *"),
      $(".hero__visual"),
      ...$$(".impact-strip > article"),
      $(".story-article"),
      $(".publications__head"),
      $(".paper-tools"),
      ...$$(".paper"),
      $(".connect"),
    ].filter(Boolean);

    const observer = new IntersectionObserver((entries) => {
      let index = 0;
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        element.style.setProperty("--d", `${Math.min(index, 6) * 70}ms`);
        element.classList.add("is-in");
        index += 1;
        observer.unobserve(element);
        // Clear the stagger so later hover transitions are not delayed.
        window.setTimeout(() => element.style.removeProperty("--d"), 1400);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.01 });

    targets.forEach((element) => {
      element.classList.add("reveal");
      observer.observe(element);
    });
    root.classList.add("motion-ok");
  }

  initReveal();
  root.classList.remove("no-js");
  $$("[data-enhanced]").forEach((element) => { element.hidden = false; });
})();
