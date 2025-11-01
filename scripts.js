/* scripts.js
   Interaktiv logikk for Databruk.no
   - Bytt ut affiliate-lenkene i `affiliateLinks` med dine egne sporings-URLer.
   - Legg inn Google AdSense/Ad Manager-kode i index.html der det står "Put your ads here".
*/

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();

  // Simulerte tilbud (legg til / oppdater nok data fra din kilde)
  const offers = [
    {id:1, operator:'Telenor', plan:'Telenor Fri 50 GB', gb:50, monthly:399, perks:'Fri tale og SMS', affiliate:'#AFF_TELENOR_50'},
    {id:2, operator:'Telia', plan:'Telia 30 GB', gb:30, monthly:299, perks:'Roaming EU inkludert', affiliate:'#AFF_TELIA_30'},
    {id:3, operator:'Talkmore', plan:'Talkmore 25 GB', gb:25, monthly:179, perks:'Rabatt ved eFaktura', affiliate:'#AFF_TALKMORE_25'},
    {id:4, operator:'ice', plan:'ice Fri 100 GB', gb:100, monthly:499, perks:'Ingen binding', affiliate:'#AFF_ICE_100'},
    {id:5, operator:'OneCall', plan:'OneCall 10 GB', gb:10, monthly:129, perks:'Billig for lett bruk', affiliate:'#AFF_ONECALL_10'},
    {id:6, operator:'Chilimobil', plan:'Chili 5 GB', gb:5, monthly:69, perks:'Lav pris, ingen binding', affiliate:'#AFF_CHILI_5'},
    // flere kan legges til...
  ];

  // Placeholder-objekt: erstatt med ekte affiliate-lenker
  const affiliateLinks = {
    AFF_TELENOR_50: "https://example.com/aff/telenor50",
    AFF_TELIA_30: "https://example.com/aff/telia30",
    AFF_TALKMORE_25: "https://example.com/aff/talkmore25",
    AFF_ICE_100: "https://example.com/aff/ice100",
    AFF_ONECALL_10: "https://example.com/aff/onecall10",
    AFF_CHILI_5: "https://example.com/aff/chili5"
  };

  // App state
  let state = {
    offers,
    selected: new Set()
  };

  // Utilities
  function pricePerGb(offer){
    // Unngå deling på 0
    return (offer.monthly / Math.max(offer.gb, 0.0001));
  }

  // Render kort
  function renderOffers(list){
    const wrapper = document.getElementById('results');
    wrapper.innerHTML = '';
    if(list.length === 0){
      wrapper.innerHTML = '<p>Ingen treff. Prøv andre filter eller øk GB-intervallet.</p>';
      return;
    }
    for(const o of list){
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <div class="logo-operator" aria-hidden="true">${o.operator[0]}</div>
        <div class="info">
          <h3>${o.plan}</h3>
          <p class="muted">${o.operator} • ${o.perks}</p>
          <div class="flex" style="margin-top:8px;">
            <span class="badge">${o.gb} GB</span>
            <span class="badge">Binding: Nei</span>
            <label class="checkbox" style="margin-left:auto;">
              <input type="checkbox" data-id="${o.id}" class="selectOffer" ${state.selected.has(o.id) ? 'checked' : ''}/>
              Velg
            </label>
          </div>
        </div>
        <div class="price">
          <div class="monthly">${o.monthly} kr / mnd</div>
          <div class="pergb">${pricePerGb(o).toFixed(2)} kr per GB</div>
          <div class="actions">
            <a class="btn" target="_blank" rel="noopener noreferrer" href="${resolveAffiliate(o.affiliate)}">Gå til tilbud</a>
            <button class="btn ghost details" data-id="${o.id}">Detaljer</button>
          </div>
        </div>
      `;
      wrapper.appendChild(card);
    }
    // Attach event listeners for checkboxes & details
    document.querySelectorAll('.selectOffer').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const id = Number(e.target.dataset.id);
        if(e.target.checked) state.selected.add(id);
        else state.selected.delete(id);
        updateCompareBar();
      });
    });
    document.querySelectorAll('.details').forEach(btn => {
      btn.addEventListener('click', (e)=>{
        const id = Number(e.target.dataset.id);
        const o = offers.find(x=>x.id===id);
        alert(`${o.plan}\nOperatør: ${o.operator}\nGB: ${o.gb}\nPris: ${o.monthly} kr/mnd\nFordeler: ${o.perks}`);
      });
    });
  }

  function resolveAffiliate(affiliateTag){
    // Hvis format er '#AFF_NAME' nøste ut nøkkelen
    if(!affiliateTag) return '#';
    const key = affiliateTag.replace(/^#/?,'').replace(/^AFF_/,'AFF_');
    // Om vi lagret uten "AFF_" prefix ev. håndteringsregler
    if(affiliateLinks[key]) return affiliateLinks[key];
    // Fallback: return raw
    return affiliateTag.startsWith('#') ? '#' : affiliateTag;
  }

  // Filtrering og sortering
  function applyFilters(){
    let minGB = Number(document.getElementById('minGB').value) || 0;
    let maxGB = Number(document.getElementById('maxGB').value) || 99999;
    const operator = document.getElementById('operatorFilter').value;
    const sortBy = document.getElementById('sortBy').value;

    let list = offers.filter(o => o.gb >= minGB && o.gb <= maxGB);
    if(operator !== 'all') list = list.filter(o => o.operator === operator);

    if(sortBy === 'pricePerGb'){
      list.sort((a,b) => pricePerGb(a) - pricePerGb(b));
    } else if(sortBy === 'monthlyPrice'){
      list.sort((a,b) => a.monthly - b.monthly);
    } else if(sortBy === 'gb'){
      list.sort((a,b) => b.gb - a.gb);
    }
    renderOffers(list);
  }

  // Compare bar logic
  function updateCompareBar(){
    const bar = document.getElementById('compareBar');
    const count = state.selected.size;
    document.getElementById('selectedCount').textContent = `${count} valgt`;
    if(count > 0) bar.hidden = false;
    else bar.hidden = true;
  }

  // Sammenlign modal
  function openCompareModal(){
    const ids = Array.from(state.selected);
    if(ids.length < 2){
      alert("Velg minst 2 tilbud for å sammenligne.");
      return;
    }
    const chosen = offers.filter(o => ids.includes(o.id));
    const wrapper = document.getElementById('compareTableWrapper');
    let html = `<table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th style="text-align:left;padding:10px;border-bottom:1px solid #eee">Plan</th>
          <th style="padding:10px;border-bottom:1px solid #eee">Operatør</th>
          <th style="padding:10px;border-bottom:1px solid #eee">GB</th>
          <th style="padding:10px;border-bottom:1px solid #eee">Mnd</th>
          <th style="padding:10px;border-bottom:1px solid #eee">kr/GB</th>
          <th style="padding:10px;border-bottom:1px solid #eee">Link</th>
        </tr>
      </thead><tbody>`;
    for(const o of chosen){
      html += `<tr>
        <td style="padding:10px;border-bottom:1px solid #f3f3f3">${o.plan}</td>
        <td style="padding:10px;border-bottom:1px solid #f3f3f3">${o.operator}</td>
        <td style="padding:10px;border-bottom:1px solid #f3f3f3">${o.gb} GB</td>
        <td style="padding:10px;border-bottom:1px solid #f3f3f3">${o.monthly} kr</td>
        <td style="padding:10px;border-bottom:1px solid #f3f3f3">${pricePerGb(o).toFixed(2)} kr</td>
        <td style="padding:10px;border-bottom:1px solid #f3f3f3"><a class="btn" target="_blank" rel="noopener noreferrer" href="${resolveAffiliate(o.affiliate)}">Gå til tilbud</a></td>
      </tr>`;
    }
    html += '</tbody></table>';
    wrapper.innerHTML = html;
    const modal = document.getElementById('compareModal');
    modal.setAttribute('aria-hidden','false');
    modal.style.display = 'flex';
  }

  // Event bindings
  document.getElementById('applyFilters').addEventListener('click', applyFilters);
  document.getElementById('openCompareModal').addEventListener('click', openCompareModal);
  document.getElementById('clearSelection').addEventListener('click', ()=>{
    state.selected.clear();
    updateCompareBar();
    applyFilters();
  });

  document.getElementById('closeCompare').addEventListener('click', ()=>{
    const modal = document.getElementById('compareModal');
    modal.setAttribute('aria-hidden','true');
    modal.style.display = 'none';
  });

  // initial render
  applyFilters();

  // Small UX: open filters toggler for mobile
  document.getElementById('open-filters').addEventListener('click', ()=>{
    window.scrollTo({top:0,behavior:'smooth'});
    // focus first control
    document.getElementById('minGB').focus();
  });

  // Accessibility: keyboard close modal
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape'){
      const modal = document.getElementById('compareModal');
      if(modal.getAttribute('aria-hidden') === 'false'){
        modal.setAttribute('aria-hidden','true');
        modal.style.display = 'none';
      }
    }
  });
});

