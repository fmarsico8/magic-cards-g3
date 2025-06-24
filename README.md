# 🎉 Entrega Final

Este repositorio corresponde a la **Entrega Final** de **DeckTrade**. En esta entrega nos centramos en resolver bugs previos, ultimar detalles de insfraestructura, resolver dudas y agregar features Pendientes.

---

## 🏢 Arquitectura ideal
  En el siguiente archivo, planteamos nuestra arquitectura ideal: [arquitectura-ideal.md](./arquitectura-ideal.md)  

## 📚 Preguntas de análisis

### 1. ¿Consideran que el servicio de EC2 es el correcto para el despliegue de MongoDB? ¿Investigaron alguna otra alternativa dentro de AWS? ¿Qué problemas puede traer el despliegue en EC2?

Sí, investigamos otras opciones dentro de AWS. Nos pareció interesante *EKS (Elastic Kubernetes Service)* como alternativa, ya que permite orquestar contenedores, escalar de forma automática y manejar configuraciones de forma más flexible. Sin embargo, por cuestiones de tiempo y simplicidad, decidimos hacer el despliegue en *EC2*, ya que nos dio mayor control directo y fue más rápido de implementar. Sabemos que esto puede traer algunas desventajas, como la necesidad de gestionar manualmente el backup, la seguridad y la escalabilidad del servicio.

### 2. ¿Qué consideraciones hay sobre incluir NGINX, Backend y Frontend en una misma instancia?

Al ser un proyecto chico y con fines académicos, decidimos incluir *NGINX, Backend y Frontend en una misma instancia EC2* para simplificar el despliegue. Sin embargo, en un entorno productivo real esto puede traer problemas de escalabilidad y mantenimiento, ya que cada servicio tiene responsabilidades distintas y puede requerir distintos recursos o políticas de seguridad. En ese caso, sería recomendable separarlos en distintas instancias o contenedores gestionados de forma independiente.

### 3. ¿Investigaron otros servicios para desplegar containers además de EC2? ¿Cómo se manejaría la escalabilidad?

Sí, además de EC2, investigamos otros servicios como *EKS (Elastic Kubernetes Service)* y *ECS (Elastic Container Service)*, que están pensados para el despliegue y gestión de contenedores. Estas opciones facilitan el escalado automático y la administración de los servicios de forma más flexible. Aunque por simplicidad usamos EC2, consideramos que en un entorno productivo sería mejor usar EKS o ECS para mejorar la escalabilidad y el mantenimiento del sistema.

## ✅ Logros de esta entrega

- 🔔 Implementamos el modulo de notificaciones. Cada vez que un usuario realiza una oferta la misma es notificada al dueño de la publicación en la cual se hizo la misma. A su vez, si este último la acepta o la rechaza, se notifica el estado final al oferente. Esto se puede ver en la esquina superior derecha de la pantalla.
- 📈 Mejoramos la visualización de las estadísticas. Actualmente, se pueden filtrar por diferentes períodos de tiempo (día, mes, cuarto y año) y a su vez analizar los datos de manera puntual en esos períodos o de forma acumulativa.
- 🔐 Agregamos mayores validaciones al momento de crear las contraseñas. Previamente solo requeríamos que tengas 8 caracteres. Actualmente, debe tener el mismo largo como mínimo, más alguna mayúsucula, carácter especial y número.
- 🪲 Corregimos la duplicación de cartas bases y juegos. Logramos unicidad en los nombres de los juegos y las cartas bases.
- 🐐 Incorporamos HTTPS. Este es la url de nuestro aplicativo: https://decktrade.online/ 

 

## 🎯 Entrega 4

Repositorio correspondiente a la **Entrega 4**  [entrega4.md](./entrega4.md) del trabajo práctico. En esta entrega se amplía el trabajo anterior incorporando:

- 🧱 Backend con **arquitectura limpia** (Express + TypeScript).  
- 🌐 Frontend web con **React**, **Next.js** y **Redux**.  
- 🤖 Bot de **Telegram** conectado al backend. (Deprecated) 
- 🐳 Contenedorización con Docker y orquestación con Docker Compose.
- 📄 Base de datos con MongoDB. 
- ☁️ La aplicación se encuentra desplegada en la nube utilizando **2 instancias EC2**: una para la app y otra para MongoDB.  
- Link del aplicativo en cloud: [http://54.277.126.233:3000/](http://54.227.126.233/)  
---

## 📦 Entrega 1 - Backend

El objetivo principal fue presentar una arquitectura limpia en una aplicación Express utilizando TypeScript.

### 📋 Prerrequisitos

Antes de comenzar, asegurate de tener instalado lo siguiente:

- [Node.js](https://nodejs.org/) (v14 o superior)  
- [npm](https://www.npmjs.com/) (viene incluido con Node.js)  
- [Docker](https://www.docker.com/get-started)  
- [Git](https://git-scm.com/) (control de versiones)

---

## 🚀 Comenzando - Backend

### Instalación de dependencias

```bash
npm install
```

### Configuración de variables de entorno

Crear un archivo `.env` en la raíz del proyecto basado en `.env.example`:

```bash
NODE_ENV=development
PORT=3001
API_PREFIX=/api

JWT_SECRET=your_development_secret_key_change_in_production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

LOG_LEVEL=debug
```

### Compilar y ejecutar

```bash
npm run build
npm start
```

La API estará disponible en: [http://localhost:3001/api](http://localhost:3001/api)

### Modo desarrollo (hot reload)

```bash
npm run dev
```

---

## 🧪 Tests

```bash
npm test
```

---

## 📁 Estructura del backend

```
src/
├── application/
│   ├── dtos/
│   ├── services/
│   └── interfaces/
├── domain/
│   ├── entities/
│   ├── repositories/
│   └── value-objects/
├── infrastructure/
│   ├── config/
│   ├── http/
│   ├── logging/
│   └── repositories/
└── interfaces/
    ├── controllers/
    ├── middleware/
    └── routes/
```

### Capas

- **Domain Layer**: Entidades y lógica de negocio independientes del resto.  
- **Application Layer**: Casos de uso de negocio.  
- **Infrastructure Layer**: Frameworks, BD, etc.  
- **Interface Layer**: Rutas, controladores, middleware.

---

## 🌐 Frontend Web

Se incorporó una interfaz web que permite a los usuarios interactuar con la plataforma de manera visual e intuitiva.

### Tecnologías y decisiones de diseño

- **React**: Client-Side Rendering (CSR) para interactividad dinámica.  
- **Redux**:  
  - Estado global predecible y centralizado.  
  - Facilidad de debugging y testing (time-travel, middleware).  
  - Compartición sencilla de datos (usuario, ofertas, publicaciones).  
- **Next.js**:  
  - Renderizado híbrido (SSR + CSR).  
  - SSR para componentes estáticos (botones, formularios).  
  - CSR para pantallas de alta interactividad.

### 📁 Estructura del frontend

```
frontend/
├── app/            # Páginas manejadas por Next.js
├── components/     # Componentes reutilizables
├── services/       # Consumo de APIs del backend
├── types/          # Tipos de datos de respuestas del backend
└── lib/            # Redux slices y unificación de llamadas a APIs
```

- **Slices de Redux**: Cada slice (e.g., `publicacionesSlice`, `usuarioSlice`) agrupa estado y reducers.  
- **Lib de APIs**: Centraliza `axios` y lógica de llamadas, desacoplando vistas de servicios.

### 🔧 Mejoras implementadas

- Conexión completa entre frontend y backend.  
- Vistas para:
  - Mis ofertas en el front.  
- Sistema de roles (Usuario y Admin) solo en el back.  
- Paginación en listados masivos.  


### ⚠️ Pendientes

- Visualización de estadísticas para el rol Admin (lógica y rutas listas; falta UI).
- Integración con la API de Magic The Gathering.
---

## 🤖 Bot de Telegram

Se agregó un canal alternativo de interacción mediante un bot de Telegram.

### Tecnologías utilizadas

- [grammY](https://grammy.dev/): Framework para bots de Telegram.
- TypeScript + Node.js

### 📁 Estructura del bot

```
bot/
├── application/
│   ├── Conversations/   # Manejo de flujos de conversación
│   └── Menus/           # Definición de menús y botones inline
├── bot/                 # Sesión, almacenamiento de contexto y repositorio de usuarios
├── client/              # Cliente HTTP para llamadas al backend
└── types/               # Definición de errores y tipos compartidos
```

### Funcionalidades actuales

- Login con token y persistencia de sesión.  
- Listado de publicaciones activas.  
- Listado y aceptación de ofertas.  
- Navegación mediante botones inline.

### 🔧 Pendientes

- Flujo de creación de publicaciones directamente en Telegram.  
- Paginación en listados (inline pagination).  
- Mejor manejo de errores y validaciones.

---

## 🐳 Docker

Cada servicio (backend, frontend y bot) incluye su propio `Dockerfile`. Además, en la raíz del repositorio se encuentra un archivo `docker-compose.yml` que permite ejecutar todos los servicios conjuntamente desde la carpeta raíz:

```bash
docker-compose build
docker-compose up
```

Esto levantará:
- Servicio de la API (Express + TypeScript)  
- Servicio del frontend (Next.js)  
- Servicio del bot de Telegram

---

## 🔧 Mejoras planeadas para la fase 2

1. Integración de la API de **Magic The Gathering** para enriquecer datos.
2. Existe un bug con el bot de Telegram que hace que se loguee constantemente al back.
3. Agregar pantallas para Admin de visualización de estadísticas de la plataforma.
4. Agregar test de funcionalidad del backend (estamos en alrededor de 50%, queremos llevarlo a 80%).

### Acceso al bot de Telegram:

[Acceder al bot](https://t.me/magic_cards_g3_bot)

---

## 🧠 Decisiones de diseño

- **TypeScript**: Robustez, autocompletado y mantenimiento.  
- **Clean Architecture**: Modularidad y testabilidad.  
- **Redux + Next.js**: Escalabilidad y performance híbrida SSR/CSR.

> Esta estructura es clave para escalar hacia microservicios o nuevos canales de comunicación.
