# 🎯 Entrega 4

Este repositorio corresponde a la **Entrega 4** de **DeckTrade**. En esta entrega nos centramos en resolver bugs previos, fortalecer la estructura del backend y desplegar la aplicación en la nube.

---

## 📚 Referencias

- Decisiones de infraestructura cloud (AWS): [infraestructura.md](./infraestructura.md)  
- Acceso a la aplicación en producción: [http://54.227.126.233:3000/](http://54.227.126.233:3000/)  
- Credenciales de usuario administrador por defecto:
  - **Email**: `admin@example.com`
  - **Contraseña**: `admin`

### 🧪 .env de ejemplo para entorno local

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
MONGO_URI=mongodb://mongo:27017/deckTrade
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development

---

## 🚧 Tareas a Implementar en Entrega 4

- Implementar un módulo de **notificaciones** para los usuarios.  
- Emparejar la versión de `master` con la instancia desplegada en la nube.  

---

## ✅ Logros de esta entrega

- Corrección de errores arrastrados de entregas anteriores.  
- Implementación de un **handler genérico** para los controllers.  
- Mejora de validaciones en distintas capas del backend.  
- 🎯 **Despliegue completo de la aplicación en la nube**, utilizando dos instancias EC2 configuradas dentro de una VPC.

---

## 📈 Objetivos Futuras

- Mejorar la **performance** del aplicativo.  
