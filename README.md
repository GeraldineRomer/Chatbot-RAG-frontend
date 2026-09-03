# 💬 Chatbot RAG Interface - Multi-Tenant Frontend

Cliente web moderno y responsivo para interactuar con la API del **Chatbot RAG**. Permite la carga de documentos PDF en la nube y el procesamiento de preguntas en tiempo real mediante un LLM contextualizado con historial de conversación.

Diseñado con un enfoque **Mobile-First** que optimiza la experiencia de usuario (UX) en cualquier dispositivo.

---

## 🛠️ Tecnologías

* **Framework:** React / Node.js
* **Estilos:** CSS Modules / Tailwind CSS
* **Cliente HTTP:** Fetch API / Axios
* **Despliegue:** [Vercel](https://vercel.com/)

---

## ✨ Características Principales

* **Identificación Automática de Sesión (`X-Session-ID`):**
  * Genera un identificador único (UUID) al primer ingreso y lo almacena en `localStorage`.
  * Inyecta automáticamente la sesión en los encabezados de cada petición HTTP para garantizar la privacidad y aislamiento de los datos subidos.
* **UX Optimizado para Dispositivos Móviles:**
  * **Indicador de Estado Inicial:** Mensaje de bienvenida del asistente predeterminado cuando el sistema detecta que el usuario no ha cargado ningún documento.
  * Guía visual para dirigir al usuario al panel de carga de archivos PDF sin saturar la vista del chat.
* **Gestión de Conversación y Contexto:**
  * Preservación del historial de mensajes para interacciones continuas.
  * Mapeo y presentación de fuentes citadas extraídas directamente del documento.

---

## ⚙️ Configuración e Instalación Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/GeraldineRomer/chatbot-rag-frontend.git
   cd chatbot-rag-frontend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Variables de Entorno (`.env.local`):**
   Crea un archivo `.env.local` apuntando al backend (despliegue en Render o entorno local):
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://tu-app-en-render.onrender.com
   ```

4. **Iniciar en modo desarrollo:**
   ```bash
   npm run dev
   ```

---

## 🚀 Despliegue en Vercel

1. Importa el repositorio desde la consola de **Vercel**.
2. Define la variable de entorno `NEXT_PUBLIC_API_BASE_URL` con la URL de tu API desplegada en Render.
3. Haz clic en **Deploy**.

## Ver aplicación original funcionando

El siguiente enlace te lleva a la interfaz oficial de la aplicación, la cual puede tardar un rato en conectarse al backend debido a que está desplegado en la capa gratuita de Render, además, al ser un proyecto de muestra de habilidades, se utiliza la API gratuita de Gemini por lo que se pueden exceder los tokens 
(https://chatbot-rag-frontend-one.vercel.app/)
