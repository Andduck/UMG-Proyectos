/* =========================================
   Inicialización AOS
   ========================================= */
AOS.init({
    duration: 800,
    once: true,
    offset: 80,
    easing: 'ease-out-cubic'
});

/* =========================================
   Navbar scroll effect
   ========================================= */
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
});

/* =========================================
   Cerrar menú móvil al hacer clic
   ========================================= */
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        const navCollapse = document.getElementById('navMenu');
        if (navCollapse.classList.contains('show')) {
            new bootstrap.Collapse(navCollapse).hide();
        }
    });
});

/* =========================================
   MODAL PDF - MÚLTIPLES DOCUMENTOS POR MARCA
   ========================================= */

/**
 * CONFIGURACIÓN DE DOCUMENTOS POR PLAN
 * ------------------------------------
 * Cada plan es un array de documentos.
 * Cada documento: { name: 'Nombre visible', file: 'ruta/al/pdf.pdf' }
 *
 * Edita libremente: agrega/quita documentos en cada array.
 */
const PLAN_DOCS = {
    plan1: [
        { name: 'Plan de Negocios', file: 'pdfs/plan1/Plan de Negocios, Krel´s.pdf' },
        { name: 'Información de Marca', file: 'pdfs/plan1/Información General de la Marca Krels.pdf' },
        { name: 'Despliegue Afiches', file: 'pdfs/plan1/Despliegue de Afiches Krels.pdf' },
    ],
    plan2: [
        { name: 'Plan de Negocios', file: 'pdfs/plan2/1. Plan de Negocios General (Business Plan) - Grupo No. 3 - Restaurante D_Lirios.pdf' },
        { name: 'Informe de Proyecto', file: 'pdfs/plan2/2. Informe Final de Proyecto de Inversión – Grupo No. 3 - Restaurante D’Lirios.pdf' },
        { name: 'Manual de Procedimientos Operativos', file: 'pdfs/plan2/3. Manual de Procedimientos Operativos Estandarizados -  SOP - POES - Restaurante D_Lirios.pdf' },
        { name: 'Manual de Procedimientos', file: 'pdfs/plan2/Manual de Procedimientos - Grupo No. 3 - Restaurante D_Lirios.pdf' },
        { name: 'Manual Puestos y Funciones', file: 'pdfs/plan2/Manual de Puestos y Funciones - Grupo No. 3 - Restaurante D_Lirios.pdf' },
        { name: 'Manual Salud y Seguridad', file: 'pdfs/plan2/Manual de Salud y Seguridad Ocupacional - Grupo No. 3 - Restaurante D_Lirios.pdf' },
        { name: 'Menú D´Lirios', file: 'pdfs/plan2/Menu.pdf' }
    ],
    plan3: [
        { name: 'Plan de Negocios', file: 'pdfs/plan3/Plan de Negocios Grafilab.02.pdf' },
        { name: 'Catálogo Afiches', file: 'pdfs/plan3/Catalogo de Afiches GRAFILAB.pdf' }
    ],
    plan4: [
        { name: 'Estrategia Comercial', file: 'pdfs/plan4/Guate Recicla.pdf' },
        { name: 'Contenido Final', file: 'pdfs/plan4/01_Contenido_Final_Guate_Recicla.pdf' }
    ]
};

const PLAN_NAMES = {
    plan1: 'MODA KREL´S',
    plan2: 'D´Lirios',
    plan3: 'GRAFILAB',
    plan4: 'Guate Recicla'
};

/* --- Referencias DOM --- */
const pdfModalEl = document.getElementById('pdfModal');
const pdfFrame = document.getElementById('pdfFrame');
const pdfTitle = document.getElementById('pdfTitle');
const pdfCurrentLbl = document.getElementById('pdfCurrentLabel');
const pdfCurrentDoc = document.getElementById('pdfCurrentDoc');
const pdfDownload = document.getElementById('pdfDownload');
const pdfOpenNew = document.getElementById('pdfOpenNew');
const pdfDocSelect = document.getElementById('pdfDocSelect');
const pdfPlanTabs = document.querySelectorAll('.pdf-tab');
const pdfModal = new bootstrap.Modal(pdfModalEl);

let currentPdfUrl = '';
let currentPlanKey = 'plan1';
let currentDocIdx = 0;

/* --- Construye el src apropiado según la ruta --- */
function buildViewerUrl(url) {
    if (!url || url === '#') return 'about:blank';
    const isHttp = /^https?:\/\//i.test(url);
    return isHttp ?
        `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true` :
        url;
}

/* --- Carga un documento específico de un plan --- */
function loadDocument(planKey, docIndex) {
    const docs = PLAN_DOCS[planKey] || [];
    const doc = docs[docIndex];
    if (!doc) return;

    currentPlanKey = planKey;
    currentDocIdx = docIndex;
    currentPdfUrl = doc.file;

    // Actualiza iframe
    pdfFrame.src = buildViewerUrl(doc.file);

    // Actualiza toolbar
    pdfTitle.textContent = PLAN_NAMES[planKey] || 'Plan de Negocio';
    pdfCurrentLbl.textContent = PLAN_NAMES[planKey] || '';
    pdfCurrentDoc.textContent = doc.name;

    // Botón descargar
    pdfDownload.href = doc.file;
    pdfDownload.setAttribute('download', `${PLAN_NAMES[planKey]} - ${doc.name}.pdf`);

    // Marca pestaña del plan activa
    pdfPlanTabs.forEach(t => t.classList.toggle('active', t.dataset.planKey === planKey));

    // Marca plan activo en el sidebar (para mostrar docs)
    document.querySelectorAll('.pdf-plan').forEach(p => {
        p.classList.toggle('active', p.dataset.planKey === planKey);
    });

    // Marca el documento activo dentro de la lista
    const planContainer = document.querySelector(`.pdf-plan[data-plan-key="${planKey}"]`);
    if (planContainer) {
        planContainer.querySelectorAll('.pdf-doc').forEach((btn, i) => {
            btn.classList.toggle('active', i === docIndex);
        });
    }

    // Actualiza select móvil
    if (pdfDocSelect) {
        pdfDocSelect.innerHTML = docs.map((d, i) =>
            `<option value="${i}" ${i === docIndex ? 'selected' : ''}>${d.name}</option>`
        ).join('');
    }
}

/* --- Renderiza la lista de documentos de cada plan --- */
function renderDocsLists() {
    document.querySelectorAll('.pdf-plan').forEach(planEl => {
        const planKey = planEl.dataset.planKey;
        const docs = PLAN_DOCS[planKey] || [];
        const listEl = planEl.querySelector('.pdf-docs-list');
        if (!listEl) return;

        listEl.innerHTML = docs.map((doc, i) => `
      <button class="pdf-doc" data-plan-key="${planKey}" data-doc-idx="${i}">
        <span class="doc-icon"><i class="bi bi-file-earmark-pdf"></i></span>
        <span class="doc-name">${doc.name}</span>
      </button>
    `).join('');

        // Eventos de cada documento
        listEl.querySelectorAll('.pdf-doc').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                loadDocument(btn.dataset.planKey, parseInt(btn.dataset.docIdx, 10));
            });
        });
    });
}

/* --- Abrir modal desde las tarjetas de planes --- */
document.querySelectorAll('.btn-plan').forEach(btn => {
    btn.addEventListener('click', () => {
        const planKey = btn.dataset.pdf;
        loadDocument(planKey, 0); // Abre el primer documento del plan
        pdfModal.show();
    });
});

/* --- Click en la pestaña del plan: despliega docs y carga el primero --- */
pdfPlanTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const planKey = tab.dataset.planKey;
        if (planKey === currentPlanKey) {
            // Si ya está activo, solo refresca el listado (toggle visual)
            return;
        }
        loadDocument(planKey, 0);
    });
});

/* --- Select móvil de documentos --- */
if (pdfDocSelect) {
    pdfDocSelect.addEventListener('change', (e) => {
        loadDocument(currentPlanKey, parseInt(e.target.value, 10));
    });
}

/* --- Abrir en nueva pestaña --- */
pdfOpenNew.addEventListener('click', () => {
    if (currentPdfUrl && currentPdfUrl !== '#') {
        window.open(currentPdfUrl, '_blank');
    }
});

/* --- Limpieza al cerrar --- */
pdfModalEl.addEventListener('hidden.bs.modal', () => {
    pdfFrame.src = 'about:blank';
});

/* --- Inicializa listas al cargar --- */
renderDocsLists();

/* =========================================
   Filtros de galería
   ========================================= */
const filterBtns = document.querySelectorAll('.filter-btn');
const galItems = document.querySelectorAll('.gal-item');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        galItems.forEach(item => {
            if (filter === 'all' || item.dataset.cat === filter) {
                item.classList.remove('hide');
                item.style.animation = 'fadeIn .5s ease';
            } else {
                item.classList.add('hide');
            }
        });
    });
});

/* =========================================
   Animación fadeIn galería
   ========================================= */
const style = document.createElement('style');
style.textContent = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}`;
document.head.appendChild(style);

/* =========================================
   Formulario de contacto (simulado)
   ========================================= */
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = contactForm.querySelectorAll('input, textarea, select');
    let valid = true;
    inputs.forEach(i => {
        if (!i.value.trim()) {
            valid = false;
            i.classList.add('is-invalid');
        } else {
            i.classList.remove('is-invalid');
        }
    });

    if (valid) {
        const btn = contactForm.querySelector('button[type=submit]');
        const original = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="bi bi-check-circle me-2"></i>¡Mensaje enviado!';
        setTimeout(() => {
            btn.innerHTML = original;
            btn.disabled = false;
            contactForm.reset();
        }, 2500);
    }
});

/* =========================================
   Back to top
   ========================================= */
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
    if (window.scrollY > 400) backToTop.classList.add('show');
    else backToTop.classList.remove('show');
});
backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* =========================================
   GALERÍA - Selector de marca (1 por vista)
   ========================================= */
const marcaBtns = document.querySelectorAll('.marca-btn');
const marcaGalerias = document.querySelectorAll('.marca-galeria');

marcaBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.marca;

        marcaBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        marcaGalerias.forEach(gal => {
            gal.classList.toggle('active', gal.dataset.galeria === target);
        });

        // Re-inicializa AOS por si hay animaciones pendientes
        if (window.AOS) AOS.refresh();
    });
});
/* =========================================
   SECCIÓN MARCA - Selector de proyecto
   ========================================= */

/**
 * DATOS DE CADA PROYECTO
 * ----------------------
 * Edita aquí el contenido de cada marca.
 */
const MARCAS_DATA = {
    cafe: {
        nombre: 'Moda KREL´S',
        logo: 'assets/planes/plan1.png',
        descripcion: 'Empresa dedicada a crear conjuntos de ropa modernos, cómodos y versátiles, combinando estilo, calidad y tendencias.',
        propuesta: 'Ofrecer café de especialidad cultivado por productores locales, combinando tradición artesanal con una experiencia moderna, cálida y sostenible en cada taza.',
        vision: 'Ser la cadena de cafeterías artesanales referente en Guatemala para 2030, reconocida por la calidad de su producto y su compromiso con los productores nacionales.',
        mision: 'Brindar a nuestros clientes una experiencia única en cada visita, ofreciendo café de la más alta calidad y generando valor para las comunidades cafetaleras del país.'
    },
    tech: {
        nombre: 'D´Lirios',
        logo: 'assets/planes/plan2.png',
        descripcion: 'Empresa dedicada a ofrecer comida saludable, fresca y nutritiva, combinando sabor y bienestar en cada platillo.',
        propuesta: 'Ofrecer menús saludables, nutritivos y gourmet, elaborados con ingredientes frescos y validados por profesionales en nutrición, que permitan a personas con enfermedades crónicas o que desean mejorar sus hábitos alimenticios disfrutar de comida deliciosa sin descuidar su salud.',
        vision: 'Ser el restaurante líder en Guatemala especializado en alimentación saludable con respaldo nutricional clínico, reconocido por su calidad, confianza y contribución a la prevención de enfermedades crónicas.',
        mision: 'Ofrecer a la población guatemalteca una experiencia gastronómica saludable, nutritiva y deliciosa, respaldada por profesionales, que contribuya al bienestar y calidad de vida de personas con enfermedades crónicas o que buscan mejorar sus hábitos alimenticios.'
    },
    eco: {
        nombre: 'GRAFILAB',
        logo: 'assets/planes/plan3.png',
        descripcion: 'Marca de ropa que combina moda, estilo y tendencias, ofreciendo prendas modernas para destacar con personalidad.',
        propuesta: 'Ofrecer ropa urbana personalizada, exclusiva y de edición limitada, inspirada en la música y la cultura pop, elaborada bajo pedido, con calidad, precios transparentes y atención cercana.',
        vision: 'Ser para 2031 una de las marcas de streetwear personalizado más reconocidas de Guatemala y Centroamérica, destacando por su creatividad, innovación y producción ágil.',
        mision: 'Permitir que los jóvenes expresen su identidad y pasión por la música, el cine y la cultura pop mediante prendas originales y personalizadas.'
    },
    salud: {
        nombre: 'Guate Recicla',
        logo: 'assets/planes/plan4.png',
        descripcion: 'Sistema comunitario de economía circular y puntos limpios',
        propuesta: 'Facilitar el reciclaje mediante educación ambiental, separación de residuos desde los hogares y dos Puntos Limpios comunitarios, promoviendo la participación de las familias de Paraíso II, zona 18.',
        vision: 'Convertirse en una iniciativa comunitaria sostenible que fortalezca los hábitos de reciclaje, aumente la recuperación de residuos y sirva como ejemplo de organización ambiental comunitaria.',
        mision: 'Fomentar la cultura del reciclaje y la educación ambiental mediante la participación comunitaria, facilitando la separación y recuperación de materiales reciclables.'
    }
};

/* --- Referencias DOM --- */
const proyectoBtns = document.querySelectorAll('.proyecto-btn');
const marcaContenido = document.getElementById('marcaContenido');
const marcaNombre = document.getElementById('marcaNombre');
const marcaDescripcion = document.getElementById('marcaDescripcion');
const marcaPropuesta = document.getElementById('marcaPropuesta');
const marcaVision = document.getElementById('marcaVision');
const marcaMision = document.getElementById('marcaMision');
const marcaLogo = document.getElementById('marcaLogo');
const marcaLogoImg = document.getElementById('marcaLogoImg');
const marcaLogoFallback = document.getElementById('marcaLogoFallback');

/* --- Renderiza los datos de una marca con animación --- */
function renderMarca(proyectoKey) {
    const data = MARCAS_DATA[proyectoKey];
    if (!data) return;

    // --- Fade out del contenido ---
    marcaContenido.classList.add('fade-out');

    // --- Animación de cambio de logo ---
    marcaLogo.classList.remove('changing');
    // Forzar reflow para reiniciar la animación
    void marcaLogo.offsetWidth;
    marcaLogo.classList.add('changing');

    setTimeout(() => {
        // --- Textos ---
        marcaNombre.textContent = data.nombre;
        marcaDescripcion.textContent = data.descripcion;
        marcaPropuesta.textContent = data.propuesta;
        marcaVision.textContent = data.vision;
        marcaMision.textContent = data.mision;

        // --- LOGO ---
        updateLogo(data.logo, data.nombre);

        // --- Fade in ---
        marcaContenido.classList.remove('fade-out');
    }, 200);

    // --- Botón activo ---
    proyectoBtns.forEach(b => {
        b.classList.toggle('active', b.dataset.proyecto === proyectoKey);
    });
}

/* --- Función dedicada para manejar el logo --- */
function updateLogo(logoUrl, altText) {
    // Quitar clase loaded para reiniciar la transición
    marcaLogoImg.classList.remove('loaded');

    if (!logoUrl) {
        // Sin ruta → mostrar fallback
        marcaLogo.classList.add('show-fallback');
        marcaLogoImg.src = '';
        marcaLogoImg.alt = altText || 'Logotipo';
        return;
    }

    // Si hay URL → intentar cargar
    marcaLogoImg.alt = altText || 'Logotipo';

    // Handler de éxito
    marcaLogoImg.onload = () => {
        marcaLogo.classList.remove('show-fallback');
        marcaLogoImg.classList.add('loaded');
    };

    // Handler de error → mostrar fallback si la imagen no existe
    marcaLogoImg.onerror = () => {
        marcaLogo.classList.add('show-fallback');
        marcaLogoImg.classList.remove('loaded');
    };

    // Asignar src (al final para que se disparen los handlers)
    marcaLogoImg.src = logoUrl;
}

/* --- Eventos del selector --- */
proyectoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        renderMarca(btn.dataset.proyecto);
    });
    /* --- Render inicial: muestra la primera marca al cargar --- */
    document.addEventListener('DOMContentLoaded', () => {
        renderMarca('cafe');
    });
});
/* =========================================
   GALERÍA - Tarjetas de marca + panel expandible
   ========================================= */

/**
 * FOTOS POR MARCA
 * ---------------
 * Cada marca tiene su propio array de fotos.
 * Cada foto: { src: 'ruta/imagen.jpg', titulo: 'Nombre visible' }
 *
 * Puedes poner cuantas fotos quieras en cada marca.
 * Si quieres dejar una marca sin fotos, deja el array vacío: []
 */
const GALERIA_DATA = {
    cafe: {
        nombre: 'Moda Kerl´s',
        descripcion: 'Piezas publicitarias',
        fotos: [
            { src: 'assets/galeria/imgmoda1.jpg', titulo: 'Post Instagram' },
            { src: 'assets/galeria/imgmoda2.jpg', titulo: 'Story Instagram' }
        ]
    },
    tech: {
        nombre: 'Restaruante D´Lirios',
        descripcion: 'Piezas publicitarias',
        fotos: [
            { src: 'assets/galeria/Banner.jpeg', titulo: 'recurso' },
            { src: 'assets/galeria/Post Facebook.jpeg', titulo: 'recurso' },
            { src: 'assets/galeria/Post Instagram.jpeg', titulo: 'recurso' },
            { src: 'assets/galeria/Story Instagram.jpeg', titulo: 'recurso' }
        ]
    },
    eco: {
        nombre: 'GRAFILAB',
        descripcion: 'Piezas publicitarias',
        fotos: [
            { src: 'assets/galeria/IMGGRAFI1.jpg', titulo: 'recurso' },
            { src: 'assets/galeria/IMGGRAFI2.jpg', titulo: 'recurso' },
            { src: 'assets/galeria/IMGGRAFI3.jpg', titulo: 'recurso' },
            { src: 'assets/galeria/IMGGRAFI4.jpg', titulo: 'recurso' }
        ]
    },
    salud: {
        nombre: 'Guate Recicla',
        descripcion: 'Piezas publicitarias',
        fotos: [
            { src: 'assets/galeria/imggt1.png', titulo: 'recurso' },
            { src: 'assets/galeria/imggt2.png', titulo: 'recurso' },
            { src: 'assets/galeria/imggt3.png', titulo: 'recurso' },
            { src: 'assets/galeria/imggt4.png', titulo: 'recurso' }
        ]
    }
};

/* --- Referencias DOM --- */
const marcaCardBtns = document.querySelectorAll('.marca-card-btn');
const galeriaExpandida = document.getElementById('galeriaExpandida');
const galeriaMarcaNom = document.getElementById('galeriaMarcaNombre');
const galeriaMarcaDesc = document.getElementById('galeriaMarcaDesc');
const galeriaFotosGrid = document.getElementById('galeriaFotosGrid');
const galeriaCloseBtn = document.getElementById('galeriaClose');

let marcaActualAbierta = null;

/* --- Renderiza las fotos de una marca --- */
function renderGaleriaFotos(marcaKey) {
    const data = GALERIA_DATA[marcaKey];
    if (!data) return;

    galeriaMarcaNom.textContent = data.nombre;
    galeriaMarcaDesc.textContent = data.descripcion;

    galeriaFotosGrid.innerHTML = '';

    if (!data.fotos || data.fotos.length === 0) {
        galeriaFotosGrid.innerHTML = `
      <div class="foto-item empty">
        <div class="foto-empty-msg">
          <i class="bi bi-images"></i>
          <span>Pronto publicaremos<br>las piezas de esta marca</span>
        </div>
      </div>
    `;
        return;
    }

    data.fotos.forEach(foto => {
        const div = document.createElement('div');
        div.className = 'foto-item';
        div.innerHTML = `
      <img src="${foto.src}" alt="${foto.titulo}" loading="lazy" />
      <span class="foto-item-label">${foto.titulo}</span>
    `;
        galeriaFotosGrid.appendChild(div);
    });
}

/* --- Abre la galería de una marca --- */
function abrirGaleriaMarca(marcaKey) {
    renderGaleriaFotos(marcaKey);
    galeriaExpandida.classList.add('open');

    // Marca la tarjeta activa
    marcaCardBtns.forEach(b => b.classList.toggle('active', b.dataset.marca === marcaKey));
    marcaActualAbierta = marcaKey;

    // Scroll suave hacia la galería (después de la animación de apertura)
    setTimeout(() => {
        const offset = galeriaExpandida.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top: offset, behavior: 'smooth' });
    }, 300);
}

/* --- Cierra la galería --- */
function cerrarGaleria() {
    galeriaExpandida.classList.remove('open');
    marcaCardBtns.forEach(b => b.classList.remove('active'));
    marcaActualAbierta = null;
}

/* --- Eventos --- */
marcaCardBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const marcaKey = btn.dataset.marca;

        // Si ya está abierta esa misma marca → cerrar
        if (marcaActualAbierta === marcaKey) {
            cerrarGaleria();
            return;
        }

        abrirGaleriaMarca(marcaKey);
    });
});

galeriaCloseBtn.addEventListener('click', cerrarGaleria);
