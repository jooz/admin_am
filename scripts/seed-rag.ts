import 'dotenv/config';
import { indexDocument } from '../src/lib/indexDocument';
import { prisma } from '../src/lib/prisma';

async function seed() {
  console.log('Iniciando indexación de contenido estático...');

  // 1. Info del Alcalde (basado en app/alcaldia/alcalde/page.tsx)
  const alcaldeContent = `
    Alcalde del Municipio Miranda: Dr. Henry Hernández.
    Formación Académica: 
    - Magister Universidad Scientiarum en Micología (2012), Universidad Nacional Experimental Francisco de Miranda.
    - Inmunología Experimental, Universidad Central de Venezuela.
    Experiencia Laboral:
    - Docente universitario en ciencias de la salud (Microbiología, etc).
    - Responsable de Consejo Bolivariano Estadal de Salud.
    - Responsable del Plan de Formación de Medicina Integral Comunitaria.
    - Responsable de la Fundación Misión Barrio Adentro Estado Falcón.
    - Director del Hospital Universitario de Coro.
    - Viceministro de Recursos, Tecnología y Regulación del Ministerio del Poder Popular para la Salud.
    - Autoridad Única de Salud y Jefe del Gabinete Social en Estado Falcón.
    - Secretario General de Gobierno de la Gobernación del Estado Falcón.
    - Integrante de la Junta Directiva Nacional de los Seguros Sociales.
    Trayectoria Política: Integrante fundador de la Juventud del PSUV en el Estado Falcón.
    Comprometido con el desarrollo sustentable y social del Municipio Miranda.
  `;
  await indexDocument(alcaldeContent, 'alcalde');
  console.log('✅ Info del Alcalde indexada.');

  // 2. Directivos (basado en app/alcaldia/organigrama/page.tsx)
  const directivos = [
    { name: 'Luis Gerardo Chávez Noroño', role: 'Director del Despacho del Alcalde', bio: 'Abogado con experiencia en gestión pública y administración tributaria.' },
    { name: 'Cruz Hernández', role: 'Presidenta del Instituto Municipal de Patrimonio', bio: 'Promueve la preservación del patrimonio histórico y cultural del municipio.' },
    { name: 'Rosalymar Romero', role: 'Jefa de la Oficina de Talento Humano', bio: 'Abogada experta en gestión administrativa y desarrollo del capital humano.' },
    { name: 'Lidiberlis Colina', role: 'Directora de Protección Civil', bio: 'Coordina prevención, atención y gestión de riesgos ante emergencias.' },
    { name: 'Inés Lourdes Yánez García', role: 'Presidenta del Consejo Municipal de Derechos del Niño, Niña y Adolescente', bio: 'Protección integral de la infancia y adolescencia.' },
    { name: 'Karliana José García Cumare', role: 'Secretaria de Hacienda', bio: 'Doctora en Ciencias Gerenciales, experta en gerencia financiera pública.' },
    { name: 'Jaires Noroño', role: 'Secretario de Ambiente / Plan Miranda sin Botes', bio: 'Ingeniero encargado del desarrollo sostenible y drenajes.' },
    { name: 'Baldemar García Medina', role: 'Secretario de Desarrollo Agrícola, Pecuario y Pesquero', bio: 'Impulso de la economía local y soberanía alimentaria.' },
    { name: 'Rómulo Alirio Hernández Hernández', role: 'Secretario Territorial', bio: 'Articulación entre la alcaldía y el poder popular.' },
    { name: 'José David Pernalete Jiménez', role: 'Síndico Procurador Municipal', bio: 'Defensa jurídica de los intereses del municipio.' },
    { name: 'Jhoan Moreno', role: 'Secretario Político', bio: 'Articulación con fuerzas sociales y proyecto bolivariano.' },
    { name: 'Pablo José García Valera', role: 'Secretario de Seguridad Ciudadana', bio: 'Especialista en gerencia pública y derechos humanos.' },
    { name: 'Juan Carlos Jiménez', role: 'Presidente del Instituto Municipal de Tránsito y Transporte', bio: 'Regulación del tránsito y movilidad urbana.' },
    { name: 'Elis Manuel Romero Bonalde', role: 'Superintendente Tributario', bio: 'Responsable de recaudación y fiscalización de tributos.' },
    { name: 'Eduardo José Polanco', role: 'Director General del Cuerpo Policial Bolivariano', bio: 'Prevención del delito y protección ciudadana.' },
    { name: 'Reynni José Bonaldes Romero', role: 'Presidente del Instituto municipal de Hábitat', bio: 'Ingeniero civil, desarrollo urbano y vivienda.' },
    { name: 'Johan Oviedo', role: 'Presidente de FONDESMIRANDA', bio: 'Fondo de Desarrollo del Municipio Miranda, apoyo a iniciativas productivas.' },
    { name: 'Bita Margarita Sivira', role: 'Secretaria de Bienestar Social', bio: 'Doctora en Educación, atención integral a comunidades.' },
    { name: 'Edgar Partidas', role: 'Presidente del Terminal de Pasajeros Polica Salas', bio: 'Administración del principal terminal terrestre.' },
    { name: 'María Auxiliadora Amaya', role: 'Presidenta del Instituto Autónomo de Cementerios', bio: 'Servicios dignos y ordenados de cementerios.' },
    { name: 'Douglas Raúl Pérez Bravo', role: 'Presidente del Instituto Autónomo Matadero Industrial', bio: 'Médico cirujano, seguridad alimentaria y procesos sanitarios.' }
  ];

  for (const dir of directivos) {
    const content = `Directivo: ${dir.name}. Cargo: ${dir.role}. Biografía: ${dir.bio}`;
    await indexDocument(content, 'directivo', dir.name.replace(/\s+/g, '-').toLowerCase());
  }
  console.log(`✅ ${directivos.length} directivos indexados.`);

  // 3. Indexar noticias existentes (Opcional pero recomendado ahora)
  const news = await prisma.news.findMany({ select: { id: true, title: true, content: true } });
  for (const article of news) {
    const contentLine = `Noticia: ${article.title}. Contenido: ${article.content}`;
    await indexDocument(contentLine, 'noticia', article.id);
  }
  console.log(`✅ ${news.length} noticias existentes indexadas.`);

  console.log('Semillero RAG completado.');
}

seed().catch(console.error).finally(() => prisma?.$disconnect?.());
