// Escolha de tema (escuro / claro). Fica salva neste aparelho e vale para os sites da BPA.
(function () {
  var CHAVE = "tema_bpa";
  function atual() { return document.documentElement.getAttribute("data-tema") === "claro" ? "claro" : "escuro"; }
  function aplicar(t) {
    document.documentElement.setAttribute("data-tema", t);
    try { localStorage.setItem(CHAVE, t); } catch (e) {}
    var escuro = document.getElementById("css-escuro");
    if (escuro) escuro.disabled = (t === "claro");
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "claro" ? "#0f5f33" : "#082a18");
    document.querySelectorAll(".btn-tema").forEach(function (b) {
      var claro = t === "claro";
      b.setAttribute("aria-pressed", String(claro));
      b.setAttribute("aria-label", claro ? "Usar tema escuro" : "Usar tema claro");
      b.title = claro ? "Usar tema escuro" : "Usar tema claro";
      b.innerHTML = claro ? '<span aria-hidden="true">🌙</span> Escuro' : '<span aria-hidden="true">☀️</span> Claro';
    });
  }
  function iniciar() {
    var b = document.createElement("button");
    b.type = "button"; b.className = "btn-tema";
    b.addEventListener("click", function () { aplicar(atual() === "claro" ? "escuro" : "claro"); });
    var dir = document.getElementById("tm-top-dir");          // painel / tela pública
    if (dir) dir.insertBefore(b, dir.firstChild);
    else { var h = document.querySelector("header"); if (h) { b.classList.add("btn-tema-topo"); h.appendChild(b); } }  // motorista
    aplicar(atual());
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
  window.TemaBPA = { aplicar: aplicar, atual: atual };
})();
