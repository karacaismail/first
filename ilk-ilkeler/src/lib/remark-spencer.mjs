// Çeviri gövdesindeki özel işaretleri HTML'e çevirir:
//   {{görünen|KEY}}  → <button class="term" data-term="KEY">görünen</button>
//   ⟦166⟧            → <a class="pg" id="sayfa-166">166</a>
//   paragraf başı "§ 12. " → <a class="sec" id="paragraf-12">§ 12</a>
const TERM = /\{\{([^{}|]+)\|([^{}|]+)\}\}/g;
const PAGE = /⟦\s*(\d+)\s*⟧/g;
const SEC = /^§\s*(\d+[a-z]?)\.\s*/;

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function splitInline(text) {
  // Metni düz metin ve html düğümlerine böler.
  const nodes = [];
  const re = new RegExp(`${TERM.source}|${PAGE.source}`, 'g');
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push({ type: 'text', value: text.slice(last, m.index) });
    if (m[1] !== undefined) {
      const surface = m[1].trim();
      const key = m[2].trim();
      nodes.push({
        type: 'html',
        value: `<button type="button" class="term" data-term="${esc(key)}" aria-expanded="false">${esc(surface)}</button>`,
      });
    } else {
      const n = m[3];
      nodes.push({
        type: 'html',
        value: `<a class="pg" id="sayfa-${n}" href="#sayfa-${n}" title="Özgün baskıda sayfa ${n}"><span class="sr">Özgün sayfa </span>${n}</a>`,
      });
    }
    last = re.lastIndex;
  }
  if (last < text.length) nodes.push({ type: 'text', value: text.slice(last) });
  return nodes;
}

function walk(node, parent, index) {
  if (node.type === 'text' && parent && parent.type !== 'code' && parent.type !== 'inlineCode') {
    const parts = splitInline(node.value);
    if (parts.length !== 1 || parts[0].type !== 'text') {
      parent.children.splice(index, 1, ...parts);
      return parts.length;
    }
    return 1;
  }
  if (node.children) {
    for (let i = 0; i < node.children.length; ) {
      i += walk(node.children[i], node, i) || 1;
    }
  }
  return 1;
}

export function remarkSpencer() {
  return (tree, file) => {
    const sections = [];
    // § kesim başları
    for (const p of tree.children) {
      if (p.type !== 'paragraph' || !p.children?.length) continue;
      const first = p.children[0];
      if (first.type !== 'text') continue;
      const m = SEC.exec(first.value);
      if (!m) continue;
      const id = m[1];
      sections.push(id);
      first.value = first.value.slice(m[0].length);
      p.children.unshift({
        type: 'html',
        value: `<a class="sec" id="paragraf-${id}" href="#paragraf-${id}" aria-label="Kesim ${id}">§ ${id}</a> `,
      });
      p.data = p.data || {};
      p.data.hProperties = { ...(p.data.hProperties || {}), className: ['sec-start'] };
    }
    walk(tree, null, 0);
    if (file && file.data) {
      file.data.astro = file.data.astro || {};
      file.data.astro.frontmatter = file.data.astro.frontmatter || {};
      file.data.astro.frontmatter.sectionIds = sections;
    }
  };
}
