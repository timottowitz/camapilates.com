#!/usr/bin/env python3
import csv
import os
import re
from urllib.parse import urlparse
from collections import defaultdict

CSV_PATH = '/Users/m3max361tb/Downloads/internal-links-camadepilates.com.csv'
BLOG_DIR = 'src/content/blog'

def extract_title(frontmatter, slug):
    m = re.search(r'^title:\s*(.+)$', frontmatter, re.MULTILINE)
    if m:
        raw = m.group(1).strip()
        val = raw.strip('\"\'')
        if val in ('>-', '>', '|', '|-'):
            after = frontmatter[m.end():]
            lines = []
            for line in after.splitlines():
                if line.startswith('  ') or line.startswith('\t'):
                    lines.append(line.strip())
                elif not line.strip():
                    continue
                else:
                    break
            if lines:
                val = ' '.join(lines).strip('\"\'')
        val = val.replace('[', '(').replace(']', ')')
        return val
    return slug.replace('-', ' ').title()

# Load all blog titles
titles = {}
for fname in os.listdir(BLOG_DIR):
    if fname.endswith('.md'):
        slug = fname[:-3]
        c = open(os.path.join(BLOG_DIR, fname), encoding='utf-8').read()
        parts = c.split('---', 2)
        if len(parts) >= 3:
            titles[slug] = extract_title(parts[1], slug)
        else:
            titles[slug] = slug.replace('-', ' ').title()

def get_target_path(url):
    return urlparse(url).path.rstrip('/')

def is_already_linked(body, target_path):
    pattern = r'\]\(' + re.escape(target_path) + r'[\)#\?]'
    return bool(re.search(pattern, body))

def get_forbidden_spans(body):
    spans = []
    # 1. Code blocks ```...```
    for m in re.finditer(r'```[\s\S]*?```', body):
        spans.append((m.start(), m.end()))
    # 2. Inline code `...`
    for m in re.finditer(r'`[^`\n]+`', body):
        spans.append((m.start(), m.end()))
    # 3. HTML tags <...>
    for m in re.finditer(r'<[^>]+>', body):
        spans.append((m.start(), m.end()))
    # 4. Existing markdown links [...](...)
    for m in re.finditer(r'\[[^\]]+\]\([^\)]+\)', body):
        spans.append((m.start(), m.end()))
    # 5. Headings #...
    for m in re.finditer(r'^\s*#{1,6}\s+.*$', body, re.MULTILINE):
        spans.append((m.start(), m.end()))
    return sorted(spans, key=lambda s: s[0])

def is_span_allowed(start, end, forbidden_spans):
    for f_start, f_end in forbidden_spans:
        if max(start, f_start) < min(end, f_end):
            return False
    return True

NATURAL_ANCHORS = {
    'reformer-casa-vs-profesional': ['cómo elegir el equipo ideal en México', 'elegir el equipo ideal', 'reformer casero silencioso', 'reformer casero', 'casa vs profesional', 'uso doméstico vs profesional', 'uso doméstico'],
    'mantenimiento-cama-de-pilates': ['mantenimiento y cuidado', 'mantenimiento básico', 'mantenimiento periódico', 'Limpieza diaria', 'Limpieza de rieles', 'mantenimiento', 'limpieza y cuidado', 'limpieza'],
    'mantenimiento-reformer-pilates': ['mantenimiento del Reformer', 'mantenimiento', 'inspección periódica', 'cuidado'],
    'cama-de-pilates-venta-mexico': ['Fabricación Nacional', 'camas de Pilates Reformer', 'venta de camas', 'venta en México', 'ahorro significativo a largo plazo', 'esta inversión', 'mercado mexicano', 'en México'],
    'ejercicios-pilates-en-la-cama': ['ejercicios básicos', 'qué ejercicios comenzar', 'ejercicios de Pilates en cama', 'ejercicios en la cama', 'ejercicios de Pilates', 'rutina inicial', 'ejercicios'],
    'beneficios-pilates-en-cama': ['beneficios para la salud', 'la eficacia del método Pilates', 'beneficios del Pilates en cama', 'beneficios científicamente comprobados', 'beneficios'],
    'cama-de-pilates-reformer': ['cómo funciona', 'cama de Pilates Reformer', 'cama Pilates Reformer', 'cama de Pilates', 'cama Pilates'],
    'cama-de-pilates-guia-de-compra': ['guía definitiva de compra', 'guía de compra', 'decisión de compra', 'comprar una cama', 'comprar un Reformer'],
    'estudios-pilates-reformer': ['estudios de Pilates Reformer', 'estudios de Pilates', 'estudio de Pilates', 'estudios boutique', 'estudios', 'estudio'],
    'pilates-para-embarazo': ['mujer embarazada', 'embarazadas', 'embarazada', 'embarazo'],
    'pilates-reformer-para-espalda': ['dolor de espalda', 'columna lumbar', 'molestias de espalda', 'aliviar tensión en la espalda'],
    'reformer-vs-cadillac': ['Reformer vs Cadillac', 'Cadillac', 'aditamentos de media torre o Cadillac'],
    'reformer-vs-mat-pilates': ['sobre el Mat', 'tapete (*mat*)', 'tapete (mat)', 'tapete (Mat)', 'Mat Pilates', 'tapete'],
    'financiacion-cama-de-pilates': ['Meses Sin Intereses', 'financiamiento', 'planes de pago', 'esquemas de financiamiento'],
    'principios-alineacion-pilates': ['alineación de piernas', 'alineación postural', 'principios fundamentales', 'precisión y control'],
    'mejor-cama-de-pilates-para-casa': ['cama de Pilates para casa', 'Reformer para casa', 'en casa', 'para casa'],
    'mejor-cama-de-pilates-profesional': ['cama de Pilates profesional', 'Reformer profesional', 'uso comercial', 'profesional'],
    'mejores-marcas-cama-de-pilates': ['marcas líderes en México', 'marcas de cama de Pilates', 'marcas mexicanas', 'marcas disponibles'],
    'dimensiones-cama-de-pilates': ['espacio mínimo requerido', 'espacio mínimo', 'medidas y espacio', 'dimensiones', 'espacio necesario'],
    'cama-de-pilates-barata': ['cama de Pilates barata', 'cama de Pilates económica', 'cama económica', 'modelos accesibles', 'gama básica'],
    'cama-de-pilates-segunda-mano': ['de segunda mano', 'segunda mano', 'usada', 'usadas'],
    'reformer-compacto': ['modelo plegable o compacto', 'formato compacto', 'diseño compacto', 'espacios reducidos'],
    'accesorios-cama-de-pilates': ['accesorios esenciales', 'accesorios básicos', 'accesorios clave', 'accesorios'],
    'cama-de-pilates-plegable': ['reformer plegable', 'camas plegables', 'modelos plegables', 'plegables', 'plegable'],
    'pilates-reformer-cerca-de-mi': ['cerca de ti', 'estudios cercanos', 'estudio cercano'],
    'comunidad-pilates-mexicana': ['comunidad de Pilates', 'comunidad mexicana', 'instructores en México'],
    'para-que-sirve-pilates-en-cama': ['por qué es efectiva', 'para qué sirve'],
    'pilates-para-golf': ['jugadores de golf', 'golfistas', 'golf'],
    'pilates-para-tenistas': ['jugadores de tenis', 'tenistas', 'tenis'],
    'pilates-para-deportistas-de-alto-rendimiento': ['deportistas de alto rendimiento', 'atletas', 'alto rendimiento'],
    'calcetines-para-pilates-reformer': ['calcetines antideslizantes', 'calcetines para pilates', 'calcetines'],
}

def link_in_body(body, target_path, anchor, sentence):
    forbidden = get_forbidden_spans(body)

    # 1. Try exact anchor in body
    if anchor and len(anchor) > 2:
        for m in re.finditer(re.escape(anchor), body):
            start, end = m.span()
            if is_span_allowed(start, end, forbidden):
                clean_text = body[start:end].strip().replace('[', '(').replace(']', ')')
                return body[:start] + f'[{clean_text}]({target_path})' + body[end:]

    # 2. Try matching keywords inside provided sentence if available
    target_slug = target_path.split('/')[-1]
    candidates = list(NATURAL_ANCHORS.get(target_slug, []))
    slug_words = [w for w in target_slug.split('-') if len(w) > 3 and w not in ('para', 'sobre', 'como', 'entre', 'mexico', 'pilates', 'cama')]
    candidates.extend(slug_words)

    if sentence:
        sent_sub = sentence.strip()[:35]
        sent_pos = body.find(sent_sub)
        if sent_pos != -1:
            sent_chunk = body[sent_pos:sent_pos + len(sentence) + 40]
            for cand in candidates:
                if len(cand) < 4: continue
                cand_re = r'\b' + re.escape(cand) + r'\b'
                m = re.search(cand_re, sent_chunk, re.IGNORECASE)
                if m:
                    actual_start = sent_pos + m.start()
                    actual_end = sent_pos + m.end()
                    if is_span_allowed(actual_start, actual_end, forbidden):
                        matched_text = body[actual_start:actual_end].replace('[', '(').replace(']', ')')
                        return body[:actual_start] + f'[{matched_text}]({target_path})' + body[actual_end:]

    # 3. Try candidates across entire body (first allowed match)
    for cand in candidates:
        if len(cand) < 4: continue
        cand_re = r'\b' + re.escape(cand) + r'\b'
        for m in re.finditer(cand_re, body, re.IGNORECASE):
            start, end = m.span()
            if is_span_allowed(start, end, forbidden):
                matched_text = body[start:end].replace('[', '(').replace(']', ')')
                return body[:start] + f'[{matched_text}]({target_path})' + body[end:]

    return None

def add_editorial_fallback_link(body, target_path, target_title):
    clean_title = target_title.replace('[', '(').replace(']', ')')
    callout = f'\n\n> 💡 **Lectura recomendada:** [{clean_title}]({target_path})\n'
    if target_path in body:
        return body
    if '\n## FAQ' in body:
        return body.replace('\n## FAQ', callout + '\n## FAQ', 1)
    elif '\n## ' in body:
        parts = body.rsplit('\n## ', 1)
        return parts[0] + callout + '\n## ' + parts[1]
    else:
        return body + callout

def process_all_blogs(dry_run=False):
    with open(CSV_PATH, mode='r', encoding='utf-8') as f:
        all_rows = list(csv.DictReader(f))

    blog_rows = [r for r in all_rows if urlparse(r['source']).path.startswith('/blog/')]
    print(f'Total blog rows: {len(blog_rows)}')

    applied = 0
    already = 0
    fallbacks = 0
    errors = 0

    by_file = defaultdict(list)
    for r in blog_rows:
        slug = urlparse(r['source']).path.replace('/blog/', '').split('#')[0].rstrip('/')
        by_file[slug].append(r)

    for slug, file_rows in by_file.items():
        md_path = os.path.join(BLOG_DIR, f'{slug}.md')
        if not os.path.exists(md_path):
            print(f'Missing markdown file for slug: {slug}')
            errors += len(file_rows)
            continue

        raw_content = open(md_path, encoding='utf-8').read()
        parts = raw_content.split('---', 2)
        if len(parts) < 3:
            print(f'Invalid frontmatter in {slug}.md')
            errors += len(file_rows)
            continue

        frontmatter = parts[1]
        body = parts[2]
        initial_body = body

        for r in file_rows:
            target_path = get_target_path(r['target'])
            target_slug = target_path.split('/')[-1]
            if target_path == f'/blog/{slug}':
                continue # self link

            if is_already_linked(body, target_path):
                already += 1
                continue

            anchor = r['anchor'].strip()
            sentence = r['sentence'].strip()

            new_body = link_in_body(body, target_path, anchor, sentence)
            if new_body and new_body != body:
                body = new_body
                applied += 1
            else:
                target_title = titles.get(target_slug, target_slug.replace('-', ' ').title())
                body = add_editorial_fallback_link(body, target_path, target_title)
                fallbacks += 1

        if body != initial_body and not dry_run:
            new_content = f'---{frontmatter}---{body}'
            with open(md_path, 'w', encoding='utf-8') as out_f:
                out_f.write(new_content)

    print(f'Finished! Inline linked: {applied}, Editorial fallbacks: {fallbacks}, Already linked: {already}, Errors: {errors}')

if __name__ == '__main__':
    import sys
    dry = '--dry-run' in sys.argv
    process_all_blogs(dry_run=dry)
