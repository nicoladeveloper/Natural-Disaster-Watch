💻 Estrutura da API (Backend - main.py)O backend é responsável pela gestão e entrega otimizada dos dados.🔑 Mecanismo de Cache (update_cache)A função update_cache() é o coração da otimização. Ela verifica se o timestamp do cache expirou (5 minutos). Se expirou, uma nova requisição lenta (fetch_events_from_eonet) é feita à NASA EONET. O endpoint /eventos sempre chama update_cache() para garantir que os dados estejam frescos (ou a 5 minutos do último fetch).Python# main.py
CACHE_EXPIRATION_MINUTES = 5
cache = {
"data": None,
"timestamp": datetime.min
}

# ...

def update_cache(): # Se o tempo atual for maior que o timestamp do cache + 5 minutos
if datetime.now() > cache["timestamp"] + timedelta(minutes=CACHE_EXPIRATION_MINUTES): # ... buscar e atualizar
Endpoints DisponíveisMétodoCaminhoDescriçãoGET/Mensagem de saúde da API.GET/eventosEndpoint principal. Retorna os eventos ativos, servidos a partir do cache (atualizado a cada 5 minutos).GET/api-docsRetorna uma lista programática dos endpoints da API (excluindo rotas de doc automáticas).🗺️ Interface do Usuário (Frontend)O frontend interage com a API e exibe o mapa de forma dinâmica.1. Inicialização do Mapa (script.js)O mapa é inicializado com uma camada de satélite realista e uma camada de limites geográficos. O agrupamento de marcadores é feito pelo plugin L.markerClusterGroup.JavaScript// script.js
const map = L.map('map').setView([0, 0], 2);
const markers = L.markerClusterGroup({ maxClusterRadius: 40 });

// Camada de Satélite
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { /_ ... _/ }).addTo(map); 2. Ciclo de Atualização e NotificaçãoO frontend implementa um ciclo de atualização a cada 60 segundos (INTERVALO_ATUALIZACAO_MS), que é o tempo máximo que o client espera para checar novos dados no proxy (que tem uma janela de 5 minutos para o fetch real na NASA).setInterval(atualizarContador, 1000): Atualiza o timer no painel de estatísticas.setInterval(verificarNovosEventos, INTERVALO_ATUALIZACAO_MS): Busca novos dados na API (/eventos).Novos Eventos: Se um evento com titulo inédito for encontrado, ele é adicionado ao mapa, as estatísticas são atualizadas e uma Notificação é enviada ao usuário.3. Pop-up de PrevençãoCada marcador no mapa exibe um popup formatado que inclui um bloco de Ação de Prevenção dinâmico, baseado na categoria do desastre (getAcoesPrevencao).Exemplo de Ação (Storms):HTML<p><strong>🌪️ Ação de Prevenção (Tempestade/Ciclone):</strong></p>

<ul>
    <li>Fique dentro de casa, longe de janelas e portas.</li>
    <li>Tenha suprimentos de emergência prontos (água, comida, rádio).</li>
    <li>Siga as rotas de evacuação locais, se necessário.</li>
</ul>
⚙️ Como Executar o Projeto LocalmentePré-requisitosPython 3.9+Pip1. Instalação do BackendBash# Clone o repositório ou navegue até a pasta do projeto
pip install fastapi uvicorn requests python-multipart

# Inicie a API com Uvicorn

uvicorn main:app --reload

# A API estará disponível em: http://127.0.0.1:8000

2. Execução do FrontendCertifique-se de que a API (http://127.0.0.1:8000) está em execução.Abra o arquivo index.html em seu navegador.Atenção: Devido às políticas de segurança do navegador (CORS), o frontend em index.html (aberto como file://) pode ter dificuldades para acessar a API (http://) sem um servidor web. Se tiver problemas, use uma extensão de servidor local do VS Code (ex: Live Server) ou configure um servidor simples para servir os arquivos.
