/* =========================================================
   Lecția 7-8: CRUD cu colecții de obiecte + Local Storage
   Colecția de produse este un ARRAY de OBIECTE:
   { id, nume, categorie, pret, cantitate }
   ========================================================= */

const STORAGE_KEY = "produse";

// ----- Referințe DOM -----
const form = document.getElementById("product-form");
const idInput = document.getElementById("product-id");
const numeInput = document.getElementById("nume");
const categorieInput = document.getElementById("categorie");
const pretInput = document.getElementById("pret");
const cantitateInput = document.getElementById("cantitate");

const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");

const productList = document.getElementById("product-list");
const emptyMessage = document.getElementById("empty-message");
const totalCount = document.getElementById("total-count");
const searchInput = document.getElementById("search");
const clearAllBtn = document.getElementById("clear-all-btn");

// ----- CREATE / READ: citire și scriere în Local Storage -----

// READ: ia colecția din Local Storage (sau array gol dacă nu există)
function getProduse() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// scrie colecția înapoi în Local Storage (JSON.stringify -> text)
function salveazaProduse(produse) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(produse));
}

// generează un id unic simplu (timestamp)
function genereazaId() {
  return Date.now().toString();
}

// ----- CREATE: adaugă un produs nou în colecție -----
function adaugaProdus(produs) {
  const produse = getProduse();
  produs.id = genereazaId();
  produse.push(produs);
  salveazaProduse(produse);
}

// ----- UPDATE: modifică un produs existent, identificat după id -----
function actualizeazaProdus(id, dateNoi) {
  const produse = getProduse();
  const index = produse.findIndex(p => p.id === id);
  if (index !== -1) {
    produse[index] = { ...produse[index], ...dateNoi };
    salveazaProduse(produse);
  }
}

// ----- DELETE: elimină un produs din colecție -----
function stergeProdus(id) {
  let produse = getProduse();
  produse = produse.filter(p => p.id !== id);
  salveazaProduse(produse);
}

// ----- RENDER: afișează colecția în tabel -----
function afiseazaProduse(filtru = "") {
  const produse = getProduse();

  const filtrate = produse.filter(p => {
    const text = (p.nume + " " + p.categorie).toLowerCase();
    return text.includes(filtru.toLowerCase());
  });

  productList.innerHTML = "";

  if (produse.length === 0) {
    emptyMessage.classList.remove("hidden");
  } else {
    emptyMessage.classList.add("hidden");
  }

  filtrate.forEach(produs => {
    const tr = document.createElement("tr");

    const stocClass = produs.cantitate <= 5 ? "low-stock" : "";

    tr.innerHTML = `
      <td>${escapeHtml(produs.nume)}</td>
      <td>${escapeHtml(produs.categorie)}</td>
      <td>${Number(produs.pret).toFixed(2)} lei</td>
      <td class="${stocClass}">${produs.cantitate}</td>
      <td class="row-actions">
        <button class="edit-btn" data-id="${produs.id}">✏️ Editează</button>
        <button class="delete-btn" data-id="${produs.id}">🗑️ Șterge</button>
      </td>
    `;

    productList.appendChild(tr);
  });

  totalCount.textContent = `${produse.length} produs${produse.length === 1 ? "" : "e"}`;
}

// evită probleme de securitate/afișare la inserarea textului în HTML
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ----- Gestionare formular: adăugare SAU editare -----
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const produs = {
    nume: numeInput.value.trim(),
    categorie: categorieInput.value.trim(),
    pret: parseFloat(pretInput.value),
    cantitate: parseInt(cantitateInput.value, 10)
  };

  if (!produs.nume || !produs.categorie || isNaN(produs.pret) || isNaN(produs.cantitate)) {
    alert("Completează toate câmpurile corect.");
    return;
  }

  const idCurent = idInput.value;

  if (idCurent) {
    // suntem în modul EDITARE (UPDATE)
    actualizeazaProdus(idCurent, produs);
  } else {
    // adăugare produs nou (CREATE)
    adaugaProdus(produs);
  }

  resetForm();
  afiseazaProduse(searchInput.value);
});

// ----- Click pe butoane Editează / Șterge (delegare de evenimente) -----
productList.addEventListener("click", function (e) {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains("delete-btn")) {
    if (confirm("Sigur vrei să ștergi acest produs?")) {
      stergeProdus(id);
      afiseazaProduse(searchInput.value);
    }
  }

  if (e.target.classList.contains("edit-btn")) {
    intraInModEditare(id);
  }
});

// completează formularul cu datele produsului pentru editare
function intraInModEditare(id) {
  const produse = getProduse();
  const produs = produse.find(p => p.id === id);
  if (!produs) return;

  idInput.value = produs.id;
  numeInput.value = produs.nume;
  categorieInput.value = produs.categorie;
  pretInput.value = produs.pret;
  cantitateInput.value = produs.cantitate;

  formTitle.textContent = "Editează produs";
  submitBtn.textContent = "Salvează modificările";
  cancelBtn.classList.remove("hidden");

  numeInput.focus();
}

// revine la modul "adăugare produs nou"
function resetForm() {
  form.reset();
  idInput.value = "";
  formTitle.textContent = "Adaugă produs nou";
  submitBtn.textContent = "Adaugă produs";
  cancelBtn.classList.add("hidden");
}

cancelBtn.addEventListener("click", resetForm);

// ----- Căutare live -----
searchInput.addEventListener("input", function () {
  afiseazaProduse(searchInput.value);
});

// ----- Șterge toată colecția -----
clearAllBtn.addEventListener("click", function () {
  if (confirm("Sigur vrei să ștergi TOATE produsele? Această acțiune nu poate fi anulată.")) {
    salveazaProduse([]);
    afiseazaProduse(searchInput.value);
  }
});

// ----- Pornire aplicație -----
afiseazaProduse();
