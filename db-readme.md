# 📚 Base de Datos en DeckTrade

En **DeckTrade** evaluamos tres familias de bases de datos NoSQL: Amazon DynamoDB (key-value), Apache Cassandra (column-family) y MongoDB (documental). Tras analizar nuestros requerimientos, **MongoDB** resultó ser la opción más adecuada.

---

## 🔍 Búsquedas complejas y flexibles

En una plataforma donde los usuarios explorarán cartas aplicando filtros por nombre, juego, estado o valor, necesitamos soporte nativo para coincidencias parciales (“like”) y búsqueda de texto completo. La decisión de la base de datos se basa en cómo se realizan las queries:

- **DynamoDB** ofrece consultas mediante índices secundarios (GSI) y filtrados por rangos, pero carece de capacidades de texto enriquecido o regex; implementar patrones “like” implicaría escanear tablas completas o usar motores externos, aumentando complejidad y latencia.
- **Cassandra** permite filtros simples por clustering keys, pero no dispone de índices de texto completo; cualquier consulta de tipo “contiene” requiere soluciones de procesamiento por lotes o motores de búsqueda externos.
- **MongoDB** integra índices de texto y operadores regex a nivel de motor, facilitando búsquedas por fragmentos de nombre o descripciones sin infraestructura complementaria ni sacrificio de rendimiento.

---

## 🧩 Modelado de datos y relaciones jerárquicas

Nuestro dominio incluye varias entidades con jerarquías y relaciones muchos-a-muchos (juego → carta base → carta de usuario → publicación, y publicaciones con múltiples cartas deseadas):

- En **DynamoDB**, la ausencia de documentos anidados obliga a denormalizar datos en tablas únicas o gestionar estructuras complejas de ítems, dificultando la evolución del esquema y la coherencia de metadatos.
- **Cassandra** utiliza un diseño de tablas optimizado para patrones de lectura fijos, lo que entorpece cambios en las relaciones o la introducción de nuevos filtros sin redefinir el esquema completo.
- **MongoDB**, con su modelo documental, permite representar cada entidad en su propia colección y ligarlas mediante referencias (ObjectId), evitando duplicación y garantizando que actualizaciones (p. ej. renombrar una carta base) se reflejen automáticamente.

---

## 🔐 Alta consistencia garantizada

La operación de “aceptar una oferta” debe actualizar de forma atómica el estado de la publicación, cerrar ofertas competidoras y transferir la propiedad de la carta:

- **DynamoDB** ofrece transacciones ACID limitadas a tablas individuales o a pequeños conjuntos de ítems, pero añade complejidad en la lógica de aplicación al gestionar claves compuestas y contadores distribuidos.
- **Cassandra** no soporta transacciones ACID entre múltiples particiones, dificultando asegurar la coherencia inmediata de cambios relacionados.
- **MongoDB** permite transacciones multi-documento en replica sets o clusters shardeados, garantizando ACID a través de colecciones distintas. Con un esquema referenciado, cada actualización afecta documentos pequeños y se agrupa en una única operación atómica, alineándose con el modelo CP de CAP y priorizando consistencia en operaciones críticas.

---

## 📈 Estadísticas diarias con Time Series

Para el requerimiento de lectura y escritura de estadísticas diarias de la aplicación, elegimos **MongoDB Time Series** debido a:

- **Simplicidad operativa**: mantenemos un único sistema de base de datos, reduciendo la carga de operación (backups, monitoreo, autenticación).  
- **Integración nativa**: las Time Series Collections de MongoDB permiten escribir y consultar métricas con la misma conexión, drivers y herramientas ya establecidas para el resto del dominio.  
- **Rendimiento adecuado**: para nuestra escala (métricas diarias con decenas de miles de registros al mes), ofrecen latencias de escritura y consulta más que suficientes, sin el overhead de otro motor especializado.

---
