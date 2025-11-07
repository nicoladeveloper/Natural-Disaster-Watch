const API_URL = "http://127.0.0.1:8000/eventos";
const INTERVALO_ATUALIZACAO_MS = 60000; // 60 segundos
let segundosRestantes = INTERVALO_ATUALIZACAO_MS / 1000; // 60


const map = L.map('map').setView([0, 0], 2);


const markers = L.markerClusterGroup({
    maxClusterRadius: 40 
});

// Satélite Realista (Esri World Imagery)
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, swisstopo, and the GIS User Community',
  maxZoom: 18,
  worldCopyJump: false 
}).addTo(map);


L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
    opacity: 0.7, 
    pane: 'overlayPane'
}).addTo(map);

map.addLayer(markers); 


let eventosExistentes = new Set(); 
let bounds = L.latLngBounds([]);


const categoriasPT = {
  Wildfires: "Queimadas",
  Volcanoes: "Vulcão",
  Storms: "Tempestade",
  Floods: "Enchente",
  Earthquakes: "Terremoto",
  Default: "Desastre Natural"
};

// NOVO: Funções de Estatísticas

function atualizarContador() {
    const timerElement = document.getElementById("stat-timer");
    
    segundosRestantes--;
    if (segundosRestantes < 0) {
        // O timer será resetado por 'atualizarPainelEstatisticas' após a chamada de API
        // Apenas para evitar números negativos antes da próxima API call
        segundosRestantes = 0; 
    }

    if (timerElement) {
        timerElement.textContent = `${segundosRestantes}s`;
    }
}

function atualizarPainelEstatisticas(eventos) {
    const totalElement = document.getElementById("stat-total");
    const topCatElement = document.getElementById("stat-top-cat");
    
    if (!totalElement || !topCatElement) return;

  
    totalElement.textContent = eventos.length;
    const contagemCategorias = {};
    let maxCount = 0;
    let topCategoria = "Nenhuma";

    eventos.forEach(ev => {
        const categoria = ev.categoria;
        contagemCategorias[categoria] = (contagemCategorias[categoria] || 0) + 1;

        if (contagemCategorias[categoria] > maxCount) {
            maxCount = contagemCategorias[categoria];
            topCategoria = categoriasPT[categoria] || categoriasPT.Default;
        }
    });

    topCatElement.textContent = topCategoria !== "Nenhuma" ? `${topCategoria} (${maxCount})` : "N/D";
    
    segundosRestantes = INTERVALO_ATUALIZACAO_MS / 1000;
}


function getAcoesPrevencao(categoria) {
    switch (categoria) {
        case "Wildfires": return `<p><strong>🔥 Ação de Prevenção (Fogo):</strong></p><ul><li>Evacue imediatamente se for instruído.</li><li>Feche portas e janelas.</li><li>Cubra chaminés e ventilações com telas não inflamáveis.</li></ul>`;
        case "Floods": return `<p><strong>💧 Ação de Prevenção (Enchente):</strong></p><ul><li>Dirija-se a um terreno mais elevado.</li><li>Nunca caminhe ou dirija através de águas em movimento.</li><li>Desligue a energia e o gás, se for seguro fazê-lo.</li></ul>`;
        case "Earthquakes": return `<p><strong>💥 Ação de Prevenção (Terremoto):</strong></p><ul><li>Agache, Cubra-se e Segure-se (Duck, Cover and Hold).</li><li>Fique longe de janelas e objetos que possam cair.</li><li>Se estiver ao ar livre, mova-se para uma área aberta.</li></ul>`;
        case "Storms": return `<p><strong>🌪️ Ação de Prevenção (Tempestade/Ciclone):</strong></p><ul><li>Fique dentro de casa, longe de janelas e portas.</li><li>Tenha suprimentos de emergência prontos (água, comida, rádio).</li><li>Siga as rotas de evacuação locais, se necessário.</li></ul>`;
        case "Volcanoes": return `<p><strong>🌋 Ação de Prevenção (Vulcão):</strong></p><ul><li>Use proteção respiratória (máscara ou pano úmido).</li><li>Proteja os olhos.</li><li>Evite áreas de vale onde as cinzas e lava podem fluir.</li></ul>`;
        default: return `<p><strong>✅ Ação de Prevenção (Geral):</strong></p><ul><li>Mantenha-se informado pelas autoridades locais.</li><li>Tenha um kit de emergência pronto.</li></ul>`;
    }
}


function adicionarEventoAoMapa(ev) {
    if (!ev.coordenadas || ev.coordenadas.length < 2) return;

    const [lon, lat] = ev.coordenadas;
    const categoria = ev.categoria; 
    const categoriaPT = categoriasPT[categoria] || categoriasPT.Default;
    const cor = "#ff0000"; 
    
    const acoesPrevencaoHTML = getAcoesPrevencao(categoria); 

    const area = L.circleMarker([lat, lon], {
        radius: 10,
        color: cor,
        fillColor: cor,
        fillOpacity: 0.5,
        weight: 1 
    });

    markers.addLayer(area); 
    bounds.extend([lat, lon]); 

    area.bindPopup(`
      <b>Categoria:</b> ${categoriaPT}<br>
      <b>Título:</b> ${ev.titulo}<br>
      <b>Data:</b> ${new Date(ev.data).toLocaleDateString()}<br>
      <a href="${ev.link}" target="_blank">Mais detalhes</a>
      <hr style="margin: 5px 0;">
      ${acoesPrevencaoHTML} 
    `);
}

async function carregarEventos() {
  try {
    const res = await fetch(API_URL); 
    const data = await res.json();
    const eventos = data.eventos.slice(0, 100); 

    bounds = L.latLngBounds([]);
    markers.clearLayers(); 
    eventosExistentes.clear();

    eventos.forEach(ev => {
      eventosExistentes.add(ev.titulo); 
      adicionarEventoAoMapa(ev);
    });
    
    atualizarPainelEstatisticas(eventos); 

    if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] }); 
    }

    console.log(`✅ ${eventos.length} eventos carregados`);
  } catch (error) {
    console.error("Erro ao carregar eventos iniciais:", error);
  }
}

// Função de busca por cidade ou país
const searchInput = document.getElementById("search");
const btnSearch = document.getElementById("btn-search");

btnSearch.addEventListener("click", async () => {
  const query = searchInput.value;
  if (!query) return;

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      map.setView([lat, lon], 6); 
    } else {
      alert("Local não encontrado!");
    }
  } catch (error) {
    console.error("Erro na busca de localização:", error);
    alert("Erro ao buscar localização.");
  }
});

async function verificarNovosEventos() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    const eventos = data.eventos;
    
    let novosEventosAdicionados = false; 

    const eventosAtivos = [];

    eventos.forEach(ev => {
        if (ev.coordenadas && ev.coordenadas.length >= 2) {
            // Adiciona todos os eventos para a contagem, mesmo os antigos
            eventosAtivos.push(ev); 
            
            if (!eventosExistentes.has(ev.titulo)) { 
                eventosExistentes.add(ev.titulo);
                novosEventosAdicionados = true;
    
                if (Notification.permission === "granted") {
                  const categoriaPT = categoriasPT[ev.categoria] || categoriasPT.Default;
                  new Notification("Novo desastre natural detectado!", {
                    body: `${categoriaPT} → ${ev.titulo}`,
                    icon: "https://cdn-icons-png.flaticon.com/512/854/854878.png"
                  });
                }
          
                adicionarEventoAoMapa(ev);
            }
        }
    });

    atualizarPainelEstatisticas(eventosAtivos); 

    if (novosEventosAdicionados && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] }); 
    }
  } catch (error) {
    console.error("Erro ao verificar novos eventos:", error);
  }
}

if ("Notification" in window) Notification.requestPermission();

setInterval(atualizarContador, 1000); 
setInterval(verificarNovosEventos, INTERVALO_ATUALIZACAO_MS); // Verifica a cada 60s


carregarEventos();
