## Resumen
Construir una web profesional de una sola página para **Grover Rojas Mayta**, abogado especializado en derecho penal, laboral y criminología/criminalística. El sitio usará una paleta de color **guinda/borgoña** como identidad principal, mostrará secciones de inicio, servicios, artículos jurídicos, sobre mí y contacto, e incluirá un **blog con panel de administración privado** para subir, editar y eliminar artículos.

## Alcance del producto
- **Página pública única** (`/`): hero, servicios, últimos artículos, sobre el abogado, contacto.
- **Blog integrado**: listado de artículos públicos con título, extracto, imagen opcional, fecha y categoría.
- **Panel de administración** (`/admin`): acceso solo para Grover; crear, editar, publicar/ocultar y eliminar artículos.
- **Autenticación**: inicio de sesión con email/contraseña y Google, protegido por Lovable Cloud.
- **Perfil de usuario**: tabla de perfiles vinculada al usuario autenticado.

## Decisiones de diseño
- **Paleta**: guinda/borgoña como color primario, combinado con tonos crema/blanco para fondos y gris oscuro para textos. Modo claro por defecto.
- **Tipografía**: combinación serif para títulos (aire jurídico/clásico) y sans-serif para cuerpo.
- **Layout**: single-page con secciones verticales, navegación fija superior, tarjetas de artículos en grid.
- **Marca**: usar "G. Rojas Mayta" o iniciales elegantes como identidad visual.

## Arquitectura técnica
### Base de datos (Lovable Cloud)
1. **`profiles`**
   - `id` (uuid, PK), `user_id` (uuid, FK a auth.users), `full_name`, `avatar_url`, `bio`, `phone`, `created_at`, `updated_at`.
   - RLS: el usuario puede leer/actualizar solo su perfil.
2. **`articles`**
   - `id` (uuid, PK), `author_id` (uuid, FK a auth.users), `title`, `slug`, `excerpt`, `content` (rich text), `category`, `cover_image_url`, `published` (boolean), `created_at`, `updated_at`.
   - RLS: lectura pública para artículos `published = true`; escritura completa solo para el autor autenticado.
3. **`user_roles`**
   - `id` (uuid, PK), `user_id` (uuid, FK a auth.users), `role` (enum: `admin`).
   - RLS: lectura para autenticados; escritura solo service_role.
   - Función `has_role()` para verificar administrador.

### Backend
- Usar `createServerFn` de TanStack Start para:
  - Listar artículos públicos.
  - Obtener un artículo por slug.
  - Crear/actualizar/eliminar artículos (protegido con `requireSupabaseAuth` + verificación de rol admin).
  - Obtener/actualizar perfil.
- Configurar `src/start.ts` para adjuntar el bearer token en las llamadas a server functions.

### Frontend
- **`src/routes/index.tsx`**: landing única con secciones scrollables.
- **`src/routes/auth.tsx`**: página de inicio de sesión (email + Google).
- **`src/routes/_authenticated/admin.tsx`**: panel de administración del blog.
- **`src/routes/_authenticated/admin.new.tsx`**: formulario para crear artículo.
- **`src/routes/_authenticated/admin.$id.edit.tsx`**: formulario para editar artículo.
- Componentes reutilizables: Header, Hero, Services, ArticleCard, ArticleList, About, Contact, AdminArticleTable, ArticleEditor.

### Autenticación
- Habilitar email/contraseña y Google OAuth.
- Crear ruta `/auth` pública para iniciar sesión.
- Rutas bajo `_authenticated/` protegidas por el layout gestionado de Lovable Cloud.
- El primer usuario registrado se promoverá a admin mediante una función server privada.

## Pasos de implementación
1. Configurar autenticación en Lovable Cloud (email + Google).
2. Crear migración de base de datos: `profiles`, `articles`, `user_roles` y políticas RLS.
3. Definir design system en `src/styles.css` con tokens guinda/crema.
4. Crear server functions para artículos y perfil.
5. Construir landing page pública con secciones.
6. Construir panel de administración: listado, crear, editar, publicar/ocultar, eliminar.
7. Añadir ruta `/auth` con inicio de sesión.
8. Verificar build, navegación y flujo de creación de artículos.

## Notas
- El sitio será responsivo (móvil primero).
- Las imágenes de portada de artículos serán opcionales; si no se sube una, se usa un degradado guinda como placeholder.
- El contenido de los artículos se guardará como texto enriquecido simple (Markdown-like) para mantener la implementación enfocada.