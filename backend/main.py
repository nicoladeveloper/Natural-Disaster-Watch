from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
from datetime import datetime, timedelta
from fastapi.routing import APIRoute # Importação adicionada para filtro

app = FastAPI()

# --- Configurações de Cache ---
CACHE_EXPIRATION_MINUTES = 5
cache = {
    "data": None,
    "timestamp": datetime.min
}
EONET_API_URL = "https://eonet.gsfc.nasa.gov/api/v3/events"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def fetch_events_from_eonet():
    try:
        # Adicionado timeout de 10 segundos para não travar
        response = requests.get(EONET_API_URL, timeout=10) 
        response.raise_for_status() # Lança erro para status HTTP ruins
        data = response.json()
        
        eventos_processados = []

        for evento in data.get("events", []):
            titulo = evento["title"]
            categoria = evento["categories"][0]["title"] if evento["categories"] else "Desconhecido"
            
            # OTIMIZAÇÃO: Prioriza a geometria mais recente, se houver múltiplas
            geometry = evento["geometry"][-1] if evento["geometry"] else None 
            
            coordenadas = geometry["coordinates"] if geometry else None
            data_evento = geometry["date"] if geometry else None
            link = evento["link"]
            
            if coordenadas and data_evento:
                eventos_processados.append({
                    "titulo": titulo,
                    "categoria": categoria,
                    "coordenadas": coordenadas,
                    "data": data_evento,
                    "link": link
                })

        return {"eventos": eventos_processados}

    except requests.exceptions.RequestException as e:
        print(f"Erro ao buscar dados da EONET: {e}")
        return None

def update_cache():
    global cache
    
    if datetime.now() > cache["timestamp"] + timedelta(minutes=CACHE_EXPIRATION_MINUTES):
        print("Cache expirado. Atualizando...")
        new_data = fetch_events_from_eonet()
        
        if new_data is not None:
            cache["data"] = new_data
            cache["timestamp"] = datetime.now()
            print("Cache atualizado com sucesso.")
        else:
            print("Falha na atualização do cache. Usando dados antigos (se houver).")

# Inicializa o cache na inicialização do servidor
update_cache()

@app.get("/")
def home():
    return {"message": "API de Prevenção de Desastres Naturais (NASA EONET)"}

@app.get("/eventos")
def get_eventos():
    # CHAVE DA OTIMIZAÇÃO: Garante que os dados sejam verificados/atualizados antes de responder
    update_cache() 
    
    if cache["data"] is None:
        return {"eventos": []}
        
    return cache["data"]

# NOVO ENDPOINT DE DOCUMENTAÇÃO PROGRAMÁTICA
@app.get("/api-docs")
def list_endpoints():
   
    url_list = []
    
    for route in app.routes:
        # Filtra apenas rotas HTTP normais (APIRoute)
        if isinstance(route, APIRoute):
            if route.path not in ["/openapi.json", "/docs", "/redoc", "/api-docs"]:
                url_list.append({
                    "method": list(route.methods)[0] if route.methods else "GET", # Pega o primeiro método
                    "path": route.path
                })
    return {"endpoints": url_list}