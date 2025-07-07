// Hamburger Menu Functionality
gsap.registerPlugin(CustomEase);
CustomEase.create("button-ease", "0.5, 0.05, 0.05, 0.99");

function initMenuButton() {
  // Select elements
  const menuButton = document.querySelector("[data-menu-button]");
  const navLinks = document.querySelector(".nav-links");
  const navLinksItems = document.querySelectorAll(".nav-link");
  const lines = document.querySelectorAll(".menu-button-line");
  const [line1, line2, line3] = lines;

  console.log("Menu button elements:", {
    menuButton,
    navLinks,
    navLinksItems,
    lines,
  });

  // Define one global timeline
  let menuButtonTl = gsap.timeline({
    defaults: {
      overwrite: "auto",
      ease: "button-ease",
      duration: 0.3,
    },
  });

  const menuOpen = () => {
    console.log("Opening menu");
    menuButtonTl
      .clear() // Stop any previous tweens, if any
      .to(line2, { scaleX: 0, opacity: 0 }) // Step 1: Hide middle line
      .to(line1, { x: "-1.3em", opacity: 0 }, "<") // Step 1: Move top line
      .to(line3, { x: "1.3em", opacity: 0 }, "<") // Step 1: Move bottom line
      .to([line1, line3], { opacity: 0, duration: 0.1 }, "<+=0.2") // Step 2: Quickly fade top and bottom lines
      .set(line1, { rotate: -135, y: "-1.3em", scaleX: 0.9 }) // Step 3: Instantly rotate and scale top line
      .set(line3, { rotate: 135, y: "-1.4em", scaleX: 0.9 }, "<") // Step 3: Instantly rotate and scale bottom line
      .to(line1, { opacity: 1, x: "0em", y: "0.5em" }) // Step 4: Move top line to final position
      .to(line3, { opacity: 1, x: "0em", y: "-0.25em" }, "<+=0.1"); // Step 4: Move bottom line to final position
  };

  const menuClose = () => {
    console.log("Closing menu");
    menuButtonTl
      .clear() // Stop any previous tweens, if any
      .to([line1, line2, line3], {
        // Move all lines back in a different animation
        scaleX: 1,
        rotate: 0,
        x: "0em",
        y: "0em",
        opacity: 1,
        duration: 0.45,
        overwrite: "auto",
      });
  };

  function toggleMenu() {
    console.log("Toggling menu");
    const isActive = navLinks.classList.contains("active");
    navLinks.classList.toggle("active");
    menuButton.setAttribute("aria-expanded", !isActive);

    const currentState = menuButton.getAttribute("data-menu-button");
    if (currentState === "burger") {
      menuOpen();
      menuButton.setAttribute("data-menu-button", "close");
    } else {
      menuClose();
      menuButton.setAttribute("data-menu-button", "burger");
    }
  }

  // Toggle Animation and Menu
  menuButton.addEventListener("click", (e) => {
    console.log("Menu button clicked");
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  });

  // Close menu when clicking a link
  navLinksItems.forEach((link) => {
    link.addEventListener("click", () => {
      if (navLinks.classList.contains("active")) {
        console.log("Nav link clicked, closing menu");
        toggleMenu();
      }
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (
      navLinks.classList.contains("active") &&
      !navLinks.contains(e.target) &&
      !menuButton.contains(e.target)
    ) {
      console.log("Clicked outside, closing menu");
      toggleMenu();
    }
  });

  // Close menu on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navLinks.classList.contains("active")) {
      console.log("Escape key pressed, closing menu");
      toggleMenu();
    }
  });
}

// TN Calculator functionality
class TNCalculator {
  constructor() {
    // Initialize NPS calculator elements
    this.npsForm = document.getElementById("nps-calculator-form");
    this.npsResult = document.getElementById("nps-calculator-result");
    this.npsLandUseSelect = document.getElementById("npsLandUse");
    this.npsTreatmentMethodSelect =
      document.getElementById("npsTreatmentMethod");
    this.npsTreatmentArea = document.getElementById("npsTreatmentArea");

    // Initialize PS calculator elements
    this.psForm = document.getElementById("ps-calculator-form");
    this.psResult = document.getElementById("ps-calculator-result");

    // Track active form section for keyboard navigation
    this.activeFormSection = "nps";

    // Initialize focus management
    this.initializeFocusManagement();

    this.initializeEventListeners();
    this.initializeValidationListeners();
    this.loadData();
  }

  initializeEventListeners() {
    // NPS Calculator event listeners
    this.npsForm.addEventListener("submit", (e) => {
      console.log("NPS form submitted");
      e.preventDefault();
      if (this.validateForm(this.npsForm)) {
        console.log("Form validation passed");
        this.calculateNPS();
      } else {
        console.log("Form validation failed");
      }
    });

    // PS Calculator event listeners
    this.psForm.addEventListener("submit", (e) => {
      console.log("PS form submitted");
      e.preventDefault();
      if (this.validateForm(this.psForm)) {
        console.log("PS form validation passed");
        this.calculatePS();
      } else {
        console.log("PS form validation failed");
      }
    });

    // Add validation for percentage inputs
    const psAttenuationFactor = document.getElementById("psAttenuationFactor");

    psAttenuationFactor.addEventListener("input", () => {
      this.validatePercentageInput(psAttenuationFactor);
    });

    // Add keyboard navigation for calculator tabs
    const tabList = document.getElementById("calculatorTabs");
    const tabs = tabList.querySelectorAll('[role="tab"]');

    // Handle iframe escape
    const iframeEscapeButtons = document.querySelectorAll(".iframe-escape");
    iframeEscapeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const section = button.closest("section");
        if (section) {
          const sectionHeading = section.querySelector("h2");
          if (sectionHeading) {
            sectionHeading.focus();
          }
        }
      });
    });

    // Ensure proper tab indexing
    function updateTabIndexes() {
      tabs.forEach((tab) => {
        tab.setAttribute(
          "tabindex",
          tab.getAttribute("aria-selected") === "true" ? "0" : "-1"
        );
      });
    }

    // Update tab indexes on tab change
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        setTimeout(updateTabIndexes, 100);
      });
    });

    tabList.addEventListener("keydown", (e) => {
      const targetTab = e.target.closest('[role="tab"]');
      if (!targetTab) return;

      let newTab = null;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          newTab =
            targetTab.previousElementSibling?.querySelector('[role="tab"]') ||
            tabs[tabs.length - 1];
          break;
        case "ArrowRight":
          e.preventDefault();
          newTab =
            targetTab.nextElementSibling?.querySelector('[role="tab"]') ||
            tabs[0];
          break;
        case "Home":
          e.preventDefault();
          newTab = tabs[0];
          break;
        case "End":
          e.preventDefault();
          newTab = tabs[tabs.length - 1];
          break;
      }

      if (newTab) {
        tabs.forEach((tab) => {
          tab.setAttribute("aria-selected", "false");
          tab.setAttribute("tabindex", "-1");
        });
        newTab.setAttribute("aria-selected", "true");
        newTab.setAttribute("tabindex", "0");
        newTab.focus();
        newTab.click();
      }
    });
  }

  initializeFocusManagement() {
    // Handle tab switching focus management
    const npsTab = document.getElementById("nps-tab");
    const psTab = document.getElementById("ps-tab");
    const npsForm = document.getElementById("nps");
    const psForm = document.getElementById("ps");

    npsTab.addEventListener("click", () => {
      this.activeFormSection = "nps";
      // Clear PS calculator results
      this.psResult.innerHTML = "";
      // Focus first input in NPS form
      setTimeout(() => {
        const firstInput = npsForm.querySelector(
          'input[type="number"], select:not([aria-hidden="true"])'
        );
        if (firstInput) firstInput.focus();
      }, 100);
    });

    psTab.addEventListener("click", () => {
      this.activeFormSection = "ps";
      // Clear NPS calculator results
      this.npsResult.innerHTML = "";
      // Focus first input in PS form
      setTimeout(() => {
        const firstInput = psForm.querySelector(
          'input[type="number"], select:not([aria-hidden="true"])'
        );
        if (firstInput) firstInput.focus();
      }, 100);
    });

    // Remove the form submission focus management to let natural tab order work
  }

  initializeValidationListeners() {
    // Add input listeners to all form controls to clear validation state on change
    const addInputListener = (element) => {
      element.addEventListener("input", () => {
        element.classList.remove("is-invalid");
        element.setCustomValidity("");
        const feedbackDiv =
          element.parentElement.querySelector(".invalid-feedback");
        if (feedbackDiv) {
          feedbackDiv.remove();
        }
      });
    };

    // Add listeners to NPS form controls
    [this.npsTreatmentArea].forEach(addInputListener);

    this.npsLandUseSelect.addEventListener("change", () => {
      this.npsLandUseSelect.classList.remove("is-invalid");
      this.npsLandUseSelect.setCustomValidity("");
      const feedbackDiv =
        this.npsLandUseSelect.parentElement.querySelector(".invalid-feedback");
      if (feedbackDiv) {
        feedbackDiv.remove();
      }
    });
    this.npsTreatmentMethodSelect.addEventListener("change", () => {
      this.npsTreatmentMethodSelect.classList.remove("is-invalid");
      this.npsTreatmentMethodSelect.setCustomValidity("");
      const feedbackDiv =
        this.npsTreatmentMethodSelect.parentElement.querySelector(
          ".invalid-feedback"
        );
      if (feedbackDiv) {
        feedbackDiv.remove();
      }
    });

    // Add listeners to PS form controls
    const psControls = [
      document.getElementById("psAvgDischarge"),
      document.getElementById("psTNConcentration"),
      document.getElementById("psAttenuationFactor"),
    ];
    psControls.forEach(addInputListener);
  }

  validatePercentageInput(input) {
    const value = parseFloat(input.value);
    if (isNaN(value) || value < 0 || value > 100) {
      input.setCustomValidity("Please enter a value between 0 and 100");
      return false;
    }
    // Allow any decimal number between 0 and 100
    input.setCustomValidity("");
    return true;
  }

  validateForm(form) {
    console.log("Validating form");
    let isValid = true;

    // Check required fields
    const requiredFields = form.querySelectorAll("[required]");
    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        console.log(`Required field empty: ${field.id}`);
        field.classList.add("is-invalid");

        // Create and add invalid feedback message
        const feedbackDiv = document.createElement("div");
        feedbackDiv.className = "invalid-feedback";
        feedbackDiv.textContent = "This field is required";
        field.parentElement.appendChild(feedbackDiv);

        field.setCustomValidity("This field is required");
        isValid = false;
      } else {
        field.classList.remove("is-invalid");
        field.setCustomValidity("");
      }
    });

    // Validate percentage inputs (only for psAttenuationFactor)
    const percentageInputs = form.querySelectorAll("input[max='100']");
    percentageInputs.forEach((input) => {
      if (input.id === "psAttenuationFactor") {
        const container = input.closest(".form-group, .mb-3");
        if (container?.style.display === "none") {
          return;
        }

        const value = parseFloat(input.value);
        if (!isNaN(value) && (value < 0 || value > 100)) {
          console.log(`Invalid percentage value in: ${input.id}`);
          input.classList.add("is-invalid");

          // Create and add invalid feedback message
          const feedbackDiv = document.createElement("div");
          feedbackDiv.className = "invalid-feedback";
          feedbackDiv.textContent = "Please enter a value between 0 and 100";
          input.parentElement.appendChild(feedbackDiv);

          input.setCustomValidity("Please enter a value between 0 and 100");
          isValid = false;
        } else {
          input.classList.remove("is-invalid");
          input.setCustomValidity("");
        }
      }
    });

    // Validate decimal inputs for discharge and concentration
    const decimalInputs = ["psAvgDischarge", "psTNConcentration"];
    decimalInputs.forEach((inputId) => {
      const input = document.getElementById(inputId);
      if (input && input.value.trim()) {
        const value = parseFloat(input.value);
        // Only check if it's a valid number and not negative
        if (isNaN(value) || value < 0) {
          console.log(`Invalid decimal value in: ${inputId}`);
          input.classList.add("is-invalid");

          // Create and add invalid feedback message
          const feedbackDiv = document.createElement("div");
          feedbackDiv.className = "invalid-feedback";
          feedbackDiv.textContent = "Please enter a valid positive number";
          input.parentElement.appendChild(feedbackDiv);

          input.setCustomValidity("Please enter a valid positive number");
          isValid = false;
        } else {
          input.classList.remove("is-invalid");
          input.setCustomValidity("");
        }
      }
    });

    if (!isValid) {
      // Trigger the browser's native form validation UI
      form.reportValidity();
    }

    console.log(`Form validation result: ${isValid}`);
    return isValid;
  }

  async loadData() {
    try {
      // Load land use data from JSON file
      const landUseResponse = await fetch(
        "calculator/tn_calculator_land_use.json"
      );
      const landUseData = await landUseResponse.json();
      this.populateLandUseSelect(landUseData);
      this.landUseData = landUseData;

      // Load treatment method data from JSON file
      const treatmentResponse = await fetch(
        "calculator/tn_calculator_treatment_methods.json"
      );
      const treatmentData = await treatmentResponse.json();
      this.populateTreatmentMethodSelect(treatmentData);
      this.treatmentMethodData = treatmentData;
    } catch (error) {
      console.error("Error loading data:", error);
      this.showError("Failed to load options. Please try again later.");
    }
  }

  populateLandUseSelect(landUseData) {
    // Clear existing options except the first one
    while (this.npsLandUseSelect.options.length > 1) {
      this.npsLandUseSelect.remove(1);
    }

    // Add new options
    landUseData.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.name;
      option.textContent = item.name;
      option.dataset.baseLoad = item.base_load;
      this.npsLandUseSelect.appendChild(option);
    });
  }

  populateTreatmentMethodSelect(treatmentData) {
    // Clear existing options except the first one
    while (this.npsTreatmentMethodSelect.options.length > 1) {
      this.npsTreatmentMethodSelect.remove(1);
    }

    // Add new options
    treatmentData.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.name;
      option.textContent = item.name;
      option.dataset.removalRate = item.removal_rate;
      this.npsTreatmentMethodSelect.appendChild(option);
    });
  }

  getBaseLoadForLandUse(landUse) {
    const landUseData = this.landUseData.find((item) => item.name === landUse);
    return landUseData ? landUseData.base_load : 0;
  }

  getDefaultRemovalRate(treatmentMethod) {
    const treatmentData = this.treatmentMethodData.find(
      (item) => item.name === treatmentMethod
    );
    return treatmentData ? treatmentData.removal_rate : 0;
  }

  showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "alert alert-danger";
    errorDiv.textContent = message;
    this.npsForm.insertBefore(errorDiv, this.npsForm.firstChild);
  }

  calculateNPS() {
    try {
      const landUse = this.npsLandUseSelect.value;
      const treatmentMethod = this.npsTreatmentMethodSelect.value;
      const treatmentArea = parseFloat(this.npsTreatmentArea.value);

      // Get base load and removal rate
      const baseLoad = this.getBaseLoadForLandUse(landUse);
      const removalRate = this.getDefaultRemovalRate(treatmentMethod);

      // Calculate TN load reduction
      const tnLoadReduction = baseLoad * treatmentArea * removalRate;

      this.displayNPSResult(tnLoadReduction, treatmentMethod);
    } catch (error) {
      console.error("Error calculating NPS:", error);
      this.showError("Error calculating NPS TN load reduction");
    }
  }

  calculatePS() {
    try {
      const discharge = parseFloat(
        document.getElementById("psAvgDischarge").value
      );
      const concentration = parseFloat(
        document.getElementById("psTNConcentration").value
      );
      const attenuationFactor =
        parseFloat(document.getElementById("psAttenuationFactor").value) / 100;

      // NEW VERSION
      // Using the PHP logic: computeLoad($dis, $conc, $fact)
      // $calcLoad = $dis * 3785 * 365 * $conc/1000 * .0011 * $fact * 2000;
      const tnLoadReduction =
        // 1.524 * (discharge * concentration * attenuationFactor);
        discharge *
        3785 *
        365 *
        (concentration / 1000) *
        0.0011 *
        attenuationFactor *
        2000;

      this.displayPSResult(tnLoadReduction);
    } catch (error) {
      console.error("Error calculating PS:", error);
      this.showError("Error calculating PS TN load reduction");
    }
  }

  displayNPSResult(tnLoadReduction, treatmentMethod) {
    const resultElement = this.npsResult;
    resultElement.innerHTML = `
      <div class="calculator-result-container" 
           role="alert"
           aria-atomic="true"
           aria-relevant="all">
        <div class="result-content">
          <h4>${tnLoadReduction.toFixed(4)} lbs/year</h4>
          <p>NPS TN Load Reduction</p>
          <div class="sr-only">Calculation complete. The NPS TN Load Reduction is ${tnLoadReduction.toFixed(
            4
          )} pounds per year.</div>
        </div>
        <button type="button" class="copy-value" data-value="${tnLoadReduction.toFixed(
          4
        )}" aria-label="Copy result value">
          Copy Value
        </button>
      </div>
    `;
    this.initializeCopyButtons();
  }

  displayPSResult(tnLoadReduction) {
    const resultElement = this.psResult;
    resultElement.innerHTML = `
      <div class="calculator-result-container" 
           role="alert"
           aria-atomic="true"
           aria-relevant="all">
        <div class="result-content">
          <h4>${tnLoadReduction.toFixed(4)} lbs/year</h4>
          <p>PS TN Load Reduction</p>
          <div class="sr-only">Calculation complete. The PS TN Load Reduction is ${tnLoadReduction.toFixed(
            4
          )} pounds per year.</div>
        </div>
        <button type="button" class="copy-value" data-value="${tnLoadReduction.toFixed(
          4
        )}" aria-label="Copy result value">
          Copy Value
        </button>
      </div>
    `;
    this.initializeCopyButtons();
  }

  initializeCopyButtons() {
    const copyButtons = document.querySelectorAll(".copy-value");
    copyButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const value = button.getAttribute("data-value");
        try {
          // Try using the Clipboard API first
          await navigator.clipboard.writeText(value);
          this.showCopySuccess(button);
        } catch (err) {
          console.log("Clipboard API failed, trying fallback method");
          // Fallback method using a temporary textarea
          const textarea = document.createElement("textarea");
          textarea.value = value;
          textarea.style.position = "fixed";
          textarea.style.opacity = "0";
          document.body.appendChild(textarea);
          textarea.select();
          try {
            document.execCommand("copy");
            this.showCopySuccess(button);
          } catch (fallbackErr) {
            console.error("Fallback copy failed:", fallbackErr);
            alert(
              "Failed to copy value. Please try selecting and copying manually."
            );
          }
          document.body.removeChild(textarea);
        }
      });
    });
  }

  showCopySuccess(button) {
    const originalText = button.textContent;
    button.textContent = "Copied!";
    button.classList.add("active");

    // Remove active state and restore original text after 2000ms
    setTimeout(() => {
      button.classList.remove("active");
      button.textContent = originalText;
    }, 2000);
  }

  createResultContainer(result) {
    const container = document.createElement("div");
    container.className = "calculator-result-container";
    container.tabIndex = "0";
    container.setAttribute("role", "region");
    container.setAttribute("aria-label", "Calculation Result");

    const content = document.createElement("div");
    content.className = "result-content";

    const value = document.createElement("h4");
    value.textContent = result.value;
    value.setAttribute("aria-label", `Result: ${result.value}`);

    const label = document.createElement("p");
    label.textContent = result.label;

    content.appendChild(value);
    content.appendChild(label);

    const copyButton = document.createElement("button");
    copyButton.className = "copy-value";
    copyButton.textContent = "Copy Value";
    copyButton.setAttribute("aria-label", "Copy result value");
    copyButton.tabIndex = "0";

    container.appendChild(content);
    container.appendChild(copyButton);

    return container;
  }
}

// Initialize everything when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Prevent automatic scrolling
  if (window.location.hash) {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 1);
  }

  // Initialize TN Calculator
  const calculator = new TNCalculator();

  // Lazy load iframes using Intersection Observer
  const iframeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const iframe = entry.target;
          const dataSrc = iframe.getAttribute("data-src");

          if (dataSrc && !iframe.src) {
            // Load the iframe when it comes into view
            iframe.src = dataSrc;

            // Remove the observer since we only need to load once
            iframeObserver.unobserve(iframe);
          }
        }
      });
    },
    {
      rootMargin: "100px", // Start loading 100px before the iframe comes into view
    }
  );

  // Observe all iframes with data-src attributes
  document
    .querySelectorAll(".iframe-container iframe[data-src]")
    .forEach((iframe) => {
      iframeObserver.observe(iframe);
    });

  // Handle iframe loading
  document.querySelectorAll(".iframe-container iframe").forEach((iframe) => {
    // Show skeleton loader initially
    const container = iframe.closest(".iframe-container");

    iframe.addEventListener("load", () => {
      // Hide skeleton and show iframe
      container.classList.add("loaded");
      iframe.classList.add("loaded");

      // Update ARIA attributes
      const loader = container.querySelector(".skeleton-loader");
      if (loader) {
        loader.setAttribute("aria-hidden", "true");
      }
      iframe.removeAttribute("aria-hidden");

      // Fixed heights are now handled by CSS
      iframe.style.height = "100%";
    });

    // Set initial ARIA states
    iframe.removeAttribute("aria-hidden");

    // Add iframe focus and blur for accessibility outline (optional)
    iframe.addEventListener("focus", () => {
      iframe.style.outline = "2px solid #007bff";
      iframe.style.outlineOffset = "2px";
    });

    iframe.addEventListener("blur", () => {
      iframe.style.outline = "none";
    });
  });

  // Fixed heights are now handled by CSS - no need for dynamic resizing

  // Initialize Burger Menu Button
  initMenuButton();

  // Theme handling
  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    // Update icon visibility
    const sunIcon = document.querySelector(".sun-icon");
    const moonIcon = document.querySelector(".moon-icon");

    if (theme === "dark") {
      sunIcon.style.display = "none";
      moonIcon.style.display = "block";
    } else {
      sunIcon.style.display = "block";
      moonIcon.style.display = "none";
    }
  }

  // Check for saved theme preference or use system preference
  function initTheme() {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme(prefersDark ? "dark" : "light");
    }
  }

  // Toggle theme
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    setTheme(currentTheme === "dark" ? "light" : "dark");
  }

  // Initialize theme on page load
  initTheme();

  // Add click handler to theme toggle button
  const themeToggle = document.querySelector(".theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  // Listen for system theme changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) {
        setTheme(e.matches ? "dark" : "light");
      }
    });
});
