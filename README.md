<h1>🌎 Natural Disaster Watch (NASA EONET Tracker)</h1>
<p align = "left" align="center"> <img src="https://img.shields.io/badge/Python-3.9%2B-blue" alt="Python Version"> <img src="https://img.shields.io/badge/FastAPI-0.100.0%2B-009688" alt="FastAPI Version"> <img src="https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JS-orange" alt="Frontend Tech"> <img src="https://img.shields.io/badge/Map-Leaflet%20%7C%20MarkerCluster-green" alt="Mapping Tech"> </p>

#

🚀 Visão Geral do Projeto
O Natural Disaster Watch é um sistema de monitoramento de desastres Naturais em tempo real (com otimização de cache) de eventos naturais ativos ao redor do mundo. Ele utiliza a API EONET (Earth Observatory Natural Event Tracker) da NASA como fonte de dados.

<img height="300" src = "https://github.com/user-attachments/assets/c74f019c-1ecf-461c-b5a4-1f2df711571c">

O projeto é dividido em dois módulos principais:

**Backend (API Python - FastAPI):** Atua como um proxy inteligente para a EONET, implementando um sistema de cache com expiração de 5 minutos para otimizar o desempenho e evitar sobrecarga de requisições à fonte original. **Possui um endpoint de Previsão de Risco Global Geo-Espacial, simulando um alerta realista para as principais zonas de falhas tectônicas e risco climático do planeta.**

**Frontend (Web App):** Exibe os eventos em um mapa interativo utilizando Leaflet e MarkerCluster, permitindo a visualização agrupada dos desastres, busca de localização e exibição de estatísticas e ações de prevenção por categoria.

✨ Destaques de Funcionalidade
* **Mapa Interativo:** Visualização de desastres em um mapa de satélite, com agrupamento inteligente de marcadores (clusters).
* **Previsão de Risco Realista:** Novo módulo de prevenção que avalia o risco de desastre na sua localização com base em coordenadas (GPS, CEP ou Busca textual), utilizando uma simulação geo-espacial que reflete a realidade das zonas de risco do planeta.
* **Busca por Localização Avançada:** Permite buscar a localização por:
    * GPS (Localização Atual do navegador).
    * **CEP Brasileiro** (usando a API ViaCEP para obter o endereço).
    * **Nome da Cidade/País** (usando a API Nominatim/OpenStreetMap para obter as coordenadas).
* **Otimização de Performance:** O Backend (FastAPI) implementa um cache que só atualiza os dados da NASA a cada 5 minutos, garantindo respostas rápidas para o frontend.
* **Estatísticas em Tempo Real:** Painel com o total de eventos ativos, categoria mais frequente e contador para a próxima atualização da API.
* **Ações de Prevenção:** Cada marcador exibe um popup com o evento, link de detalhes e dicas de prevenção específicas para a categoria (Ex: Wildfires, Floods, Storms).
* **Notificações (Opcional):** Suporte a notificações nativas do navegador quando um novo evento é detectado.

🛠️ Tecnologias Utilizadas

| Componente | Linguagem/Framework | Bibliotecas Chave |
| :--- | :--- | :--- |
| Backend | Python 3.9+ | FastAPI, requests |
| Frontend | HTML, CSS, JavaScript | Leaflet.js, Leaflet.markercluster |
| Dados | API Externa | NASA EONET |
| **Localização** | **API Externa** | **Nominatim (OpenStreetMap), ViaCEP** |
