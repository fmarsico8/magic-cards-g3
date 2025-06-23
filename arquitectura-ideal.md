# Arquitectura Ideal - Plataforma DeckTrade

Este documento describe la arquitectura ideal de la plataforma **DeckTrade**, diseñada para aprovechar servicios administrados en la nube mediante AWS.

---

## 🖥️ Frontend

- **CloudFront**: CDN global de AWS que distribuye los archivos del sitio de forma eficiente, con baja latencia.
- **S3 (Static files)**: Bucket que aloja el sitio estático del frontend (CSR). CloudFront distribuye estos archivos cacheados globalmente.

### ✅ Beneficios
- Alta disponibilidad y performance global.
- Costos mínimos por almacenamiento y transferencia.
- No requiere servidores activos.

---

## ⚙️ Backend

- **Application Load Balancer (ALB)**: Balancea el tráfico hacia el backend, manejando múltiples instancias de forma dinámica.
- **ECS Fargate (Backend)**: Contenedor que ejecuta el backend en Node.js. Escala automáticamente según la carga.
- **S3 (Cards Images)**: Bucket adicional para almacenar imágenes de cartas.
- **MongoDB Atlas**: Base de datos documental gestionada. Alternativa: **Amazon DocumentDB**.

### ✅ Beneficios
- Escalado automático y sin mantenimiento de infraestructura.

---

## 🔄 CI/CD

- **GitHub Actions**: Automatiza el build, push y despliegue continuo del backend. Ejecuta `aws ecs update-service` tras subir la imagen.
- **Amazon ECR**: Registro de contenedores donde se almacena la imagen Docker para el backend.

### ✅ Beneficios
- Despliegue sin intervención manual.

---

## ✉️ Mensajería Asíncrona

- **Amazon MQ**: Cola de mensajes que desacopla la lógica síncrona, permitiendo eventos asincrónicos, para nuestro caso Mails.
- **Lambda (Mail Worker)**: Función serverless que se activa con eventos de la cola para enviar correos electrónicos.

### ✅ Beneficios
- Menor acoplamiento entre servicios.
- Reducción del tiempo de respuesta del backend.

---

## 📊 Observabilidad

- **OpenTelemetry Collector**: Recolecta logs, métricas y trazas distribuidas del backend.
- **AWS CloudWatch**: Almacena métricas, logs y permite crear alarmas.
- **Grafana**: Visualización personalizada de trazas y métricas en dashboards.

### ✅ Beneficios
- Visibilidad completa del sistema.
- Alertas tempranas ante errores.
- Análisis de performance por componente.

---

## ✅ Beneficios Generales de la Arquitectura

- **Escalable por demanda**: Frontend y backend escalan de forma independiente.
- **Alta disponibilidad**: Infraestructura resiliente con tolerancia a fallos.
- **Menor mantenimiento**: Uso de servicios gestionados como Fargate, Atlas, S3 y Lambda.
- **Desacoplada**: Facilita evolución por componente.

---

![image](./images/arquitectura%20ideal.png)