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

 
