// Utility: parse TodoList text into structured sections
// Exports: parseTodoList(todoString) -> Array<{ title: string, tasks: string[] }>

function parseTodoList(todoString) {
  const text = (todoString || '').replace(/\r/g, '').trim();
  const sections = [];
  if (!text) return sections;

  // Try to capture clearly labeled I./II./III. sections first
  const secRegex = /I\.\s*([\s\S]*?)\n\s*II\.\s*([\s\S]*?)\n\s*III\.\s*([\s\S]*)/im;
  const m = text.match(secRegex);

  const bulletRegex = /^\s*[-*]\s*\[?\s*[xX\s]?\]?\s*(.+)$/; // captures '- [ ] task', '- [] task', '- task', '* task'

  const extractTasks = (block) => {
    const tasks = [];
    const lines = (block || '').split('\n');
    for (let ln of lines) {
      ln = ln.trim();
      if (!ln) continue;
      const b = ln.match(bulletRegex);
      if (b && b[1]) {
        tasks.push(b[1].trim());
      }
    }
    return tasks;
  };

  if (m) {
    sections.push({ title: 'PHÂN TÍCH YÊU CẦU', tasks: extractTasks(m[1]) });
    sections.push({ title: 'TIÊU CHÍ CHẤP NHẬN', tasks: extractTasks(m[2]) });
    sections.push({ title: 'CÔNG VIỆC CỤ THỂ CHO BA', tasks: extractTasks(m[3]) });
    return sections;
  }

  // If labeled headers not found, try to find Vietnamese header phrases
  const headerNames = [
    { key: 'PHÂN TÍCH YÊU CẦU', re: /PHÂN\s*TÍCH\s*YÊU\s*CẦU/i },
    { key: 'TIÊU CHÍ CHẤP NHẬN', re: /TIÊU\s*CHÍ\s*CHẤP\s*NHẬN/i },
    { key: 'CÔNG VIỆC CỤ THỂ CHO BA', re: /CÔNG\s*VIỆC\s*CỤ\s*THỂ/i }
  ];

  // Locate header indices
  const indices = headerNames.map(h => {
    const idx = text.search(h.re);
    return { title: h.key, idx };
  });

  const found = indices.filter(i => i.idx >= 0);
  if (found.length >= 3) {
    // sort by index
    found.sort((a, b) => a.idx - b.idx);
    for (let i = 0; i < found.length; i++) {
      const start = found[i].idx;
      const end = i + 1 < found.length ? found[i + 1].idx : text.length;
      const block = text.substring(start, end).replace(/^[^\n]*\n/, ''); // remove header line
      sections.push({ title: found[i].title, tasks: extractTasks(block) });
    }
    return sections;
  }

  // Last resort: no headers — try to extract bullets and split into 3 buckets roughly
  const allBullets = [];
  for (const ln of text.split('\n')) {
    const t = ln.trim();
    if (!t) continue;
    const b = t.match(bulletRegex);
    if (b && b[1]) allBullets.push(b[1].trim());
  }

  if (allBullets.length > 0) {
    const per = Math.ceil(allBullets.length / 3) || allBullets.length;
    sections.push({ title: 'PHÂN TÍCH YÊU CẦU', tasks: allBullets.slice(0, per) });
    sections.push({ title: 'TIÊU CHÍ CHẤP NHẬN', tasks: allBullets.slice(per, per * 2) });
    sections.push({ title: 'CÔNG VIỆC CỤ THỂ CHO BA', tasks: allBullets.slice(per * 2) });
    return sections;
  }

  // If nothing found, return empty sections so UI still shows headers
  return [
    { title: 'PHÂN TÍCH YÊU CẦU', tasks: [] },
    { title: 'TIÊU CHÍ CHẤP NHẬN', tasks: [] },
    { title: 'CÔNG VIỆC CỤ THỂ CHO BA', tasks: [] }
  ];
}

module.exports = parseTodoList;
