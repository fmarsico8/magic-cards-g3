# 🏗️ Arquitectura de Infraestructura – DeckTrade

Este README describe de manera resumida la arquitectura de infraestructura de la plataforma **DeckTrade**, explicando las decisiones tomadas para el MVP y los beneficios esperados.

---

## 🌐 VPC y Subredes

- **VPC – TACS-DeckTrade (10.0.0.0/16)**  
  Creamos una única VPC que abarque toda la infraestructura. De esta forma, todos los recursos (EC2, gateways, subredes) se encuentran dentro de un rango privado controlado.

- **Subredes:**
  - `TACS-DeckTrade-app (10.0.1.0/24)`  
    Destinada a alojar el EC2 que ejecuta la app (frontend + backend + nginx).  
  - `TACS-DeckTrade-mongo (10.0.2.0/24)`  
    Reservada para el EC2 que corre MongoDB, sin acceso público directo.  

- **Routing e Internet Gateway (IGW):**  
  Asociamos un Internet Gateway (`TACS-DeckTrade-igw`) a la tabla de rutas de la VPC para otorgar salida a internet a la subred "app". La subred "mongo" no tiene ruta directa a internet.

---

## 📦 Instancias EC2 y Contenedores Docker

- **EC2 – APP Server (10.0.1.198 / 54.227.126.233)**  
  - Corre **Docker** con tres contenedores:
    1. **NGINX ( puerto 80 )**  
       - Proxy reverso que recibe todo el tráfico HTTP/HTTPS desde internet.  
       - Redirige internamente a los contenedores de frontend y backend.
    2. **Frontend (Next.js – puerto 3000 )**  
       - Entrega la interfaz de usuario (UI) de DeckTrade.
    3. **Backend (Express – puerto 3001 )**  
       - Exposición de API REST para gestionar usuarios, cartas, publicaciones e integraciones con S3.  

  - IP pública asignada para acceder al NGINX desde cualquier origen (se limita a TCP 80/443).

- **EC2 – MongoDB Server (10.0.2.71)**  
  - Corre **Docker** con contenedor MongoDB (puerto 27017).  
  - Sin IP pública: solo accesible desde la subred “app” (SG interno).  
  - Garantiza aislamiento de la base de datos y facilita backups o snapshots por separado.

---

## 🔒 Security Groups y Acceso

- **SG-APP** (para EC2 App Server)  
  - **TCP 80** (0.0.0.0/0)  
    - Permite tráfico HTTP(S) entrante hacia NGINX.  
  - **TCP 22** (IPs específicas del equipo)  
    - SSH seguro hacia la instancia para administración remota.

  > 📝 _NGINX dentro del contenedor enruta todo el tráfico HTTP a los puertos 3000 y 3001 del mismo host, por lo que no hace falta exponerlos públicamente._

- **SG-MONGO** (para EC2 MongoDB)  
  - **TCP 27017** (desde SG-APP)  
    - Solo el App Server puede comunicarse con MongoDB.  
  - **TCP 22** (IPs específicas del equipo)  
    - SSH seguro para tareas de mantenimiento o respaldos.

  > 📝 _Al no exponer MongoDB a Internet, reducimos superficies de ataque y garantizamos que solo el backend pueda leer/escribir en la base de datos._

---

## 🔄 Proxy Reverso con NGINX

- **¿Por qué usar NGINX?**
  1. **Punto de entrada único**  
     - Centraliza la ruta de todo el tráfico HTTP(S), evitando exponer puertos internos.  
  2. **Seguridad y Control**  
     - Si mañana queremos habilitar HTTPS (Let’s Encrypt), solo configuramos NGINX.  
  3. **Escalabilidad futura**  
     - Podemos añadir reglas de cacheo, balanceo de carga o WAF sin modificar la app ni la DB.

- **Flujo de tráfico actual:**  
  1. Cliente → Internet → ELB/NGINX (puerto 80)  
  2. NGINX → Forward a Frontend (localhost:3000)  
  3. NGINX → Forward a Backend (localhost:3001)  

---

## 🔑 IAM Roles y S3

- **S3 Bucket: `decktrade-cardimages`**  
  Guardamos las imágenes de cartas (archivos .jpg/.png) en un bucket S3 privado.

- **IAM Role asociado al EC2 App Server**  
  - Permite al backend (Express) subir/descargar imágenes sin necesidad de credenciales embebidas.  
  - Alcance limitado a acciones `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject` sobre el bucket específico.

  > 📝 _Con este enfoque, no hay claves estáticas en el código: AWS gestiona permisos dinámicos mediante el role attached._

---

## ✅ Razones de Diseño y Beneficios

1. **Separación App ↔ Base de Datos**  
   - Facilita escalado individual:  
     - Podemos escalar EC2-App (ECS o AutoScaling Groups) sin tocar MongoDB.  
     - Podemos mover MongoDB a un cluster (Replica Set o Atlas) cuando crezcan volúmenes.  
   - Simplifica mantenimiento:  
     - Ejemplo – aplicar parches de seguridad en el OS del App Server sin afectar la DB.

2. **Aislamiento de MongoDB**  
   - No tiene IP pública.  
   - Solo tráfico permitido desde el SG-APP.  
   - El SSH a MongoDB es solo desde rangos de IP de administración.

3. **NGINX como Proxy**  
   - Un único puerto público (80) en SG-APP hace más segura la superficie de ataque.  
   - Permite evolucionar fácilmente a HTTPS/HTTP2.

4. **Costos ajustados al Free Tier**  
   - 2 instancias t2.micro/t3.micro.  
   - 1 VPC + 2 Subredes + 1 IGW.  
   - 1 Bucket S3 (sin cargo adicional significativo).  
   - Minimiza complejidad operativa inicial.

---

## 📝 Resumen

La arquitectura actual de DeckTrade cumple con los requerimientos para un MVP:  
- **Segura** (MongoDB no está expuesta públicamente).  
- **Modular** (App y DB desacopladas).  
- **Económica** (Free Tier de AWS).  
- **Flexible** para futuras iteraciones (HTTPS, monitoreo, escalado).

¡Con esta base, el equipo de desarrollo puede enfocarse en la lógica de negocio y crecimiento de la plataforma!

![image](https://github.com/user-attachments/assets/8ca042e3-d3a2-47c8-8676-6d3772671ef9)


