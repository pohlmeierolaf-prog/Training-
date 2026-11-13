// Lokaler Ersatz für window.claude.use("db"/"user"), damit die Seite außerhalb von claude.ai läuft.
// Speichert in localStorage des Browsers. Nur für Entwicklung, nicht in die Produktivdatei einbauen.
(function () {
  const listeners = {};
  const key = (p) => "mockdb:" + p;
  const load = (p) => { try { return JSON.parse(localStorage.getItem(key(p)) || "{}"); } catch (e) { return {}; } };
  const save = (p, m) => localStorage.setItem(key(p), JSON.stringify(m));
  const notify = (p) => (listeners[p] || []).forEach(f => f());
  function snapshot(p, field, dir, lim) {
    const m = load(p);
    let rows = Object.keys(m).map(id => ({ id, v: m[id] }));
    if (field) rows.sort((a, b) => String(a.v[field]).localeCompare(String(b.v[field])) * (dir === "desc" ? -1 : 1));
    if (lim) rows = rows.slice(0, lim);
    return { docs: rows.map(r => ({ id: r.id, data: () => JSON.parse(JSON.stringify(r.v)) })) };
  }
  const db = {
    collection(p) {
      return {
        doc(id) {
          return {
            async set(data) { const m = load(p); m[id] = JSON.parse(JSON.stringify(data)); save(p, m); notify(p); },
            async update(part) { const m = load(p); m[id] = Object.assign(m[id] || {}, part); save(p, m); notify(p); },
            async get() { const m = load(p); return { exists: id in m, id, data: () => m[id] }; },
            async delete() { const m = load(p); delete m[id]; save(p, m); notify(p); }
          };
        },
        orderBy(field, dir) {
          return { limit(lim) { return { onSnapshot(cb) {
            const run = () => cb(snapshot(p, field, dir, lim));
            (listeners[p] = listeners[p] || []).push(run); setTimeout(run, 50); return () => {};
          } }; } };
        }
      };
    }
  };
  window.claude = { async use(name) {
    if (name === "db") return db;
    if (name === "user") return { async id() { return "local-user"; } };
    return null;
  } };
  // Hilfsfunktion: Beispieldaten laden  ->  window.mockImport(Array aus data/sessions-export.json)
  window.mockImport = function (docs) {
    const p = "data/users/local-user"; const m = {};
    docs.forEach(d => { m[d.id] = { id: d.id, date: d.date, day: d.day, entries: d.entries, savedAt: d.savedAt }; });
    save(p, m); notify(p);
  };
})();
