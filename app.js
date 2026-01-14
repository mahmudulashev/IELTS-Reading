const totalQuestions = 40;
const timerDisplay = document.getElementById("timerDisplay");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const submitBtn = document.getElementById("submitBtn");
const resultPanel = document.getElementById("resultPanel");
const resultScore = document.getElementById("resultScore");
const resultBand = document.getElementById("resultBand");
const resultRows = document.getElementById("resultRows");
const closeResult = document.getElementById("closeResult");
const highlightMenu = document.getElementById("highlightMenu");
const highlightAction = document.getElementById("highlightAction");
const clearHighlightAction = document.getElementById("clearHighlightAction");
const clearAllAction = document.getElementById("clearAllAction");

const partTabs = document.querySelectorAll(".part-tab");
const partSections = document.querySelectorAll(".part-section");
const passages = document.querySelectorAll(".passage");
const answerCells = document.querySelectorAll(".answer-cell");
const partCountEls = document.querySelectorAll("[data-part-count]");
const navButtons = document.querySelectorAll(".nav-btn");

const partRanges = {
  "1": { start: 1, end: 13, total: 13 },
  "2": { start: 14, end: 26, total: 13 },
  "3": { start: 27, end: 40, total: 14 },
};

const answerKey = {
  1: "FALSE",
  2: "TRUE",
  3: "NOT GIVEN",
  4: "NOT GIVEN",
  5: "FALSE",
  6: "TRUE",
  7: "FALSE",
  8: "FALSE",
  9: "E",
  10: "C",
  11: "D",
  12: "F",
  13: "A",
  14: "vi",
  15: "viii",
  16: "v",
  17: "iii",
  18: "ix",
  19: "vii",
  20: "ii",
  21: "D",
  22: "B",
  23: "C",
  24: "density",
  25: "architects",
  26: "budget",
  27: "D",
  28: "B",
  29: "A",
  30: "B",
  31: "B",
  32: "NOT GIVEN",
  33: "YES",
  34: "NO",
  35: "NOT GIVEN",
  36: "NO",
  37: "D",
  38: "C",
  39: "A",
  40: "B",
};

let totalSeconds = 60 * 60;
let timerInterval = null;
let activePart = "1";
let currentQuestion = partRanges[activePart].start;
let activePassage = document.querySelector(".part-section.active .passage");
let lastContextRange = null;
let lastContextTarget = null;
let lastContextPassage = null;
let hasChecked = false;

const formatTime = (seconds) => {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
};

const updateTimer = () => {
  timerDisplay.textContent = formatTime(totalSeconds);
};

const updatePauseButton = () => {
  pauseBtn.textContent = timerInterval ? "||" : ">";
};

const startTimer = () => {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    totalSeconds -= 1;
    if (totalSeconds <= 0) {
      totalSeconds = 0;
      pauseTimer();
      openResultPanel();
    }
    updateTimer();
  }, 1000);
  updatePauseButton();
};

const pauseTimer = () => {
  clearInterval(timerInterval);
  timerInterval = null;
  updatePauseButton();
};

const resetTimer = () => {
  totalSeconds = 60 * 60;
  updateTimer();
  startTimer();
};

const getPartFromQuestion = (qNumber) => {
  if (qNumber <= 13) return "1";
  if (qNumber <= 26) return "2";
  return "3";
};

const setActivePart = (part) => {
  if (!partRanges[part]) return;
  activePart = part;
  currentQuestion = partRanges[part].start;

  partSections.forEach((section) => {
    section.classList.toggle("active", section.dataset.part === part);
  });

  partTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.part === part);
  });

  activePassage = document.querySelector(`.part-section[data-part='${part}'] .passage`);
  const activeQuestionList = document.querySelector(
    `.part-section[data-part='${part}'] .question-list`
  );
  if (activePassage) activePassage.scrollTop = 0;
  if (activeQuestionList) activeQuestionList.scrollTop = 0;
  hideHighlightMenu();
};

const scrollToQuestion = (qNumber) => {
  const target = document.querySelector(`[data-question='${qNumber}']`);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  target.classList.add("focus");
  setTimeout(() => target.classList.remove("focus"), 600);
};

const isAnswered = (element) => {
  if (element.dataset.answerType === "drop") {
    return Boolean(element.dataset.value && element.dataset.value.trim());
  }
  if (element.dataset.answerType === "matrix") {
    return Boolean(element.dataset.selected && element.dataset.selected.trim());
  }
  if (element.tagName === "INPUT") {
    return element.value.trim() !== "";
  }
  const radios = element.querySelectorAll("input[type='radio']");
  if (radios.length) {
    return Array.from(radios).some((radio) => radio.checked);
  }
  const textInput = element.querySelector("input[type='text']");
  if (textInput) {
    return textInput.value.trim() !== "";
  }
  return false;
};

const updateProgress = () => {
  const answerItems = document.querySelectorAll("[data-question]");
  const answeredMap = {};
  const partAnswered = { "1": 0, "2": 0, "3": 0 };
  let answeredTotal = 0;

  answerItems.forEach((item) => {
    const qNumber = Number(item.dataset.question);
    if (!qNumber) return;
    const answered = isAnswered(item);
    answeredMap[qNumber] = answered;
    if (answered) {
      answeredTotal += 1;
      partAnswered[getPartFromQuestion(qNumber)] += 1;
    }
  });

  answerCells.forEach((cell) => {
    const qNumber = Number(cell.dataset.q);
    cell.classList.toggle("answered", Boolean(answeredMap[qNumber]));
  });

  partCountEls.forEach((el) => {
    const part = el.dataset.partCount;
    const total = partRanges[part].total;
    el.textContent = `${partAnswered[part]} of ${total}`;
  });
};

const normalizeAnswer = (value) => value.trim().toLowerCase();

const bandFromScore = (score) => {
  const bands = [
    { min: 39, band: 9.0 },
    { min: 37, band: 8.5 },
    { min: 35, band: 8.0 },
    { min: 33, band: 7.5 },
    { min: 30, band: 7.0 },
    { min: 27, band: 6.5 },
    { min: 24, band: 6.0 },
    { min: 20, band: 5.5 },
    { min: 15, band: 5.0 },
    { min: 13, band: 4.5 },
    { min: 10, band: 4.0 },
    { min: 8, band: 3.5 },
    { min: 6, band: 3.0 },
    { min: 4, band: 2.5 },
    { min: 2, band: 2.0 },
    { min: 1, band: 1.0 },
    { min: 0, band: 0.0 },
  ];
  const match = bands.find((item) => score >= item.min);
  return match ? match.band : 0.0;
};

const clearCheckStyles = () => {
  document.querySelectorAll(".correct, .incorrect, .correct-answer").forEach((el) => {
    el.classList.remove("correct", "incorrect", "correct-answer");
  });
  document.querySelectorAll(".answer-feedback").forEach((el) => el.remove());
  document.querySelectorAll(".drop-slot").forEach((slot) => {
    slot.classList.remove("correct", "incorrect");
  });
  answerCells.forEach((cell) => cell.classList.remove("correct", "incorrect"));
};

const lockInputs = () => {
  document.querySelectorAll("input, select, textarea").forEach((input) => {
    input.disabled = true;
  });
  document.querySelectorAll(".matrix-cell").forEach((cell) => {
    cell.disabled = true;
  });
  document.querySelectorAll(".draggable-item").forEach((item) => {
    item.setAttribute("draggable", "false");
    item.classList.add("disabled");
  });
  document.querySelectorAll(".drop-slot").forEach((slot) => {
    slot.classList.add("disabled");
  });
  document.querySelectorAll(".slot-text").forEach((text) => {
    text.removeAttribute("draggable");
  });
};

const appendFeedback = (target, text) => {
  const feedback = document.createElement("span");
  feedback.className = "answer-feedback";
  feedback.textContent = `Correct: ${text}`;
  if (target.classList.contains("drop-slot")) {
    target.appendChild(feedback);
    return;
  }
  target.insertAdjacentElement("afterend", feedback);
};

const escapeSelectorValue = (value) => {
  if (window.CSS && CSS.escape) return CSS.escape(value);
  return value.replace(/\"/g, '\\"');
};

const evaluateQuestion = (qNumber) => {
  const correct = answerKey[qNumber] || "";
  const element = document.querySelector(`[data-question='${qNumber}']`);
  if (!element) {
    return { userAnswer: "", correct, answered: false, isCorrect: false };
  }

  let userAnswer = "";
  let answered = false;
  let isCorrect = false;

  if (element.dataset.answerType === "drop") {
    userAnswer = element.dataset.value || "";
    answered = Boolean(userAnswer);
    isCorrect = answered && normalizeAnswer(userAnswer) === normalizeAnswer(correct);
    element.classList.add(isCorrect ? "correct" : "incorrect");
    if (!isCorrect && correct) appendFeedback(element, correct);
  } else if (element.dataset.answerType === "matrix") {
    userAnswer = element.dataset.selected || "";
    answered = Boolean(userAnswer);
    isCorrect = answered && normalizeAnswer(userAnswer) === normalizeAnswer(correct);
    const selectedCell = element.querySelector(
      `.matrix-cell[data-value='${escapeSelectorValue(userAnswer)}']`
    );
    if (selectedCell) {
      selectedCell.classList.add(isCorrect ? "correct" : "incorrect");
    }
    if (!isCorrect && correct) {
      const correctCell = element.querySelector(
        `.matrix-cell[data-value='${escapeSelectorValue(correct)}']`
      );
      if (correctCell) correctCell.classList.add("correct-answer");
    }
  } else if (element.tagName === "INPUT") {
    userAnswer = element.value.trim();
    answered = Boolean(userAnswer);
    isCorrect = answered && normalizeAnswer(userAnswer) === normalizeAnswer(correct);
    element.classList.add(isCorrect ? "correct" : "incorrect");
    if (!isCorrect && correct) appendFeedback(element, correct);
  } else {
    const checked = element.querySelector("input[type='radio']:checked");
    userAnswer = checked ? checked.value : "";
    answered = Boolean(userAnswer);
    isCorrect = answered && normalizeAnswer(userAnswer) === normalizeAnswer(correct);
    if (checked) {
      const label = checked.closest("label");
      if (label) label.classList.add(isCorrect ? "correct" : "incorrect");
    }
    if (!isCorrect && correct) {
      const correctInput = element.querySelector(
        `input[type='radio'][value='${escapeSelectorValue(correct)}']`
      );
      if (correctInput) {
        const label = correctInput.closest("label");
        if (label) label.classList.add("correct-answer");
      }
    }
  }

  const cell = document.querySelector(`.answer-cell[data-q='${qNumber}']`);
  if (cell) {
    cell.classList.remove("correct", "incorrect");
    if (answered) cell.classList.add(isCorrect ? "correct" : "incorrect");
  }

  return { userAnswer, correct, answered, isCorrect };
};

const renderResults = (results) => {
  if (!resultRows) return;
  resultRows.innerHTML = "";

  results.forEach((result) => {
    const row = document.createElement("div");
    const answerText = result.answered ? result.userAnswer : "Not Answered";
    const answerClass = result.answered ? "" : "result-muted";
    const rowClass = result.answered
      ? result.isCorrect
        ? "result-row correct"
        : "result-row wrong"
      : "result-row empty";
    const correctClass = result.answered
      ? result.isCorrect
        ? "result-good"
        : "result-bad"
      : "result-muted";

    row.className = rowClass;
    row.innerHTML = `
      <span>${result.qNumber}</span>
      <span class="${answerClass}">${answerText}</span>
      <span class="${result.correct ? correctClass : "result-muted"}">${result.correct || "-"}</span>
    `;
    resultRows.appendChild(row);
  });
};

const checkAnswers = () => {
  if (hasChecked) {
    openResultPanel();
    return;
  }

  clearCheckStyles();
  const results = [];
  let score = 0;

  for (let qNumber = 1; qNumber <= totalQuestions; qNumber += 1) {
    const result = evaluateQuestion(qNumber);
    if (result.isCorrect) score += 1;
    results.push({ qNumber, ...result });
  }

  renderResults(results);
  if (resultScore) resultScore.textContent = `${score} / ${totalQuestions}`;
  if (resultBand) resultBand.textContent = `${bandFromScore(score)}`;

  hasChecked = true;
  pauseTimer();
  lockInputs();

  submitBtn.textContent = "My Result";
  submitBtn.classList.add("checked");

  showResultPanel();
};

const showResultPanel = () => {
  resultPanel.classList.add("active");
  resultPanel.setAttribute("aria-hidden", "false");
};

const updateRadioStyles = (groupName) => {
  if (!groupName) return;
  document.querySelectorAll(`input[name='${groupName}']`).forEach((input) => {
    const label = input.closest("label");
    if (label) label.classList.toggle("selected", input.checked);
  });
};

const initializeRadioStyles = () => {
  document.querySelectorAll("input[type='radio']").forEach((input) => {
    updateRadioStyles(input.name);
  });
};

const openResultPanel = () => {
  if (!hasChecked) {
    checkAnswers();
    return;
  }
  showResultPanel();
};

const closeResultPanel = () => {
  resultPanel.classList.remove("active");
  resultPanel.setAttribute("aria-hidden", "true");
};

const getSelectionRange = (passage) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  if (!passage.contains(range.commonAncestorContainer)) return null;
  return range;
};

const unwrapHighlight = (mark) => {
  const parent = mark.parentNode;
  if (!parent) return;
  parent.replaceChild(document.createTextNode(mark.textContent), mark);
  parent.normalize();
};

const hasHighlightInRange = (passage, range) => {
  if (!range || typeof range.intersectsNode !== "function") return false;
  const marks = passage.querySelectorAll("mark.highlight");
  return Array.from(marks).some((mark) => range.intersectsNode(mark));
};

const clearHighlightsInRange = (passage, range) => {
  if (!range || typeof range.intersectsNode !== "function") return;
  const marks = passage.querySelectorAll("mark.highlight");
  marks.forEach((mark) => {
    if (range.intersectsNode(mark)) {
      unwrapHighlight(mark);
    }
  });
};

const clearAllHighlights = (passage) => {
  const marks = passage.querySelectorAll("mark.highlight");
  marks.forEach((mark) => unwrapHighlight(mark));
};

const applyHighlight = (range) => {
  if (!range) return;
  const text = range.toString();
  if (!text.trim()) return;
  const mark = document.createElement("mark");
  mark.className = "highlight";
  try {
    range.surroundContents(mark);
  } catch (error) {
    const fragment = range.extractContents();
    mark.appendChild(fragment);
    range.insertNode(mark);
  }
  window.getSelection().removeAllRanges();
};

const showHighlightMenu = ({ x, y, hasSelection, canClear, hasAny }) => {
  highlightAction.disabled = !hasSelection;
  clearHighlightAction.disabled = !canClear;
  clearAllAction.disabled = !hasAny;
  highlightMenu.style.left = `${x}px`;
  highlightMenu.style.top = `${y}px`;
  highlightMenu.classList.add("active");
  highlightMenu.setAttribute("aria-hidden", "false");
};

const hideHighlightMenu = () => {
  highlightMenu.classList.remove("active");
  highlightMenu.setAttribute("aria-hidden", "true");
};

const syncDraggableItems = () => {
  const usedByGroup = new Map();
  document.querySelectorAll(".drop-slot").forEach((slot) => {
    const group = slot.dataset.group || "";
    const value = slot.dataset.value;
    if (!group || !value) return;
    if (!usedByGroup.has(group)) usedByGroup.set(group, new Set());
    usedByGroup.get(group).add(value);
  });

  document.querySelectorAll(".draggable-item").forEach((item) => {
    const group = item.dataset.group || "";
    const value = item.dataset.value || item.textContent.trim();
    const used = usedByGroup.get(group)?.has(value);
    item.hidden = Boolean(used);
    if (used) {
      item.setAttribute("aria-hidden", "true");
    } else {
      item.removeAttribute("aria-hidden");
    }
  });
};

const setDropSlotValue = (slot, value, label) => {
  const textEl = slot.querySelector(".slot-text");
  const placeholder = slot.dataset.placeholder || "Drop here";
  if (!textEl) return;
  if (value) {
    const displayLabel = label || value;
    textEl.textContent = displayLabel;
    textEl.setAttribute("draggable", "true");
    slot.dataset.label = displayLabel;
  } else {
    textEl.textContent = placeholder;
    textEl.removeAttribute("draggable");
    slot.removeAttribute("data-label");
  }
  slot.dataset.value = value;
  slot.classList.toggle("filled", Boolean(value));
};

const setupDropSlots = () => {
  const dropSlots = document.querySelectorAll(".drop-slot");
  dropSlots.forEach((slot) => {
    const textEl = slot.querySelector(".slot-text");
    if (textEl && !slot.dataset.placeholder) {
      slot.dataset.placeholder = textEl.textContent.trim();
    }
    setDropSlotValue(slot, slot.dataset.value || "");

    slot.addEventListener("dragover", (event) => {
      if (hasChecked) return;
      const group = event.dataTransfer.getData("group");
      if (group && group !== slot.dataset.group) return;
      event.preventDefault();
      slot.classList.add("over");
    });

    slot.addEventListener("dragleave", () => {
      slot.classList.remove("over");
    });

    slot.addEventListener("drop", (event) => {
      if (hasChecked) return;
      event.preventDefault();
      slot.classList.remove("over");
      const group = event.dataTransfer.getData("group");
      if (group && group !== slot.dataset.group) return;
      const value = event.dataTransfer.getData("text/value") || event.dataTransfer.getData("text/plain");
      const label = event.dataTransfer.getData("text/label") || value;
      if (!value) return;
      const sourceSlotId = event.dataTransfer.getData("source-slot");
      if (sourceSlotId && sourceSlotId !== slot.dataset.question) {
        const sourceSlot = document.querySelector(
          `.drop-slot[data-question='${sourceSlotId}']`
        );
        if (sourceSlot) setDropSlotValue(sourceSlot, "");
      }
      setDropSlotValue(slot, value, label);
      syncDraggableItems();
      updateProgress();
      currentQuestion = Number(slot.dataset.question) || currentQuestion;
    });

    slot.addEventListener("dblclick", () => {
      if (hasChecked) return;
      setDropSlotValue(slot, "");
      syncDraggableItems();
      updateProgress();
    });
  });
  syncDraggableItems();
};

const setupDraggableItems = () => {
  const draggableItems = document.querySelectorAll(".draggable-item");
  draggableItems.forEach((item) => {
    item.addEventListener("dragstart", (event) => {
      item.classList.add("dragging");
      const value = item.dataset.value || item.textContent.trim();
      const label = item.textContent.trim();
      event.dataTransfer.setData("text/value", value);
      event.dataTransfer.setData("text/label", label);
      event.dataTransfer.setData("text/plain", value);
      event.dataTransfer.setData("group", item.dataset.group || "");
      event.dataTransfer.effectAllowed = "copy";
    });

    item.addEventListener("dragend", () => {
      item.classList.remove("dragging");
    });
  });
};

const setupSlotDrag = () => {
  document.addEventListener("dragstart", (event) => {
    if (event.target.closest(".draggable-item")) return;
    const slotText = event.target.closest(".slot-text");
    if (!slotText) return;
    const slot = slotText.closest(".drop-slot");
    if (!slot || !slot.dataset.value) return;
    event.dataTransfer.setData("text/value", slot.dataset.value);
    event.dataTransfer.setData("text/label", slot.dataset.label || slotText.textContent.trim());
    event.dataTransfer.setData("text/plain", slot.dataset.value);
    event.dataTransfer.setData("group", slot.dataset.group || "");
    event.dataTransfer.setData("source-slot", slot.dataset.question || "");
    event.dataTransfer.effectAllowed = "move";
  });
};

const setupMatrixSelection = () => {
  const tables = document.querySelectorAll(".matrix");
  tables.forEach((table) => {
    table.addEventListener("click", (event) => {
      const cell = event.target.closest(".matrix-cell");
      if (!cell) return;
      const row = cell.closest("tr");
      if (!row) return;
      row.dataset.selected = cell.dataset.value;
      row.querySelectorAll(".matrix-cell").forEach((button) => {
        button.classList.toggle("selected", button === cell);
      });
      updateProgress();
      currentQuestion = Number(row.dataset.question) || currentQuestion;
    });
  });
};

pauseBtn.addEventListener("click", () => {
  if (timerInterval) {
    pauseTimer();
  } else {
    startTimer();
  }
});

resetBtn.addEventListener("click", resetTimer);

partTabs.forEach((tab) => {
  tab.addEventListener("click", () => setActivePart(tab.dataset.part));
});

answerCells.forEach((cell) => {
  cell.addEventListener("click", () => {
    const qNumber = Number(cell.dataset.q);
    const part = getPartFromQuestion(qNumber);
    setActivePart(part);
    currentQuestion = qNumber;
    scrollToQuestion(qNumber);
  });
});

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const step = Number(button.dataset.step);
    const range = partRanges[activePart];
    let next = currentQuestion + step;
    if (next < range.start) next = range.start;
    if (next > range.end) next = range.end;
    currentQuestion = next;
    scrollToQuestion(next);
  });
});

passages.forEach((passage) => {
  passage.addEventListener("contextmenu", (event) => {
    if (passage !== activePassage) return;
    const range = getSelectionRange(passage);
    const hasSelection = !!range && range.toString().trim() !== "";
    const targetHighlight = event.target.closest("mark.highlight");
    const canClear = Boolean(targetHighlight) || hasHighlightInRange(passage, range);
    const hasAny = passage.querySelector("mark.highlight") !== null;

    if (!hasSelection && !targetHighlight && !hasAny) {
      return;
    }

    event.preventDefault();
    lastContextRange = range;
    lastContextTarget = event.target;
    lastContextPassage = passage;
    showHighlightMenu({
      x: event.pageX,
      y: event.pageY,
      hasSelection,
      canClear,
      hasAny,
    });
  });

  passage.addEventListener("scroll", hideHighlightMenu);
});

highlightAction.addEventListener("click", () => {
  applyHighlight(lastContextRange);
  hideHighlightMenu();
});

clearHighlightAction.addEventListener("click", () => {
  if (!lastContextPassage) return;
  const targetHighlight = lastContextTarget
    ? lastContextTarget.closest("mark.highlight")
    : null;
  if (targetHighlight) {
    unwrapHighlight(targetHighlight);
  } else {
    clearHighlightsInRange(lastContextPassage, lastContextRange);
  }
  hideHighlightMenu();
});

clearAllAction.addEventListener("click", () => {
  const passage = lastContextPassage || activePassage;
  if (!passage) return;
  clearAllHighlights(passage);
  hideHighlightMenu();
});

window.addEventListener("click", (event) => {
  if (!highlightMenu.contains(event.target)) {
    hideHighlightMenu();
  }
});

document.addEventListener("input", (event) => {
  if (event.target.matches("input")) updateProgress();
});

document.addEventListener("change", (event) => {
  if (!event.target.matches("input")) return;
  if (event.target.type === "radio") {
    updateRadioStyles(event.target.name);
  }
  updateProgress();
});

document.addEventListener("click", (event) => {
  const item = event.target.closest("[data-question]");
  if (!item) return;
  const qNumber = Number(item.dataset.question);
  if (qNumber) currentQuestion = qNumber;
});

document.addEventListener("focusin", (event) => {
  const item = event.target.closest("[data-question]");
  if (!item) return;
  const qNumber = Number(item.dataset.question);
  if (qNumber) currentQuestion = qNumber;
});

submitBtn.addEventListener("click", openResultPanel);
closeResult.addEventListener("click", closeResultPanel);

resultPanel.addEventListener("click", (event) => {
  if (event.target === resultPanel) closeResultPanel();
});

setupDropSlots();
setupDraggableItems();
setupSlotDrag();
setupMatrixSelection();
updateTimer();
startTimer();
updateProgress();
initializeRadioStyles();
