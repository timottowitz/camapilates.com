
/**
 * Test script for prompt generation logic
 * Simulates the buildPromptFromContext function from convex/placeholderGeneration.ts
 */

function buildPromptFromContext(p) {
    const parts = [];
    const isHero = p.location === 'hero' || p.location === 'featured';

    // Context building
    if (p.headingAbove) parts.push(`Heading: ${p.headingAbove}`);
    if (p.contextBefore) parts.push(`Context: ${p.contextBefore}`);
    if (p.altText) parts.push(`Subject focus: ${p.altText}`);

    const base = parts.join('\n');
    const style = p.preferredStyle || 'professional';
    const subjects = Array.isArray(p.requiredSubjects) && p.requiredSubjects.length ? `Subjects: ${p.requiredSubjects.join(', ')}` : '';
    const framing = p.preferredAspectRatio || '16:9';

    // Specific directives based on location
    const role = isHero
        ? 'Create a single, powerful "Hero" image that summarizes the entire theme of the article. It should be symbolic, atmospheric, and visually striking.'
        : 'Create a specific, illustrative image that visually explains the section content. It should be literal, detailed, and directly related to the text provided.';

    return [
        'Role: Director of Photography for CAMA Pilates (Premium Mexican Brand).',
        `Task: ${role}`,
        'Style: Hyper-realistic photography, 8k resolution, highly detailed.',
        'Setting: Modern, high-end Pilates studio in Mexico (warm lighting, wood accents, clean lines).',
        'Constraints: NO TEXT, NO LOGOS, NO WATERMARKS. Avoid distorted anatomy.',
        `Technical: Aspect Ratio ${framing}. Style: ${style}. ${subjects}`,
        '--- INPUT CONTEXT ---',
        base,
        '--- END CONTEXT ---',
        'Output: Provide ONLY the detailed image generation prompt.'
    ].join('\n');
}

// Test Cases
const heroCase = {
    location: 'hero',
    headingAbove: 'Beneficios del Pilates Reformer',
    contextBefore: 'El Pilates Reformer es una de las formas más efectivas de ejercicio...',
    altText: 'Mujer sonriendo en reformer',
    preferredStyle: 'lifestyle',
    requiredSubjects: ['mujer', 'reformer'],
    preferredAspectRatio: '16:9'
};

const inlineCase = {
    location: 'inline-1',
    headingAbove: 'Mejora tu postura',
    contextBefore: 'Al fortalecer el core, el reformer ayuda a alinear la columna...',
    altText: 'Detalle de espalda recta',
    preferredStyle: 'technical',
    requiredSubjects: ['espalda', 'columna'],
    preferredAspectRatio: '4:3'
};

console.log('--- HERO PROMPT ---');
console.log(buildPromptFromContext(heroCase));
console.log('\n--- INLINE PROMPT ---');
console.log(buildPromptFromContext(inlineCase));
