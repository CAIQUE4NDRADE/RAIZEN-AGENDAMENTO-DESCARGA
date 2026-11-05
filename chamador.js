// =====================================================================
//  CHAMADOR — tela do gate para o celular: lista quem está no pátio e
//  chama o motorista no WhatsApp com um toque (mesma regra e mesma
//  mensagem do painel). Usa os dados e funções que o painel já carrega.
// =====================================================================
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const BAIAS = [209, 210, 211, 212, 213, 214];
  const PRODUTOS = [["TODOS", "Todos"], ["GASOLINA", "Gasolina"], ["BIODIESEL", "Biodiesel"], ["ANIDRO", "Anidro"], ["HIDRATADO", "Hidratado"], ["DIESEL", "Diesel S10"]];
  const NOME = { "ETANOL HIDRATADO": "Hidratado", "ETANOL ANIDRO": "Anidro", "BIODIESEL (B100)": "Biodiesel", "GASOLINA": "Gasolina", "DIESEL S10": "Diesel S10" };
  const CHAVE_CHAMADOS = "raizen_chamados_hoje";
  let filtro = "TODOS", aberto = false, itemBaia = null;

  // Quem já foi chamado hoje (fica só neste aparelho, para não chamar duas vezes sem querer)
  const hojeStr = () => new Date().toLocaleDateString("pt-BR");
  function lerChamados() {
    try { const o = JSON.parse(localStorage.getItem(CHAVE_CHAMADOS) || "{}"); return o.dia === hojeStr() ? o : { dia: hojeStr(), ids: {} }; }
    catch (e) { return { dia: hojeStr(), ids: {} }; }
  }
  function marcarChamado(id) {
    const o = lerChamados(); o.ids[id] = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    try { localStorage.setItem(CHAVE_CHAMADOS, JSON.stringify(o)); } catch (e) {}
  }

  // Mesma regra de status do painel
  function statusDe(item) {
    const t = (window.memoriaTanques || memoriaTanques).find((x) => x.produto === item.PRODUTO);
    const livre = t ? espacoOperador(t) : 0, vol = item.VOLUME || 0;
    if (item.STATUS_LOCAL === "AUSENTE") return ["aus", "Ausente"];
    if (item.STATUS_LOCAL === "TANQUE_CHEIO") return ["esp", "Bloqueado · tanque cheio"];
    if (item.PRECHECK === true) return ["pre", "Precheck"];
    if (!t || !t.ativo_tanque || livre <= 0) return ["esp", "Sem espaço no tanque"];
    if (vol > 0 && vol > livre) return ["vol", "Volume excede o espaço"];
    return ["ok", "Apto para descarga"];
  }
  function tempoDesde(entrada) {
    const m = String(entrada || "").match(/(\d{2})\/(\d{2})\/(\d{4}),?\s+(\d{2}):(\d{2})/);
    if (!m) return "";
    const min = Math.floor((Date.now() - new Date(+m[3], +m[2] - 1, +m[1], +m[4], +m[5])) / 60000);
    if (min < 0) return "";
    return min >= 60 ? `${Math.floor(min / 60)}h${String(min % 60).padStart(2, "0")}` : `${min} min`;
  }
  function jornada(j) {
    if (!j) return "";
    if (j === "24 HORAS") return "Jornada livre";
    if (j.startsWith("SEM JORNADA")) return "<b class='ch-alerta'>Sem jornada</b>";
    const [h, mm] = j.split(":"); const lim = new Date(); lim.setHours(+h, +mm, 0);
    return new Date() > lim ? `<b class='ch-alerta'>Jornada expirou ${esc(j)}</b>` : `Jornada até ${esc(j)}`;
  }

  // ---------- Estrutura ----------
  const raiz = document.createElement("div");
  raiz.id = "chamador"; raiz.hidden = true;
  raiz.setAttribute("role", "dialog"); raiz.setAttribute("aria-label", "Chamador de motoristas");
  raiz.innerHTML = `
    <header class="ch-topo">
      <div class="ch-tit"><i class="fa-solid fa-mobile-screen-button" aria-hidden="true"></i> Chamador
        <small id="ch-resumo"></small></div>
      <div class="ch-topo-acoes">
        <button type="button" id="ch-atualizar" aria-label="Atualizar"><i class="fa-solid fa-rotate" aria-hidden="true"></i></button>
        <button type="button" id="ch-fechar" aria-label="Voltar ao painel completo"><i class="fa-solid fa-table-columns" aria-hidden="true"></i> Painel</button>
      </div>
    </header>
    <div class="ch-filtros" role="group" aria-label="Filtrar por produto">${PRODUTOS.map(([k, n]) =>
      `<button type="button" data-f="${k}" aria-pressed="${k === "TODOS"}">${n}</button>`).join("")}</div>
    <div class="ch-lista" id="ch-lista"></div>
    <div class="ch-baias" id="ch-baias" hidden role="dialog" aria-label="Escolher baia">
      <div class="ch-baias-caixa">
        <div class="ch-baias-tit">Chamar <b id="ch-baias-placa"></b><small>Escolha a baia</small></div>
        <div class="ch-baias-grade">${BAIAS.map((b) => `<button type="button" data-baia="${b}">${b}</button>`).join("")}</div>
        <button type="button" class="ch-cancelar" id="ch-baias-cancelar">Cancelar</button>
      </div>
    </div>`;
  document.body.appendChild(raiz);

  const ehCelular = () => (window.screen && Math.min(screen.width, screen.height) < 820) && matchMedia("(pointer: coarse)").matches;
  const vistaCelular = () => document.documentElement.classList.contains("vista-chamador");
  const guardarVista = (v) => { try { localStorage.setItem("raizen_vista_cel", v); } catch (e) {} };

  function abrir() {
    // No celular com o painel completo aberto (tamanho de computador), recarrega no tamanho do celular
    if (ehCelular() && !vistaCelular()) { guardarVista("chamador"); location.reload(); return; }
    aberto = true; raiz.hidden = false; document.body.classList.add("ch-aberto");
    render(); raiz.scrollTop = 0;
  }
  function fechar() {
    // No celular, o painel completo precisa do tamanho de computador: recarrega nele
    if (ehCelular() && vistaCelular()) { guardarVista("painel"); location.reload(); return; }
    aberto = false; raiz.hidden = true; document.body.classList.remove("ch-aberto");
  }

  // ---------- Lista ----------
  function cartao(item) {
    const [cls, txt] = statusDe(item);
    const podeChamar = (cls === "ok") && item.TELEFONE;
    const chamado = lerChamados().ids[item.ID];
    const ag = item.AGENDAMENTO ? new Date(item.AGENDAMENTO).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";
    return `
      <article class="ch-card ch-${cls}${chamado ? " ch-chamado" : ""}" data-id="${esc(item.ID)}">
        <div class="ch-linha1">
          <span class="ch-placa">${esc(item.PLACA)}</span>
          <span class="ch-prod" style="background:${corProduto(item.PRODUTO)}">${esc(NOME[item.PRODUTO] || item.PRODUTO)}</span>
        </div>
        <div class="ch-info">
          <span class="ch-st">${esc(txt)}</span>
          ${item.VOLUME ? `<span>${esc(fmtL(item.VOLUME))}</span>` : ""}
          ${ag ? `<span>Agend. ${esc(ag)}</span>` : ""}
          ${tempoDesde(item.ENTRADA) ? `<span>No pátio há ${esc(tempoDesde(item.ENTRADA))}</span>` : ""}
        </div>
        <div class="ch-info">${jornada(item.JORNADA)}${item.TELEFONE ? ` · <a href="tel:+55${esc(String(item.TELEFONE).replace(/\D/g, ""))}">${esc(item.TELEFONE)}</a>` : " · <i>sem telefone</i>"}</div>
        ${chamado ? `<div class="ch-ja"><i class="fa-solid fa-check-double" aria-hidden="true"></i> Chamado às ${esc(chamado)} neste aparelho</div>` : ""}
        <div class="ch-botoes">
          <button type="button" class="ch-chamar" data-a="chamar" ${podeChamar ? "" : "disabled"} aria-label="Chamar ${esc(item.PLACA)} no WhatsApp">
            <i class="fa-brands fa-whatsapp" aria-hidden="true"></i> ${chamado ? "Chamar de novo" : "Chamar"}</button>
          <button type="button" class="ch-aus${cls === "aus" ? " ativo" : ""}" data-a="aus" aria-pressed="${cls === "aus"}">
            <i class="fa-solid fa-user-slash" aria-hidden="true"></i> ${cls === "aus" ? "Voltou" : "Ausente"}</button>
        </div>
      </article>`;
  }
  function render() {
    if (!aberto) return;
    const fila = (typeof memoriaFila !== "undefined" ? memoriaFila : []).filter((i) => {
      if (filtro === "TODOS") return true;
      const p = (i.PRODUTO || "").toUpperCase();
      if (filtro === "DIESEL") return p.includes("DIESEL S10");
      if (filtro === "BIODIESEL") return p.includes("BIODIESEL");
      return p.includes(filtro);
    }).sort((a, b) => (a.AGENDAMENTO ? new Date(a.AGENDAMENTO) : 8.64e15) - (b.AGENDAMENTO ? new Date(b.AGENDAMENTO) : 8.64e15));
    const grupos = { ok: [], outros: [], aus: [] };
    fila.forEach((i) => { const c = statusDe(i)[0]; (c === "ok" ? grupos.ok : c === "aus" ? grupos.aus : grupos.outros).push(i); });
    $("ch-resumo").textContent = `${grupos.ok.length} para chamar · ${fila.length} no pátio`;
    const bloco = (tit, ico, lista, vazio) => `<section class="ch-grupo"><h2><i class="fa-solid ${ico}" aria-hidden="true"></i> ${tit} <span>${lista.length}</span></h2>
      ${lista.length ? lista.map(cartao).join("") : `<p class="ch-vazio">${vazio}</p>`}</section>`;
    $("ch-lista").innerHTML =
      bloco("Aptos para chamar", "fa-bullhorn", grupos.ok, "Ninguém apto agora.") +
      (grupos.outros.length ? bloco("Aguardando espaço / bloqueados", "fa-ban", grupos.outros, "") : "") +
      (grupos.aus.length ? bloco("Ausentes", "fa-user-slash", grupos.aus, "") : "");
  }

  // ---------- Ações ----------
  raiz.querySelector(".ch-filtros").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-f]"); if (!b) return;
    filtro = b.dataset.f;
    raiz.querySelectorAll(".ch-filtros button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    render();
  });
  $("ch-lista").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-a]"); if (!b || b.disabled) return;
    const id = Number(b.closest(".ch-card").dataset.id);
    const item = memoriaFila.find((i) => i.ID === id); if (!item) return;
    if (b.dataset.a === "aus") { marcarAusente(id, item.PLACA); return; }
    itemBaia = item;
    $("ch-baias-placa").textContent = item.PLACA;
    $("ch-baias").hidden = false;
    $("ch-baias").querySelector("button[data-baia]").focus();
  });
  $("ch-baias").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-baia]");
    if (b && itemBaia) {
      chamarWhatsApp(itemBaia.TELEFONE, itemBaia.PLACA, b.dataset.baia);   // mesma mensagem do painel
      marcarChamado(itemBaia.ID);
      itemBaia = null; $("ch-baias").hidden = true; render();
    } else if (e.target === $("ch-baias") || e.target.closest("#ch-baias-cancelar")) {
      itemBaia = null; $("ch-baias").hidden = true;
    }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("ch-baias").hidden) { $("ch-baias").hidden = true; itemBaia = null; } });
  $("ch-atualizar").addEventListener("click", () => carregarDados());
  $("ch-fechar").addEventListener("click", fechar);

  // Atualiza junto com o painel (a cada 30 s e depois de cada ação)
  const _renderTabela = window.renderTabela || renderTabela;
  renderTabela = function () { const r = _renderTabela.apply(this, arguments); render(); return r; };

  // No celular, abre sozinho quando o gate entra
  let abriuSozinho = false;
  setInterval(() => {
    if (abriuSozinho || aberto) return;
    const gate = document.getElementById("modulo-operador-full");
    if (gate && getComputedStyle(gate).display !== "none" && vistaCelular()) { abriuSozinho = true; abrir(); }
  }, 700);

  window.Chamador = { abrir, fechar };
})();
