# CAMA Pilates Blog Planning System

## Sistema de Organización de Contenido

Este sistema garantiza la producción organizada y de alta calidad de contenido para el blog de CAMA Pilates, enfocado en el mercado mexicano de Pilates.

## 📁 Estructura de Archivos

```
blog-planning/
├── README.md                 # Este archivo - instrucciones del sistema
├── BLOG_TODO.md             # Lista principal de blogs por escribir
└── research/                # Carpeta de investigación
    ├── [topic-name].md      # Archivos de investigación individual
    ├── ejercicios-pilates-madres-lactantes.md
    ├── guia-completa-reformer.md
    └── [more research files...]
```

## 🔄 Flujo de Trabajo

### 1. Verificación Obligatoria
**ANTES de escribir CUALQUIER blog post**, el agente DEBE:
- Leer `BLOG_TODO.md` completamente
- Identificar el siguiente post en la cola de prioridad
- Verificar que tiene status 🔬 (research needed)

### 2. Fase de Investigación
**NUNCA escribir un blog sin investigación completa**

1. Abrir el archivo de investigación correspondiente en `/research/`
2. Completar TODAS las secciones marcadas en el archivo
3. Escribir mínimo 1000 palabras de contenido de investigación
4. Incluir:
   - Información científica/médica relevante
   - Contexto del mercado mexicano
   - Keywords para SEO
   - Fuentes y referencias
   - Estructura sugerida para el blog final
5. Cambiar status en `BLOG_TODO.md` de 🔬 a 📝

### 3. Fase de Escritura
**Solo cuando la investigación esté marcada como 📝**

1. Usar la investigación como base fundamental
2. Seguir la estructura sugerida en el archivo de investigación
3. Escribir 1500-2500 palabras
4. Incluir elementos obligatorios:
   - Frontmatter correcto (title, description, category, tags, publishDate, author, slug)
   - Keywords optimizadas para México
   - CTAs hacia productos CAMA Pilates
   - Shortcodes apropiados: `<see-also />`, `<hub-list />` según contexto
   - FAQ section (## FAQ) para structured data automático
   - Enlaces internos relevantes
5. Guardar en `/src/content/blog/[slug].md`
6. Cambiar status en `BLOG_TODO.md` de 📝 a ✅

### Shortcodes Disponibles
- `<see-also limit="3" />` - Enlaces relacionados automáticos
- `<hub-list category="Guías de compra" limit="5" title="Más guías" />` - Listas filtradas
- `<audio-story audioUrl="url" title="title" description="desc" />` - Componente audio
- `<shoprocket-button product="prod_xxx" pk="sr_live_pk_xxx" />` - Botón compra

## 📋 Status Codes

| Emoji | Significado | Acción Requerida |
|-------|-------------|------------------|
| 🔬 | Research needed | Completar investigación |
| 📝 | Research complete, ready to write | Escribir blog post |
| ✅ | Blog post completed | Ninguna - post terminado |
| 🚫 | Skipped/Not relevant | Ninguna - topic descartado |

## 🎯 Prioridades de Contenido

### Alta Prioridad (Escribir Primero)
1. **Tips para Instructores** - Audiencia profesional engaged
2. **Guía completa del Reformer** - Directamente vende productos CAMA
3. **Equipos y mantenimiento** - Soporte a clientes existentes

### Media Prioridad
1. **Entrenamientos y bienestar** - Audiencia general amplia
2. **Pilates para rehabilitación** - Nicho especializado valioso

### Baja Prioridad
1. **Comunidad Pilates** - Importante pero no urgente
2. **Hacer crecer negocio** - Audiencia más pequeña

## ✅ Checklist Pre-Escritura

Antes de comenzar un blog post, verificar:

- [ ] ¿Leí completamente `BLOG_TODO.md`?
- [ ] ¿Identifiqué el post con mayor prioridad marcado como 🔬?
- [ ] ¿Existe el archivo de investigación correspondiente?
- [ ] ¿El archivo de investigación está completamente lleno (1000+ palabras)?
- [ ] ¿La investigación incluye contexto mexicano específico?
- [ ] ¿Tengo las keywords principales identificadas?
- [ ] ¿Entiendo cómo conectar este topic con productos CAMA Pilates?

## ✅ Checklist Post-Escritura

Después de completar un blog post:

- [ ] ¿El post tiene 1500-2500 palabras?
- [ ] ¿Incluye frontmatter completo y correcto (title, description, category, tags, publishDate, author, slug)?
- [ ] ¿Tiene estructura clara con H2 y H3?
- [ ] ¿Incluye shortcodes apropiados (`<see-also />`, `<hub-list />` según contexto)?
- [ ] ¿Incluye CTAs hacia productos CAMA Pilates?
- [ ] ¿Tiene sección FAQ (## FAQ) para structured data automático?
- [ ] ¿Enlaces internos a otros posts relevantes?
- [ ] ¿Keywords optimizadas para mercado mexicano?
- [ ] ¿Actualicé el status en BLOG_TODO.md a ✅?

## 🔗 Conexiones con CAMA Pilates

Cada blog post DEBE incluir al menos uno de estos elementos:

### CTAs Directos
- "Conoce nuestros Reformers de calidad premium"
- "Agenda una demostración de nuestro Reformer"
- "Ve nuestros precios y financiamiento"

### Enlaces de Producto
- `/product/reformer-profesional` - Para estudios
- `/product/reformer-casa` - Para uso doméstico
- `/packs/estudio` - Para compras múltiples
- `/store` - Catálogo general

### Menciones de Diferenciadores
- Ingeniería alemana + manufactura mexicana
- Materiales premium (cuero, nogal, acero)
- Garantía 3 años y servicio en español
- Entrega 5-7 días desde CDMX

## 🚨 Errores Comunes a Evitar

1. **Escribir sin investigar** - NUNCA saltarse la fase de investigación
2. **Posts múltiples simultáneos** - Solo UN post a la vez
3. **Ignorar el contexto mexicano** - Siempre incluir perspectiva local
4. **Olvidar CTAs** - Cada post debe conectar con productos CAMA
5. **No actualizar status** - Mantener BLOG_TODO.md actualizado
6. **Investigación superficial** - Mínimo 1000 palabras de investigación
7. **Ignorar SEO** - Keywords específicas para México obligatorias

## 📊 Métricas de Éxito

### Para Investigación
- Mínimo 1000 palabras de contenido
- Al menos 5 fuentes confiables
- Contexto mexicano específico incluido
- Keywords identificadas y documentadas

### Para Blog Posts
- 1500-2500 palabras publicadas
- Estructura clara y legible
- CTAs efectivos hacia productos CAMA
- SEO optimizado para mercado mexicano

## 🆘 FAQ del Sistema

### ¿Qué pasa si no hay archivo de investigación para un topic?
Crear el archivo siguiendo el template de los existentes antes de continuar.

### ¿Puedo escribir sobre un topic no listado en BLOG_TODO.md?
No. Primero agregar el topic al TODO list con su archivo de investigación correspondiente.

### ¿Qué hago si la investigación revela que un topic no es relevante?
Marcar como 🚫 en BLOG_TODO.md y continuar con el siguiente en la lista.

### ¿Cuánto tiempo debe tomar cada fase?
- Investigación: 3-5 horas por topic
- Escritura: 2-3 horas por blog post
- Total: 5-8 horas por blog completo

---

**Recuerda**: La calidad sobre cantidad. Es mejor tener pocos blogs excelentes que muchos blogs mediocres.

---

## 🤖 Agents del Sistema

### Blog Writer Agent
Para creación autónoma de blogs:
```bash
Task: "Write next priority blog post using established patterns"
Agent: general-purpose
```

### Book Research Agent
Para descubrir temas únicos desde conocimiento experto:
```bash
Task: "Discover unique blog topics from books_MD knowledge base"
Agent: general-purpose
```

Consulta `SYSTEM_INSTRUCTIONS.md` para instrucciones completas de uso.

**Última actualización**: 2025-09-26