-- NOVU 360 HUB - SUPABASE SETUP v2
-- Limpio, optimizado y sin errores de columnas
-- Estructura de 15 tablas personalizada

-- EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. usuarios
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. usuario_roles
CREATE TABLE IF NOT EXISTS public.usuario_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    rol TEXT CHECK (rol IN ('admin', 'account', 'ventas', 'ads', 'community', 'seo', 'web', 'finanzas')),
    UNIQUE(usuario_id, rol)
);

-- 3. clientes
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_negocio TEXT NOT NULL,
    giro TEXT,
    telefono TEXT,
    email TEXT,
    instagram TEXT,
    estado TEXT DEFAULT 'activo',
    fecha_inicio DATE,
    account_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. expediente
CREATE TABLE IF NOT EXISTS public.expediente (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE UNIQUE,
    brief TEXT,
    tono_voz TEXT,
    identidad_visual TEXT,
    historial_campanas TEXT,
    notas TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. leads
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_negocio TEXT NOT NULL,
    instagram TEXT,
    telefono TEXT,
    estado TEXT DEFAULT 'nuevo',
    vendedor_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. tareas
CREATE TABLE IF NOT EXISTS public.tareas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    area TEXT,
    descripcion TEXT,
    estado TEXT DEFAULT 'pendiente',
    responsable_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    fecha_limite DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. aprobaciones
CREATE TABLE IF NOT EXISTS public.aprobaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    area TEXT,
    tipo_entregable TEXT,
    archivo_url TEXT,
    estado TEXT DEFAULT 'pendiente',
    notas_rechazo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. contratos
CREATE TABLE IF NOT EXISTS public.contratos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    monto_mensual DECIMAL(12,2),
    fecha_inicio DATE,
    fecha_vencimiento DATE,
    estado TEXT DEFAULT 'activo',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. pagos
CREATE TABLE IF NOT EXISTS public.pagos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    contrato_id UUID REFERENCES public.contratos(id) ON DELETE SET NULL,
    monto DECIMAL(12,2),
    fecha_pago TIMESTAMPTZ,
    estado TEXT DEFAULT 'pendiente',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. portal_cliente
CREATE TABLE IF NOT EXISTS public.portal_cliente (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE UNIQUE,
    token_acceso TEXT UNIQUE,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. mensajes_portal
CREATE TABLE IF NOT EXISTS public.mensajes_portal (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portal_id UUID REFERENCES public.portal_cliente(id) ON DELETE CASCADE,
    remitente TEXT, -- 'staff' | 'cliente'
    mensaje TEXT NOT NULL,
    leido BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. metricas
CREATE TABLE IF NOT EXISTS public.metricas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    area TEXT,
    periodo TEXT,
    datos JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. notificaciones
CREATE TABLE IF NOT EXISTS public.notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    tipo TEXT,
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    referencia_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. cerebro_conocimiento
CREATE TABLE IF NOT EXISTS public.cerebro_conocimiento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    area TEXT,
    capa TEXT,
    contenido TEXT NOT NULL,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. templates_web
CREATE TABLE IF NOT EXISTS public.templates_web (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    captura_url TEXT,
    link_referencia TEXT,
    notas TEXT,
    tags TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HABILITAR RLS EN TODAS LAS TABLAS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expediente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aprobaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes_portal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metricas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cerebro_conocimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates_web ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS BÁSICAS (Acceso total para autenticados en modo desarrollo)
-- Se recomienda ajustar según sea necesario para producción
DO $$ 
DECLARE 
    t TEXT;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Enable access for all authenticated users" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Enable access for all authenticated users" ON public.%I FOR ALL USING (auth.role() = ''authenticated'')', t);
    END LOOP;
END $$;

-- FUNCIÓN PARA MANEJAR NUEVOS USUARIOS DE AUTH
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nombre)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', 'Nuevo Usuario'));
  
  -- Rol por defecto: ventas (o según necesites)
  INSERT INTO public.usuario_roles (usuario_id, rol)
  VALUES (new.id, 'admin'); -- Asignamos admin por defecto para desarrollo o cambiar según necesites

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TRIGGER AUTOMÁTICO
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
