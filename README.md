# 🚌 TransportClub - Sistema Integral de Fidelización de Transporte

Sistema web completo y escalable de fidelización para empresas de transporte (urbano, interprovincial, empresarial y corporativo), desarrollado con Next.js (App Router), TypeScript, Prisma ORM y PostgreSQL en Neon.

---

## 🌟 Características Principales

### 1. Portal Público y Registro de Clientes
- Landing page moderna explicando beneficios, categorías de servicio y mecánicas del club.
- Registro ágil de clientes con validaciones Zod (nombres, apellidos, celular de 9 dígitos, PIN numérico seguro de 4 a 8 dígitos con medidor de fortaleza).
- Consentimientos de tratamiento de datos personales (Ley N° 29733 de Perú) y promociones opcionales.
- Generación automática de **Código Único de Cliente** y **Código QR personal seguro**.

### 2. Autenticación y Seguridad Multi-Rol
- **Clientes:** Inicio de sesión rápido con celular y PIN hasheado (bcryptjs, 12 rounds).
- **Personal y Administradores:** Acceso con credenciales seguras (usuario/correo + contraseña).
- Sesiones HTTP-only seguras con `iron-session`.
- Control de fuerza bruta con bloqueo temporal por intentos fallidos.
- Middleware / Proxy de autorización granular por roles (`CUSTOMER`, `STAFF`, `ADMIN`).

### 3. Portal del Cliente (Mobile-First)
- **Dashboard:** Saludo personalizado, saldo de puntos disponibles, total histórico, próxima recompensa con barra de progreso interactiva y últimos movimientos.
- **Mi QR Digital:** Código QR en alta resolución para escaneo por el chofer, botón de pantalla completa con alto contraste y descarga de imagen PNG.
- **Mis Puntos:** Resumen de puntos (disponibles, acumulados, reservados en trámite y canjeados) con historial filtrable.
- **Historial de Viajes:** Detalle de servicios realizados, categoría, monto pagado y puntos ganados.
- **Catálogo de Recompensas:** Premios con stock, puntos requeridos, condiciones y solicitud de canje con reserva atómica de saldo.
- **Mis Canjes:** Seguimiento de estado (Pendiente, Aprobado, Entregado, Rechazado) con código único de validación para entrega física.
- **Perfil:** Edición de datos permitidos y preferencias de comunicación.

### 4. Panel del Personal Operativo
- **Escáner QR en vivo:** Lector mediante cámara con `html5-qrcode` y fallback de búsqueda manual por celular o código.
- **Registro de Servicios:** Selección de categoría, monto pagado, cálculo automático de puntos en tiempo real y confirmación atómica.
- **Entrega de Recompensas:** Validación de códigos para entrega física de premios.
- Historial de servicios procesados por el operador.

### 5. Panel Administrativo Integral
- **Dashboard Estadístico (Recharts):** Gráficos de viajes por categoría, puntos emitidos vs canjeados mensual, clientes frecuentes y KPIs clave.
- **Gestión de Clientes:** Búsqueda en tiempo real, ver QR, consultar saldo, bloquear/activar cuentas y **ajustes de puntos con motivo obligatorio**.
- **Gestión de Servicios:** Bitácora completa de transportes realizados con filtros por fecha, categoría y operador.
- **Categorías de Transporte:** CRUD dinámico con configuración de colores e iconos.
- **Motor Configurable de Puntos:**
  - Tasa de emisión por categoría (puntos por unidad base).
  - Monto base configurable (ej: S/10).
  - Modos de redondeo: Hacia abajo (Floor), Matemático (Round), Hacia arriba (Ceil).
  - Monto mínimo elegible y tope máximo de puntos por viaje.
  - Simulador en tiempo real incorporado.
- **Catálogo de Recompensas:** CRUD con stock, vigencia, condiciones y eliminación lógica.
- **Aprobación de Canjes:** Aprobación (genera código de validación único) o rechazo (motivo obligatorio y liberación inmediata de puntos reservados).
- **Reportes & Exportación:** Generación y descarga directa a **Excel (.xlsx)** y **CSV**.
- **Gestión de Personal:** Altas y permisos de administradores y personal operativo.
- **Auditoría del Sistema:** Registro inmutable de eventos, IP, usuario responsable y diferencias JSON.
- **Configuración Global:** Personalización de branding, nombre del programa, datos fiscales y políticas de expiración.

---

## 🛠️ Stack Tecnológico

| Capa | Herramienta |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Sonner |
| **Formularios & Validación** | React Hook Form, Zod |
| **Visualización de Datos** | Recharts |
| **Códigos QR** | qrcode (generación), html5-qrcode (lectura de cámara) |
| **Exportación** | xlsx, papaparse |
| **Backend & ORM** | Next.js Route Handlers, Prisma ORM v6 |
| **Base de Datos** | PostgreSQL alojado en Neon (Cloud) |
| **Autenticación & Sesión** | iron-session, bcryptjs |

---

## 🚀 Puesta en Marcha

### 1. Instalación de Dependencias
```bash
pnpm install
```

### 2. Variables de Entorno (`.env`)
Configura tu cadena de conexión a PostgreSQL en Neon:
```env
DATABASE_URL="postgresql://usuario:password@ep-holy-darkness-bbl6k1wf-pooler.c-15.us-east-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=30"
SESSION_SECRET="clave_secreta_de_al_menos_32_caracteres_aleatorios"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 3. Sincronización y Poblamiento de Base de Datos
```bash
# Sincronizar esquema Prisma con Neon
pnpm run db:push

# Poblar datos demo iniciales (Admin, Operador, Cliente demo, Reglas y Recompensas)
pnpm run db:seed
```

### 4. Pruebas Automatizadas
```bash
pnpm tsx tests/business-logic.test.ts
```

### 5. Compilación y Ejecución
```bash
# Modo Desarrollo
pnpm run dev

# Compilación de Producción
pnpm run build
pnpm run start
```

---

## 🔑 Credenciales Demo de Acceso (Portal Unificado `/ingresar`)

El sistema cuenta con **un único punto de acceso inteligente** en `/ingresar` para todos los roles:

| Rol | Identificador (Celular, Correo o Usuario) | Credencial (PIN o Clave) | Dashboard de Redirección Automática |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@transportclub.pe` o `admin` | `Admin@2024!` | `/admin` |
| **Personal Operativo** | `operador@transportclub.pe` o `operador` | `Staff@2024!` | `/personal` |
| **Cliente VIP** | `999000001` | PIN `1234` | `/cliente` |

---

## 📂 Estructura de Rutas del Proyecto

```
/
├── /registro                   # Registro público de clientes
├── /ingresar                   # Portal Único de Inicio de Sesión (Todos los roles)
├── /recuperar-pin              # Recuperación de PIN
├── /terminos                   # Términos y condiciones
├── /privacidad                 # Política de privacidad (Ley 29733)
│
├── /cliente                    # Dashboard principal del cliente
│   ├── /mi-qr                  # Código QR y credencial digital
│   ├── /mis-puntos             # Historial y saldos de puntos
│   ├── /historial              # Historial de viajes
│   ├── /recompensas            # Catálogo de premios y canje
│   ├── /canjes                 # Mis canjes y códigos de entrega
│   └── /perfil                 # Datos personales y preferencias
│
├── /admin                      # Dashboard estadístico con Recharts
│   ├── /ingresar               # Acceso restringido para personal
│   ├── /clientes               # CRUD clientes, bloqueo y ajuste manual
│   ├── /servicios              # Bitácora de viajes
│   ├── /escanear               # Escáner QR y registro rápido
│   ├── /categorias             # Categorías de transporte
│   ├── /reglas-puntos          # Motor configurable de puntos + Simulador
│   ├── /recompensas            # Catálogo de premios
│   ├── /canjes                 # Aprobación/rechazo de solicitudes
│   ├── /reportes               # Exportación a Excel y CSV
│   ├── /usuarios               # Gestión de trabajadores internos
│   ├── /auditoria              # Bitácora de eventos
│   └── /configuracion          # Branding y datos de empresa
│
└── /personal                   # Terminal operativa de campo
    ├── /escanear               # Escaneo de pasajeros con cámara
    └── /servicios              # Servicios registrados por el operador
```
