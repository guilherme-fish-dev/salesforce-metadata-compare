const ui = {
  leftXml: document.getElementById("leftXml"),
  rightXml: document.getElementById("rightXml"),
  compareBtn: document.getElementById("compareBtn"),
  ignoreWhitespace: document.getElementById("ignoreWhitespace"),
  summary: document.getElementById("summary"),
  semantic: document.getElementById("semantic"),
  raw: document.getElementById("raw"),
  flow: document.getElementById("flowView"),
  ps: document.getElementById("ps"),
  tabs: Array.from(document.querySelectorAll(".tab-btn")),
  sampleLeft: document.getElementById("sampleLeft"),
  sampleRight: document.getElementById("sampleRight"),
  renderFlowBtn: document.getElementById("renderFlowBtn"),
  flowModeDiffBtn: document.getElementById("flowModeDiffBtn"),
  flowModeSplitBtn: document.getElementById("flowModeSplitBtn"),
  zoomInBtn: document.getElementById("zoomInBtn"),
  zoomOutBtn: document.getElementById("zoomOutBtn"),
  fitFlowBtn: document.getElementById("fitFlowBtn"),
  resetFlowBtn: document.getElementById("resetFlowBtn"),
  fullscreenFlowBtn: document.getElementById("fullscreenFlowBtn"),
  flowSection: document.getElementById("flow")
};

const flowViewState = {
  mode: "diff",
  activeViewerId: "main",
  enabled: false
};

const cyInstances = new Map();

const FLOW_TAG_LABELS = {
  start: "Início",
  decisions: "Decisão",
  assignments: "Atribuição",
  loops: "Loop",
  recordLookups: "Busca",
  recordUpdates: "Atualização",
  recordCreates: "Criação",
  recordDeletes: "Exclusão",
  actionCalls: "Ação",
  subflows: "Subflow",
  screens: "Tela",
  formulas: "Fórmula"
};

cytoscape.use(cytoscapeDagre);

const PERMISSION_SET_KEYS = {
  classAccesses: ["apexClass"],
  fieldPermissions: ["field"],
  objectPermissions: ["object"],
  pageAccesses: ["apexPage"],
  tabSettings: ["tab"],
  userPermissions: ["name"],
  customPermissions: ["name"],
  applicationVisibilities: ["application"],
  recordTypeVisibilities: ["recordType"],
  flowAccesses: ["flow"]
};

ui.tabs.forEach((tab) => {
  tab.addEventListener("click", () => activateTab(tab.dataset.tab));
});

ui.compareBtn.addEventListener("click", compareXml);
ui.sampleLeft.addEventListener("click", fillPermissionSetSample);
ui.sampleRight.addEventListener("click", fillFlowSample);
ui.renderFlowBtn.addEventListener("click", renderFlowDiagram);
ui.flowModeDiffBtn.addEventListener("click", () => setFlowMode("diff"));
ui.flowModeSplitBtn.addEventListener("click", () => setFlowMode("split"));
ui.zoomInBtn.addEventListener("click", () => zoomFlow(1.35));
ui.zoomOutBtn.addEventListener("click", () => zoomFlow(1 / 1.35));
ui.fitFlowBtn.addEventListener("click", () => fitFlowDiagram());
ui.resetFlowBtn.addEventListener("click", () => resetFlowView());
ui.fullscreenFlowBtn.addEventListener("click", toggleFlowFullscreen);
document.addEventListener("fullscreenchange", handleFlowFullscreenChange);

setFlowControlsEnabled(false);

function setFlowMode(mode) {
  flowViewState.mode = mode;
  ui.flowModeDiffBtn.classList.toggle("active", mode === "diff");
  ui.flowModeSplitBtn.classList.toggle("active", mode === "split");
  renderFlowDiagram();
}

function activateTab(tabName) {
  ui.tabs.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === tabName));
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.toggle("hidden", content.id !== tabName);
  });
}

function setFlowControlsEnabled(enabled) {
  flowViewState.enabled = enabled;
  [ui.zoomInBtn, ui.zoomOutBtn, ui.fitFlowBtn, ui.resetFlowBtn, ui.fullscreenFlowBtn].forEach((button) => {
    button.disabled = !enabled;
  });
}

function getActiveCytoscape() {
  return cyInstances.get(`cy-${flowViewState.activeViewerId}`) || null;
}

function destroyAllCytoscapeInstances() {
  cyInstances.forEach((cy) => cy.destroy());
  cyInstances.clear();
}

function zoomFlow(factor) {
  if (!flowViewState.enabled) {
    return;
  }

  const cy = getActiveCytoscape();
  if (!cy) {
    return;
  }

  const newZoom = Math.min(Math.max(cy.zoom() * factor, 0.05), 10);
  cy.zoom({ level: newZoom, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
}

function resetFlowView() {
  if (!flowViewState.enabled) {
    return;
  }

  const cy = getActiveCytoscape();
  if (cy) {
    cy.reset();
  }
}

function fitFlowDiagram() {
  if (!flowViewState.enabled) {
    return;
  }

  const cy = getActiveCytoscape();
  if (cy) {
    cy.fit(undefined, 40);
  }
}

function mountCytoscape(containerId, elements) {
  const container = document.getElementById(containerId);
  if (!container) {
    return null;
  }

  if (cyInstances.has(containerId)) {
    cyInstances.get(containerId).destroy();
    cyInstances.delete(containerId);
  }

  const cy = cytoscape({
    container,
    elements,
    style: getCytoscapeStylesheet(),
    layout: {
      name: "dagre",
      rankDir: "TB",
      nodeSep: 60,
      rankSep: 80,
      animate: false,
      padding: 40
    },
    minZoom: 0.05,
    maxZoom: 10,
    wheelSensitivity: 0.25
  });

  cy.on("mousedown touchstart", () => {
    const key = containerId.replace("cy-", "");
    flowViewState.activeViewerId = key;
  });

  cyInstances.set(containerId, cy);
  return cy;
}

function getCytoscapeStylesheet() {
  return [
    {
      selector: "node",
      style: {
        label: "data(label)",
        "text-wrap": "wrap",
        "text-max-width": "140px",
        "font-size": "11px",
        "font-family": "Manrope, sans-serif",
        "text-valign": "center",
        "text-halign": "center",
        "background-color": "#f4f1ea",
        "border-color": "#cbbba4",
        "border-width": 1,
        color: "#4b5563",
        shape: "round-rectangle",
        width: "label",
        height: "label",
        "padding-top": "10px",
        "padding-bottom": "10px",
        "padding-left": "14px",
        "padding-right": "14px"
      }
    },
    {
      selector: 'node[status="added"]',
      style: {
        "background-color": "#d6f5e8",
        "border-color": "#2a9d8f",
        "border-width": 2,
        color: "#1b4332"
      }
    },
    {
      selector: 'node[status="removed"]',
      style: {
        "background-color": "#ffe2e7",
        "border-color": "#ef476f",
        "border-width": 2,
        "border-style": "dashed",
        color: "#7f1d1d"
      }
    },
    {
      selector: 'node[status="changed"]',
      style: {
        "background-color": "#fff1d9",
        "border-color": "#f18f01",
        "border-width": 2,
        color: "#7c4a03"
      }
    },
    {
      selector: "edge",
      style: {
        "curve-style": "bezier",
        "target-arrow-shape": "triangle",
        "line-color": "#a8a0948c",
        "target-arrow-color": "#a8a0948c",
        width: 1.5
      }
    },
    {
      selector: 'edge[status="added"]',
      style: {
        "line-color": "#2a9d8f",
        "target-arrow-color": "#2a9d8f",
        width: 2.5
      }
    },
    {
      selector: 'edge[status="removed"]',
      style: {
        "line-style": "dashed",
        "line-color": "#ef476f",
        "target-arrow-color": "#ef476f",
        width: 2
      }
    }
  ];
}

function buildCytoscapeElements(diff) {
  const elements = [];
  const nodeIdByKey = new Map();

  diff.nodeDiffs.forEach((entry, index) => {
    const nodeId = `n${index}`;
    nodeIdByKey.set(entry.key, nodeId);
    const tagLabel = FLOW_TAG_LABELS[entry.node.tagName] || entry.node.tagName;
    elements.push({
      data: {
        id: nodeId,
        label: `[${tagLabel}]\n${entry.node.name}`,
        status: entry.status
      }
    });
  });

  diff.edgeDiffs.forEach((edge, index) => {
    const split = edge.key.split("-->");
    if (split.length !== 2) {
      return;
    }

    const sourceId = nodeIdByKey.get(split[0]);
    const targetId = nodeIdByKey.get(split[1]);
    if (!sourceId || !targetId) {
      return;
    }

    elements.push({
      data: {
        id: `e${index}`,
        source: sourceId,
        target: targetId,
        status: edge.status
      }
    });
  });

  return elements;
}

function buildCytoscapeSingleElements(model) {
  const elements = [];
  const nodeIdByKey = new Map();

  Array.from(model.nodesByKey.values()).forEach((node, index) => {
    const nodeId = `n${index}`;
    nodeIdByKey.set(node.key, nodeId);
    const tagLabel = FLOW_TAG_LABELS[node.tagName] || node.tagName;
    elements.push({
      data: {
        id: nodeId,
        label: `[${tagLabel}]\n${node.name}`,
        status: "unchanged"
      }
    });
  });

  Array.from(model.edges).forEach((edgeKey, index) => {
    const split = edgeKey.split("-->");
    if (split.length !== 2) {
      return;
    }

    const sourceId = nodeIdByKey.get(split[0]);
    const targetId = nodeIdByKey.get(split[1]);
    if (!sourceId || !targetId) {
      return;
    }

    elements.push({
      data: {
        id: `e${index}`,
        source: sourceId,
        target: targetId,
        status: "unchanged"
      }
    });
  });

  return elements;
}

async function toggleFlowFullscreen() {
  if (!flowViewState.enabled) {
    return;
  }

  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await ui.flowSection.requestFullscreen();
  } catch (error) {
    renderEmpty(ui.flow, `Não foi possível abrir em tela cheia: ${error.message}`);
  }
}

function handleFlowFullscreenChange() {
  const fullscreenOn = document.fullscreenElement === ui.flowSection;
  ui.fullscreenFlowBtn.textContent = fullscreenOn ? "Sair tela cheia" : "Tela cheia";

  setTimeout(() => {
    cyInstances.forEach((cy) => {
      cy.resize();
      cy.fit(undefined, 40);
    });
  }, 120);
}

function buildFlowPaneHtml(viewerId, title) {
  return `<article class="flow-pane"><header class="flow-pane-head"><h4>${escapeHtml(title)}</h4></header><div id="cy-${viewerId}" class="cy-container"></div></article>`;
}

function compareXml() {
  const leftText = ui.leftXml.value || "";
  const rightText = ui.rightXml.value || "";

  if (!leftText.trim() || !rightText.trim()) {
    renderEmpty(ui.semantic, "Cole os dois XMLs para iniciar a comparação.");
    renderEmpty(ui.raw, "Cole os dois XMLs para gerar o diff textual.");
    renderEmpty(ui.ps, "Cole os dois XMLs para gerar o schema de Permission Set.");
    ui.summary.classList.add("hidden");
    return;
  }

  try {
    const leftDoc = parseXml(leftText);
    const rightDoc = parseXml(rightText);

    const semantic = buildSemanticDiff(leftDoc, rightDoc);
    const raw = buildRawDiff(leftText, rightText);

    renderSummary(semantic.counters);
    renderSemanticDiff(semantic.groups);
    renderRawDiff(raw);
    renderPermissionSetSchema(semantic.permissionSetSchema);

    if (isFlowDocument(leftDoc) || isFlowDocument(rightDoc)) {
      renderFlowDiagram();
    }
  } catch (error) {
    renderEmpty(ui.semantic, `Erro ao ler XML: ${error.message}`);
    ui.summary.classList.add("hidden");
  }
}

function parseXml(xmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "application/xml");
  const parserError = doc.querySelector("parsererror");

  if (parserError) {
    throw new Error(parserError.textContent?.trim() || "XML inválido");
  }

  return doc;
}

function normalizeText(value) {
  if (ui.ignoreWhitespace.checked) {
    return value.replace(/\s+/g, " ").trim();
  }

  return value.trim();
}

function getElementChildren(element) {
  return Array.from(element.children || []);
}

function serializeElement(element) {
  return new XMLSerializer().serializeToString(element);
}

function makeFingerprint(element) {
  const attrs = Array.from(element.attributes || [])
    .map((attr) => `${attr.name}=${attr.value}`)
    .sort()
    .join("|");

  const childEntries = getElementChildren(element)
    .map((child) => `${child.tagName}:${normalizeText(child.textContent || "")}`)
    .sort()
    .join("|");

  const ownText = normalizeText(
    Array.from(element.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.nodeValue || "")
      .join(" ")
  );

  return `${element.tagName}||${attrs}||${childEntries}||${ownText}`;
}

function mapRootChildren(doc) {
  const root = doc.documentElement;
  if (!root) {
    return { rootTag: "", map: new Map(), root };
  }

  const map = new Map();
  getElementChildren(root).forEach((child, index) => {
    if (!map.has(child.tagName)) {
      map.set(child.tagName, []);
    }

    map.get(child.tagName).push({ index, element: child });
  });

  return { rootTag: root.tagName, map, root };
}

function getChildText(element, tagName) {
  const child = getElementChildren(element).find((c) => c.tagName === tagName);
  return child ? normalizeText(child.textContent || "") : "";
}

function getSemanticKey(tagName, element, fallbackIndex) {
  const keyCandidates = PERMISSION_SET_KEYS[tagName];

  if (keyCandidates) {
    for (const keyTag of keyCandidates) {
      const value = getChildText(element, keyTag);
      if (value) {
        return `${tagName}:${keyTag}=${value}`;
      }
    }
  }

  return `${tagName}:#${fallbackIndex}:${makeFingerprint(element)}`;
}

function buildSemanticDiff(leftDoc, rightDoc) {
  const left = mapRootChildren(leftDoc);
  const right = mapRootChildren(rightDoc);

  const groups = [];
  const counters = { added: 0, removed: 0, changed: 0, moved: 0 };
  const permissionSetSchema = [];

  const allTags = new Set([...left.map.keys(), ...right.map.keys()]);

  allTags.forEach((tagName) => {
    const leftItems = left.map.get(tagName) || [];
    const rightItems = right.map.get(tagName) || [];

    const leftByKey = new Map();
    leftItems.forEach((item, i) => {
      leftByKey.set(getSemanticKey(tagName, item.element, i), item);
    });

    const rightByKey = new Map();
    rightItems.forEach((item, i) => {
      rightByKey.set(getSemanticKey(tagName, item.element, i), item);
    });

    const keys = new Set([...leftByKey.keys(), ...rightByKey.keys()]);
    const details = [];

    const schemaEntry = {
      tagName,
      added: [],
      removed: [],
      moved: []
    };

    keys.forEach((key) => {
      const leftItem = leftByKey.get(key);
      const rightItem = rightByKey.get(key);

      if (!leftItem && rightItem) {
        counters.added += 1;
        details.push({
          kind: "added",
          key,
          message: `Adicionado no arquivo novo em ${tagName}`,
          right: serializeElement(rightItem.element)
        });
        schemaEntry.added.push(prettyKeyLabel(key));
        return;
      }

      if (leftItem && !rightItem) {
        counters.removed += 1;
        details.push({
          kind: "removed",
          key,
          message: `Removido no arquivo novo em ${tagName}`,
          left: serializeElement(leftItem.element)
        });
        schemaEntry.removed.push(prettyKeyLabel(key));
        return;
      }

      const leftSerialized = serializeElement(leftItem.element);
      const rightSerialized = serializeElement(rightItem.element);
      const leftCompact = normalizeText(leftSerialized);
      const rightCompact = normalizeText(rightSerialized);

      if (leftCompact !== rightCompact) {
        counters.changed += 1;
        details.push({
          kind: "changed",
          key,
          message: `Mesmo item, mas conteúdo alterado em ${tagName}`,
          left: leftSerialized,
          right: rightSerialized
        });
      } else if (leftItem.index !== rightItem.index) {
        counters.moved += 1;
        details.push({
          kind: "moved",
          key,
          message: `Mudou de posição: ${leftItem.index} -> ${rightItem.index}`,
          left: leftSerialized
        });
        schemaEntry.moved.push(prettyKeyLabel(key));
      }
    });

    if (details.length) {
      groups.push({ tagName, details });
    }

    if (Object.values(schemaEntry).some((value) => Array.isArray(value) && value.length)) {
      permissionSetSchema.push(schemaEntry);
    }
  });

  return { groups, counters, permissionSetSchema, rootTag: left.rootTag || right.rootTag };
}

function prettyKeyLabel(key) {
  const split = key.split("=");
  if (split.length > 1) {
    return split.slice(1).join("=");
  }
  return key;
}

function buildRawDiff(leftText, rightText) {
  const parts = Diff.diffLines(leftText, rightText);
  return parts;
}

function renderSummary(counters) {
  ui.summary.innerHTML = "";
  ui.summary.classList.remove("hidden");

  const items = [
    { label: "Adicionados", className: "added", value: counters.added },
    { label: "Removidos", className: "removed", value: counters.removed },
    { label: "Alterados", className: "changed", value: counters.changed },
    { label: "Movidos", className: "moved", value: counters.moved }
  ];

  items.forEach((item) => {
    const pill = document.createElement("span");
    pill.className = `pill ${item.className}`;
    pill.textContent = `${item.label}: ${item.value}`;
    ui.summary.appendChild(pill);
  });
}

function renderSemanticDiff(groups) {
  ui.semantic.innerHTML = "";

  if (!groups.length) {
    renderEmpty(ui.semantic, "Nenhuma diferença semântica encontrada.");
    return;
  }

  groups.forEach((group) => {
    const wrapper = document.createElement("article");
    wrapper.className = "diff-group";

    const title = document.createElement("h4");
    title.textContent = group.tagName;
    wrapper.appendChild(title);

    group.details.forEach((detail) => {
      const item = document.createElement("div");
      item.className = "diff-item";

      const keyLabel = prettyKeyLabel(detail.key);
      item.innerHTML = `<strong>[${detail.kind.toUpperCase()}]</strong> ${detail.message}<br><code>${escapeHtml(keyLabel)}</code>`;
      wrapper.appendChild(item);
    });

    ui.semantic.appendChild(wrapper);
  });
}

function renderRawDiff(parts) {
  ui.raw.innerHTML = "";

  if (!parts.length) {
    renderEmpty(ui.raw, "Nenhuma diferença textual encontrada.");
    return;
  }

  parts.forEach((part) => {
    const block = document.createElement("div");
    block.className = "raw-line";

    if (part.added) {
      block.classList.add("added");
      block.textContent = part.value
        .split("\n")
        .filter(Boolean)
        .map((line) => `+ ${line}`)
        .join("\n");
    } else if (part.removed) {
      block.classList.add("removed");
      block.textContent = part.value
        .split("\n")
        .filter(Boolean)
        .map((line) => `- ${line}`)
        .join("\n");
    } else {
      block.textContent = part.value
        .split("\n")
        .filter(Boolean)
        .map((line) => `  ${line}`)
        .join("\n");
    }

    if (block.textContent.trim()) {
      ui.raw.appendChild(block);
    }
  });
}

function renderPermissionSetSchema(schema) {
  ui.ps.innerHTML = "";

  if (!schema.length) {
    renderEmpty(ui.ps, "Sem dados de Permission Set para exibir no schema.");
    return;
  }

  const grid = document.createElement("div");
  grid.className = "ps-grid";

  schema.forEach((entry) => {
    const card = document.createElement("article");
    card.className = "ps-card";

    card.innerHTML = `<h4>${entry.tagName}</h4>`;

    card.appendChild(buildTokenSection("Adicionados", entry.added));
    card.appendChild(buildTokenSection("Removidos", entry.removed));
    card.appendChild(buildTokenSection("Movidos", entry.moved));

    grid.appendChild(card);
  });

  ui.ps.appendChild(grid);
}

function buildTokenSection(title, values) {
  const section = document.createElement("section");
  const heading = document.createElement("strong");
  heading.textContent = `${title}: `;
  section.appendChild(heading);

  if (!values.length) {
    const empty = document.createElement("span");
    empty.textContent = "nenhum";
    empty.style.color = "#5d6472";
    section.appendChild(empty);
    return section;
  }

  const list = document.createElement("div");
  list.className = "ps-list";

  values.forEach((value) => {
    const token = document.createElement("span");
    token.className = "ps-token";
    token.textContent = value;
    list.appendChild(token);
  });

  section.appendChild(list);
  return section;
}

function isFlowDocument(doc) {
  const rootTag = doc.documentElement?.tagName || "";
  return rootTag.toLowerCase().includes("flow");
}

const FLOW_ALLOWED_TAGS = [
  "start",
  "recordLookups",
  "recordUpdates",
  "recordCreates",
  "recordDeletes",
  "decisions",
  "loops",
  "assignments",
  "actionCalls",
  "subflows",
  "screens",
  "formulas"
];

function getDirectChildByTag(element, tagName) {
  return getElementChildren(element).find((child) => child.tagName === tagName);
}

function getConnectorTargets(element) {
  const targets = new Set();

  function extractTarget(connectorEl) {
    const ref = getChildText(connectorEl, "targetReference");
    if (ref) {
      targets.add(ref);
    }
  }

  Array.from(element.children).forEach((child) => {
    const tag = child.tagName;

    // Connector-type elements that are direct children of the node
    if (
      tag === "connector" ||
      tag === "defaultConnector" ||
      tag === "faultConnector" ||
      tag === "nextValueConnector" ||
      tag === "noMoreValuesConnector"
    ) {
      extractTarget(child);
      return;
    }

    // Connectors nested inside <rules> (decisions)
    if (tag === "rules") {
      Array.from(child.children).forEach((ruleChild) => {
        if (ruleChild.tagName === "connector" || ruleChild.tagName === "defaultConnector") {
          extractTarget(ruleChild);
        }
      });
      return;
    }

    // Connectors nested inside <scheduledPaths> (start element with scheduled triggers)
    if (tag === "scheduledPaths") {
      Array.from(child.children).forEach((pathChild) => {
        if (pathChild.tagName === "connector") {
          extractTarget(pathChild);
        }
      });
      return;
    }

    // Connectors nested inside <waitEvents> (wait elements)
    if (tag === "waitEvents") {
      Array.from(child.children).forEach((waitChild) => {
        if (waitChild.tagName === "connector") {
          extractTarget(waitChild);
        }
      });
    }
  });

  return Array.from(targets);
}

function buildFlowModel(doc) {
  const root = doc.documentElement;
  if (!root) {
    return { nodesByKey: new Map(), edges: new Set(), rootLabel: "Flow" };
  }

  const allElements = Array.from(root.getElementsByTagName("*"));
  const rawNodes = [];

  allElements.forEach((el) => {
    if (!FLOW_ALLOWED_TAGS.includes(el.tagName)) {
      return;
    }

    const name = getChildText(el, "name") || el.getAttribute("name") || `${el.tagName}_${rawNodes.length + 1}`;
    const key = `${el.tagName}:${name}`;

    rawNodes.push({
      tagName: el.tagName,
      name,
      key,
      serialized: normalizeText(serializeElement(el)),
      element: el
    });
  });

  const nodesByKey = new Map();
  const nameToKeys = new Map();

  rawNodes.forEach((node) => {
    nodesByKey.set(node.key, {
      key: node.key,
      tagName: node.tagName,
      name: node.name,
      label: `${node.tagName}\\n${node.name}`,
      serialized: node.serialized
    });

    if (!nameToKeys.has(node.name)) {
      nameToKeys.set(node.name, []);
    }

    nameToKeys.get(node.name).push(node.key);
  });

  const edges = new Set();

  rawNodes.forEach((node) => {
    const targets = getConnectorTargets(node.element);
    targets.forEach((targetName) => {
      const targetKeys = nameToKeys.get(targetName);
      if (!targetKeys || !targetKeys.length) {
        return;
      }

      const targetKey = targetKeys[0];
      edges.add(`${node.key}-->${targetKey}`);
    });
  });

  return {
    nodesByKey,
    edges,
    rootLabel: root.tagName || "Flow"
  };
}

function buildFlowDiff(leftModel, rightModel) {
  const nodeDiffs = [];
  const edgeDiffs = [];

  const leftNodes = leftModel.nodesByKey;
  const rightNodes = rightModel.nodesByKey;
  const allNodeKeys = new Set([...leftNodes.keys(), ...rightNodes.keys()]);

  const counters = {
    nodesAdded: 0,
    nodesRemoved: 0,
    nodesChanged: 0,
    edgesAdded: 0,
    edgesRemoved: 0
  };

  allNodeKeys.forEach((key) => {
    const leftNode = leftNodes.get(key);
    const rightNode = rightNodes.get(key);

    if (!leftNode && rightNode) {
      counters.nodesAdded += 1;
      nodeDiffs.push({ key, status: "added", node: rightNode });
      return;
    }

    if (leftNode && !rightNode) {
      counters.nodesRemoved += 1;
      nodeDiffs.push({ key, status: "removed", node: leftNode });
      return;
    }

    if (leftNode.serialized !== rightNode.serialized) {
      counters.nodesChanged += 1;
      nodeDiffs.push({ key, status: "changed", node: rightNode });
      return;
    }

    nodeDiffs.push({ key, status: "unchanged", node: rightNode });
  });

  const allEdgeKeys = new Set([...leftModel.edges, ...rightModel.edges]);
  allEdgeKeys.forEach((edgeKey) => {
    const inLeft = leftModel.edges.has(edgeKey);
    const inRight = rightModel.edges.has(edgeKey);

    if (!inLeft && inRight) {
      counters.edgesAdded += 1;
      edgeDiffs.push({ key: edgeKey, status: "added" });
      return;
    }

    if (inLeft && !inRight) {
      counters.edgesRemoved += 1;
      edgeDiffs.push({ key: edgeKey, status: "removed" });
      return;
    }

    edgeDiffs.push({ key: edgeKey, status: "unchanged" });
  });

  return { nodeDiffs, edgeDiffs, counters };
}

function getFlowStatusClass(status) {
  if (status === "added") {
    return "flowAdded";
  }
  if (status === "removed") {
    return "flowRemoved";
  }
  if (status === "changed") {
    return "flowChanged";
  }
  return "flowUnchanged";
}

function buildFlowDiffMermaid(diff) {
  const lines = [
    "flowchart TD",
    "classDef flowAdded fill:#d6f5e8,stroke:#2a9d8f,stroke-width:2px,color:#1b4332;",
    "classDef flowRemoved fill:#ffe2e7,stroke:#ef476f,stroke-width:2px,color:#7f1d1d;",
    "classDef flowChanged fill:#fff1d9,stroke:#f18f01,stroke-width:2px,color:#7c4a03;",
    "classDef flowUnchanged fill:#f4f1ea,stroke:#cbbba4,stroke-width:1px,color:#4b5563;",
    "linkStyle default stroke:#8c8c8c,stroke-width:1.6px;"
  ];

  const nodeIdByKey = new Map();

  diff.nodeDiffs.forEach((entry, index) => {
    const nodeId = `${sanitizeNodeId(entry.node.name)}_${index + 1}`;
    nodeIdByKey.set(entry.key, nodeId);

    lines.push(`${nodeId}[\"${escapeMermaidLabel(entry.node.label)}\"]`);
    lines.push(`class ${nodeId} ${getFlowStatusClass(entry.status)}`);
  });

  diff.edgeDiffs.forEach((edge) => {
    const split = edge.key.split("-->");
    if (split.length !== 2) {
      return;
    }

    const fromId = nodeIdByKey.get(split[0]);
    const toId = nodeIdByKey.get(split[1]);
    if (!fromId || !toId) {
      return;
    }

    if (edge.status === "added") {
      lines.push(`${fromId} ==> ${toId}`);
      return;
    }

    if (edge.status === "removed") {
      lines.push(`${fromId} -.-> ${toId}`);
      return;
    }

    lines.push(`${fromId} --> ${toId}`);
  });

  if (!diff.nodeDiffs.length) {
    return "flowchart TD\nA[Sem elementos de Flow mapeados]";
  }

  return lines.join("\n");
}

function renderFlowDiffSummary(counters) {
  return `
    <div class="flow-diff-summary">
      <span class="pill added">Nos adicionados: ${counters.nodesAdded}</span>
      <span class="pill removed">Nos removidos: ${counters.nodesRemoved}</span>
      <span class="pill changed">Nos alterados: ${counters.nodesChanged}</span>
      <span class="pill moved">Conectores adicionados: ${counters.edgesAdded}</span>
      <span class="pill moved">Conectores removidos: ${counters.edgesRemoved}</span>
    </div>
    <div class="flow-legend">
      <span><i class="dot added"></i> Adicionado no XML novo</span>
      <span><i class="dot removed"></i> Removido do XML novo</span>
      <span><i class="dot changed"></i> Mesmo no, com conteudo alterado</span>
      <span><i class="dot unchanged"></i> Sem mudanca relevante</span>
    </div>
  `;
}

function loadMermaid() {
  if (!window.mermaid) {
    throw new Error("Mermaid não está disponível");
  }

  window.mermaid.initialize({
    startOnLoad: false,
    theme: "default",
    flowchart: { curve: "basis" }
  });

  return window.mermaid;
}

function buildFlowMermaid(xmlText) {
  const doc = parseXml(xmlText);
  const model = buildFlowModel(doc);

  if (!model.nodesByKey.size) {
    return "graph TD\nA[Flow]";
  }

  const lines = ["graph TD"];

  const nodeIdByKey = new Map();
  Array.from(model.nodesByKey.values()).forEach((node, index) => {
    const nodeId = `${sanitizeNodeId(node.name)}_${index + 1}`;
    nodeIdByKey.set(node.key, nodeId);
    lines.push(`${nodeId}[\"${escapeMermaidLabel(node.label)}\"]`);
  });

  model.edges.forEach((edgeKey) => {
    const split = edgeKey.split("-->");
    if (split.length !== 2) {
      return;
    }

    const fromId = nodeIdByKey.get(split[0]);
    const toId = nodeIdByKey.get(split[1]);
    if (fromId && toId) {
      lines.push(`${fromId} --> ${toId}`);
    }
  });

  return lines.join("\n");
}

function sanitizeNodeId(value) {
  return value.replace(/[^a-zA-Z0-9_]/g, "_");
}

function escapeMermaidLabel(value) {
  return value.replace(/\\/g, "\\\\").replace(/\r?\n/g, " ").replace(/"/g, "\\\"");
}

async function renderFlowDiagram() {
  const leftSource = (ui.leftXml.value || "").trim();
  const rightSource = (ui.rightXml.value || "").trim();

  if (!leftSource && !rightSource) {
    renderEmpty(ui.flow, "Cole um XML de Flow para visualizar o diagrama.");
    setFlowControlsEnabled(false);
    return;
  }

  destroyAllCytoscapeInstances();

  const hasLeft = Boolean(leftSource);
  const hasRight = Boolean(rightSource);

  try {
    if (flowViewState.mode === "split" && hasLeft && hasRight) {
      const leftDoc = parseXml(leftSource);
      const rightDoc = parseXml(rightSource);

      if (!isFlowDocument(leftDoc) || !isFlowDocument(rightDoc)) {
        throw new Error("Os dois lados precisam ser XMLs de Flow para usar lado a lado.");
      }

      const leftElements = buildCytoscapeSingleElements(buildFlowModel(leftDoc));
      const rightElements = buildCytoscapeSingleElements(buildFlowModel(rightDoc));

      const summaryHtml = `<div class="flow-side-by-side-note">Modo lado a lado — arraste e role para zoom em cada painel independentemente.</div>`;
      ui.flow.innerHTML = `${summaryHtml}<div class="flow-split-grid">${buildFlowPaneHtml("left", "Antes")}${buildFlowPaneHtml("right", "Depois")}</div>`;

      flowViewState.activeViewerId = "left";
      setFlowControlsEnabled(true);
      mountCytoscape("cy-left", leftElements);
      mountCytoscape("cy-right", rightElements);
    } else if (hasLeft && hasRight) {
      const leftDoc = parseXml(leftSource);
      const rightDoc = parseXml(rightSource);

      let elements;
      let summaryHtml = "";

      if (isFlowDocument(leftDoc) && isFlowDocument(rightDoc)) {
        const leftModel = buildFlowModel(leftDoc);
        const rightModel = buildFlowModel(rightDoc);
        const diff = buildFlowDiff(leftModel, rightModel);
        summaryHtml = renderFlowDiffSummary(diff.counters);
        elements = buildCytoscapeElements(diff);
      } else {
        const source = isFlowDocument(rightDoc) ? rightSource : leftSource;
        elements = buildCytoscapeSingleElements(buildFlowModel(parseXml(source)));
      }

      ui.flow.innerHTML = `${summaryHtml}${buildFlowPaneHtml("main", "Diff visual")}`;
      flowViewState.activeViewerId = "main";
      setFlowControlsEnabled(true);
      mountCytoscape("cy-main", elements);
    } else {
      const source = rightSource || leftSource;
      const title = hasRight ? "Flow novo" : "Flow atual";
      const elements = buildCytoscapeSingleElements(buildFlowModel(parseXml(source)));

      ui.flow.innerHTML = buildFlowPaneHtml("main", title);
      flowViewState.activeViewerId = "main";
      setFlowControlsEnabled(true);
      mountCytoscape("cy-main", elements);
    }
  } catch (error) {
    destroyAllCytoscapeInstances();
    renderEmpty(ui.flow, `Não foi possível gerar o diagrama: ${error.message}`);
    setFlowControlsEnabled(false);
  }
}

function renderEmpty(container, message) {
  container.innerHTML = `<div class=\"empty-state\">${escapeHtml(message)}</div>`;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function fillPermissionSetSample() {
  ui.leftXml.value = `<PermissionSet xmlns=\"http://soap.sforce.com/2006/04/metadata\">\n  <classAccesses>\n    <apexClass>BooleanEvaluate</apexClass>\n    <enabled>true</enabled>\n  </classAccesses>\n  <classAccesses>\n    <apexClass>BooleanEvaluateTest</apexClass>\n    <enabled>true</enabled>\n  </classAccesses>\n</PermissionSet>`;
}

function fillFlowSample() {
  ui.rightXml.value = `<Flow xmlns=\"http://soap.sforce.com/2006/04/metadata\">\n  <recordLookups>\n    <name>BuscarConta</name>\n    <nextValueConnector>AtualizarConta</nextValueConnector>\n  </recordLookups>\n  <recordUpdates>\n    <name>AtualizarConta</name>\n  </recordUpdates>\n</Flow>`;
}

compareXml();
