/*
  Editor de landing page, com campos dinâmicos conforme o template.
  Atualmente só há um template (SaaS), mas a estrutura já prevê múltiplos templates.
*/

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Repo } from '../../lib/repo';
import { defaultContent } from './defaultContent';
import saasDefault from '../templates/saas/data';
import d2cDefault from '../templates/d2c/data';
import eventoDefault from '../templates/evento/data';
import waitlistDefault from '../templates/waitlist/data';
import AppFooter from '../../components/AppFooter';

// Componente do editor de LP
export default function LandingPageEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const [lp, setLp] = useState(null);
  const [content, setContent] = useState(defaultContent);
  // Estado local para edição de texto livre
  const [featuresTextByIndex, setFeaturesTextByIndex] = useState({});

  // Carrega a LP do repositório
  useEffect(() => {
    const found = Repo.get('lps', id);
    if (!found) return nav('/lps');
    setLp(found);
    if (found.id_template === 'saas') {
      setContent(found.content ?? {});
      setFeaturesTextByIndex({});
    } else if (found.id_template === 'd2c') {
      setContent(found.content ?? {});
      setFeaturesTextByIndex({});
    } else if (found.id_template === 'evento') {
      setContent(found.content ?? {});
      setFeaturesTextByIndex({});
    } else {
      setContent(found.content ?? defaultContent);
      setFeaturesTextByIndex({});
    }
  }, [id, nav]);

  const onChange = (k, v) => setContent((prev) => ({ ...prev, [k]: v }));

  // Atualização por caminho
  const setIn = (obj, path, value) => {
    if (!Array.isArray(path) || !path.length) return obj;
    const [head, ...rest] = path;
    const clone = Array.isArray(obj) ? obj.slice() : { ...(obj || {}) };
    if (rest.length === 0) {
      clone[head] = value;
      return clone;
    }
    clone[head] = setIn(clone[head], rest, value);
    return clone;
  };
  const onChangePath = (path, value) =>
    setContent((prev) => setIn(prev || {}, path, value));

  const isSaaS = lp?.id_template === 'saas';
  const isD2C = lp?.id_template === 'd2c';
  const isEvento = lp?.id_template === 'evento';
  const isWaitlist = lp?.id_template === 'waitlist';

  // Helpers para UI do SaaS: ler valor com fallback do default, sem gravar no estado até editar
  const readPathValue = (obj, path) =>
    path.reduce(
      (acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined),
      obj,
    );

  const getTemplateValue = (templateDefault, path, fallback) => {
    const current = readPathValue(content, path);
    if (current !== undefined && current !== null) return current;
    const defaultValue = readPathValue(templateDefault, path);
    return defaultValue !== undefined ? defaultValue : fallback;
  };

  const getSaaSValue = (path, fallback) =>
    getTemplateValue(saasDefault, path, fallback);

  const getD2CValue = (path, fallback) =>
    getTemplateValue(d2cDefault, path, fallback);

  const getEventoValue = (path, fallback) =>
    getTemplateValue(eventoDefault, path, fallback);

  const getWaitlistValue = (path, fallback) =>
    getTemplateValue(waitlistDefault, path, fallback);

  const linesToArray = (text = '') =>
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

  const cloneArray = (arr) =>
    Array.isArray(arr)
      ? arr.map((item) =>
          typeof item === 'object' && item !== null ? { ...item } : item,
        )
      : [];

  const getWorkingArray = (prev, path, snapshot = []) => {
    const existing = readPathValue(prev, path);
    if (Array.isArray(existing)) return [...existing];
    return cloneArray(snapshot);
  };
  const onSave = () => {
    Repo.update('lps', id, { content });
    nav(`/preview/${id}`);
  };

  if (!lp) return null;

  if (isSaaS) {
    // Editor específico para SaaS
    const plansFromContent = Array.isArray(content?.pricing?.plans)
      ? content.pricing.plans
      : null;
    const plansDefault = getSaaSValue(['pricing', 'plans'], []);
    const plans = plansFromContent ?? plansDefault;

    const updatePricingField = (field, value) =>
      setContent((prev) => {
        const pricing = { ...(prev?.pricing || {}) };
        pricing[field] = value;
        return { ...(prev || {}), pricing };
      });

    const updatePlan = (index, field, value) =>
      setContent((prev) => {
        const pricing = { ...(prev?.pricing || {}) };
        const list = Array.isArray(pricing.plans) ? [...pricing.plans] : [];
        while (list.length <= index) list.push({});
        const current = { ...(list[index] || {}) };
        current[field] = value;
        list[index] = current;
        pricing.plans = list;
        return { ...(prev || {}), pricing };
      });

    const setPlanFeaturesText = (index, text) => {
      setFeaturesTextByIndex((prev) => ({ ...prev, [index]: text }));
      // Atualiza a estrutura salva (array), mas preserva a experiência do textarea via estado local
      const lines = text.split(/\r?\n/);
      // Mantém linhas não-vazias; não remove espaços internos
      const cleaned = lines.filter((line) => line.trim().length > 0);
      updatePlan(index, 'features', cleaned);
    };

    const addPlan = () =>
      setContent((prev) => {
        const pricing = { ...(prev?.pricing || {}) };
        const list = Array.isArray(pricing.plans) ? [...pricing.plans] : [];
        list.push({
          name: '',
          price: '',
          period: '',
          featured: false,
          features: [],
        });
        pricing.plans = list;
        return { ...(prev || {}), pricing };
      });

    const removePlan = (index) => {
      setContent((prev) => {
        const pricing = { ...(prev?.pricing || {}) };
        const list = Array.isArray(pricing.plans) ? [...pricing.plans] : [];
        list.splice(index, 1);
        pricing.plans = list;
        return { ...(prev || {}), pricing };
      });
      // Reindexa o estado local de featuresText para acompanhar a remoção
      setFeaturesTextByIndex((prev) => {
        const next = {};
        Object.keys(prev).forEach((k) => {
          const i = Number(k);
          if (Number.isNaN(i)) return;
          if (i < index) next[i] = prev[i];
          else if (i > index) next[i - 1] = prev[i];
          // se i === index, descarta
        });
        return next;
      });
    };

    // Recursos
    const featuresFromContent = Array.isArray(content?.features)
      ? content.features
      : null;
    const featuresDefault = getSaaSValue(['features'], []);
    const features = featuresFromContent ?? featuresDefault;
    const updateFeature = (index, field, value) =>
      setContent((prev) => {
        const list = Array.isArray(prev?.features) ? [...prev.features] : [];
        while (list.length <= index) list.push({});
        const current = { ...(list[index] || {}) };
        current[field] = value;
        list[index] = current;
        return { ...(prev || {}), features: list };
      });
    const addFeature = () =>
      setContent((prev) => {
        const list = Array.isArray(prev?.features) ? [...prev.features] : [];
        list.push({ title: '', text: '' });
        return { ...(prev || {}), features: list };
      });
    const removeFeature = (index) =>
      setContent((prev) => {
        const list = Array.isArray(prev?.features) ? [...prev.features] : [];
        list.splice(index, 1);
        return { ...(prev || {}), features: list };
      });

    // Como funciona
    const stepsFromContent = Array.isArray(content?.steps)
      ? content.steps
      : null;
    const stepsDefault = getSaaSValue(['steps'], []);
    const steps = stepsFromContent ?? stepsDefault;
    const updateStep = (index, field, value) =>
      setContent((prev) => {
        const list = Array.isArray(prev?.steps) ? [...prev.steps] : [];
        while (list.length <= index) list.push({});
        const current = { ...(list[index] || {}) };
        current[field] = value;
        list[index] = current;
        return { ...(prev || {}), steps: list };
      });
    const addStep = () =>
      setContent((prev) => {
        const list = Array.isArray(prev?.steps) ? [...prev.steps] : [];
        list.push({ title: '', text: '', icon: '' });
        return { ...(prev || {}), steps: list };
      });
    const removeStep = (index) =>
      setContent((prev) => {
        const list = Array.isArray(prev?.steps) ? [...prev.steps] : [];
        list.splice(index, 1);
        return { ...(prev || {}), steps: list };
      });

    // Depoimentos
    const testimonialsFromContent = Array.isArray(content?.testimonials)
      ? content.testimonials
      : null;
    const testimonialsDefault = getSaaSValue(['testimonials'], []);
    const testimonials = testimonialsFromContent ?? testimonialsDefault;
    const updateTestimonial = (index, field, value) =>
      setContent((prev) => {
        const list = Array.isArray(prev?.testimonials)
          ? [...prev.testimonials]
          : [];
        while (list.length <= index) list.push({});
        const current = { ...(list[index] || {}) };
        current[field] = value;
        list[index] = current;
        return { ...(prev || {}), testimonials: list };
      });
    const addTestimonial = () =>
      setContent((prev) => {
        const list = Array.isArray(prev?.testimonials)
          ? [...prev.testimonials]
          : [];
        list.push({ name: '', text: '' });
        return { ...(prev || {}), testimonials: list };
      });
    const removeTestimonial = (index) =>
      setContent((prev) => {
        const list = Array.isArray(prev?.testimonials)
          ? [...prev.testimonials]
          : [];
        list.splice(index, 1);
        return { ...(prev || {}), testimonials: list };
      });

    // FAQ
    const faqFromContent = Array.isArray(content?.faq) ? content.faq : null;
    const faqDefault = getSaaSValue(['faq'], []);
    const faq = faqFromContent ?? faqDefault;
    const updateFaq = (index, field, value) =>
      setContent((prev) => {
        const list = Array.isArray(prev?.faq) ? [...prev.faq] : [];
        while (list.length <= index) list.push({});
        const current = { ...(list[index] || {}) };
        current[field] = value;
        list[index] = current;
        return { ...(prev || {}), faq: list };
      });
    const addFaq = () =>
      setContent((prev) => {
        const list = Array.isArray(prev?.faq) ? [...prev.faq] : [];
        list.push({ q: '', a: '' });
        return { ...(prev || {}), faq: list };
      });
    const removeFaq = (index) =>
      setContent((prev) => {
        const list = Array.isArray(prev?.faq) ? [...prev.faq] : [];
        list.splice(index, 1);
        return { ...(prev || {}), faq: list };
      });

    // Estilo do botão Enviar (LeadForm)
    const leadFormTextWhite = !!content?.leadForm?.textWhite;
    const setLeadFormTextWhite = (checked) =>
      setContent((prev) => ({
        ...(prev || {}),
        leadForm: { ...(prev?.leadForm || {}), textWhite: !!checked },
      }));

    // Render do editor SaaS
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        <div className="mx-auto max-w-6xl px-6 py-10 lg:py-16">
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  Editar Landing Page
                </h1>
                <p className="mt-1 text-slate-600 dark:text-slate-300">
                  {lp.titulo} · Template: SaaS
                </p>
              </div>
              <button
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40"
                onClick={() => nav(-1)}
                type="button"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M19 12H5" />
                  <path d="M12 19l-7-7 7-7" />
                </svg>
                Voltar
              </button>
            </div>
          </header>

          <div className="grid gap-6">
            {/* Configurações gerais */}
            <section className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-md backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
              <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                Configurações gerais
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Cor do tema
                  </label>
                  <input
                    type="color"
                    value={getSaaSValue(['theme'], '#0ea5e9')}
                    onChange={(e) => onChangePath(['theme'], e.target.value)}
                    className="h-11 w-24 cursor-pointer rounded-lg border border-slate-300 bg-white px-2 py-1 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                  />
                </div>
              </div>
            </section>

            {/* Cabeçalho / Navbar */}
            <section className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-md backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
              <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                Cabeçalho
              </h2>
              <div className="mt-4 grid gap-4">
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Nome do SaaS (logo/texto)
                  </label>
                  <input
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    placeholder="Ex.: Minha Plataforma"
                    value={getSaaSValue(['navbar', 'logo'], '')}
                    onChange={(e) =>
                      onChangePath(['navbar', 'logo'], e.target.value)
                    }
                  />
                </div>
              </div>
            </section>

            {/* Hero */}
            <section className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-md backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
              <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                Hero
              </h2>
              <div className="mt-4 grid gap-4">
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Título
                  </label>
                  <input
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    placeholder="Título"
                    value={getSaaSValue(['hero', 'title'], '')}
                    onChange={(e) =>
                      onChangePath(['hero', 'title'], e.target.value)
                    }
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Subtítulo
                  </label>
                  <input
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    placeholder="Subtítulo"
                    value={getSaaSValue(['hero', 'subtitle'], '')}
                    onChange={(e) =>
                      onChangePath(['hero', 'subtitle'], e.target.value)
                    }
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    URL da imagem
                  </label>
                  <input
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    placeholder="Ex.: /hero.png"
                    value={getSaaSValue(['hero', 'img'], '')}
                    onChange={(e) =>
                      onChangePath(['hero', 'img'], e.target.value)
                    }
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Texto do CTA
                    </label>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      placeholder="Texto do CTA"
                      value={getSaaSValue(['hero', 'ctaText'], '')}
                      onChange={(e) =>
                        onChangePath(['hero', 'ctaText'], e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Link do CTA
                    </label>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      placeholder="Ex.: #cta"
                      value={getSaaSValue(['hero', 'ctaHref'], '')}
                      onChange={(e) =>
                        onChangePath(['hero', 'ctaHref'], e.target.value)
                      }
                    />
                  </div>
                </div>
                <AppFooter />
              </div>
            </section>

            {/* Banner panorâmico */}
            <section className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-md backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
              <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                Banner
              </h2>
              <div className="mt-4 grid gap-4">
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    URL da imagem
                  </label>
                  <input
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    placeholder="Ex.: /banner.jpg (1600x400)"
                    value={getSaaSValue(['banner', 'img'], '')}
                    onChange={(e) =>
                      onChangePath(['banner', 'img'], e.target.value)
                    }
                  />
                </div>
                <div className="grid gap-1.5 sm:grid-cols-3">
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Altura (px)
                    </label>
                    <input
                      type="number"
                      min={120}
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      placeholder="Ex.: 288"
                      value={getSaaSValue(['banner', 'height'], 288)}
                      onChange={(e) =>
                        onChangePath(
                          ['banner', 'height'],
                          Number(e.target.value),
                        )
                      }
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Texto do botão
                    </label>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      placeholder="Assine Já"
                      value={getSaaSValue(['banner', 'btnText'], 'Assine Já')}
                      onChange={(e) =>
                        onChangePath(['banner', 'btnText'], e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Link do botão
                    </label>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      placeholder="#pricing"
                      value={getSaaSValue(['banner', 'btnHref'], '#pricing')}
                      onChange={(e) =>
                        onChangePath(['banner', 'btnHref'], e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Recursos */}
            <section className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-md backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  Recursos
                </h2>
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40"
                  onClick={addFeature}
                >
                  Adicionar recurso
                </button>
              </div>
              <div className="mt-4 grid gap-4">
                {(features || []).map((f, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-200 bg-white/60 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        Recurso {i + 1}
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-700 shadow-sm transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-900/40 dark:focus:ring-red-900/60"
                        onClick={() => removeFeature(i)}
                      >
                        Remover
                      </button>
                    </div>
                    <div className="grid gap-3">
                      <div className="grid gap-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          Título
                        </label>
                        <input
                          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Título do recurso"
                          value={getSaaSValue(
                            ['features', i, 'title'],
                            f?.title || '',
                          )}
                          onChange={(e) =>
                            updateFeature(i, 'title', e.target.value)
                          }
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          Descrição
                        </label>
                        <textarea
                          className="min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Descrição do recurso"
                          value={getSaaSValue(
                            ['features', i, 'text'],
                            f?.text || '',
                          )}
                          onChange={(e) =>
                            updateFeature(i, 'text', e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Como funciona */}
            <section className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-md backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  Como funciona
                </h2>
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40"
                  onClick={addStep}
                >
                  Adicionar passo
                </button>
              </div>
              <div className="mt-4 grid gap-4">
                {(steps || []).map((s, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-200 bg-white/60 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        Passo {i + 1}
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-700 shadow-sm transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-900/40 dark:focus:ring-red-900/60"
                        onClick={() => removeStep(i)}
                      >
                        Remover
                      </button>
                    </div>
                    <div className="grid gap-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="grid gap-1.5">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            Ícone (emoji)
                          </label>
                          <input
                            className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                            placeholder="💸"
                            value={getSaaSValue(
                              ['steps', i, 'icon'],
                              s?.icon || '',
                            )}
                            onChange={(e) =>
                              updateStep(i, 'icon', e.target.value)
                            }
                          />
                        </div>
                        <div className="col-span-2 grid gap-1.5">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            Título
                          </label>
                          <input
                            className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                            placeholder="Título do passo"
                            value={getSaaSValue(
                              ['steps', i, 'title'],
                              s?.title || '',
                            )}
                            onChange={(e) =>
                              updateStep(i, 'title', e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div className="grid gap-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          Descrição
                        </label>
                        <textarea
                          className="min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Descrição do passo"
                          value={getSaaSValue(
                            ['steps', i, 'text'],
                            s?.text || '',
                          )}
                          onChange={(e) =>
                            updateStep(i, 'text', e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Depoimentos */}
            <section className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-md backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  Depoimentos
                </h2>
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40"
                  onClick={addTestimonial}
                >
                  Adicionar depoimento
                </button>
              </div>
              <div className="mt-4 grid gap-4">
                {(testimonials || []).map((t, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-200 bg-white/60 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        Depoimento {i + 1}
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-700 shadow-sm transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-900/40 dark:focus:ring-red-900/60"
                        onClick={() => removeTestimonial(i)}
                      >
                        Remover
                      </button>
                    </div>
                    <div className="grid gap-3">
                      <div className="grid gap-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          Nome
                        </label>
                        <input
                          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Nome"
                          value={getSaaSValue(
                            ['testimonials', i, 'name'],
                            t?.name || '',
                          )}
                          onChange={(e) =>
                            updateTestimonial(i, 'name', e.target.value)
                          }
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          Texto
                        </label>
                        <textarea
                          className="min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Depoimento"
                          value={getSaaSValue(
                            ['testimonials', i, 'text'],
                            t?.text || '',
                          )}
                          onChange={(e) =>
                            updateTestimonial(i, 'text', e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-md backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  FAQ
                </h2>
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40"
                  onClick={addFaq}
                >
                  Adicionar pergunta
                </button>
              </div>
              <div className="mt-4 grid gap-4">
                {(faq || []).map((qa, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-200 bg-white/60 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        Pergunta {i + 1}
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-700 shadow-sm transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-900/40 dark:focus:ring-red-900/60"
                        onClick={() => removeFaq(i)}
                      >
                        Remover
                      </button>
                    </div>
                    <div className="grid gap-3">
                      <div className="grid gap-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          Pergunta
                        </label>
                        <input
                          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Pergunta"
                          value={getSaaSValue(['faq', i, 'q'], qa?.q || '')}
                          onChange={(e) => updateFaq(i, 'q', e.target.value)}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          Resposta
                        </label>
                        <textarea
                          className="min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Resposta"
                          value={getSaaSValue(['faq', i, 'a'], qa?.a || '')}
                          onChange={(e) => updateFaq(i, 'a', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Botão do formulário */}
            <section className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-md backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
              <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                Botão do formulário
              </h2>
              <div className="mt-4">
                <label className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={leadFormTextWhite}
                    onChange={(e) => setLeadFormTextWhite(e.target.checked)}
                  />
                  Texto do botão "Enviar" branco (fundo usa a cor do tema)
                </label>
              </div>
            </section>

            {/* Planos */}
            <section className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-md backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  Planos
                </h2>
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40"
                  onClick={addPlan}
                >
                  Adicionar plano
                </button>
              </div>

              <div className="mt-4 grid gap-4">
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Subtítulo da sessão
                  </label>
                  <input
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    placeholder="Subtítulo"
                    value={getSaaSValue(['pricing', 'subtitle'], '')}
                    onChange={(e) =>
                      updatePricingField('subtitle', e.target.value)
                    }
                  />
                </div>

                {(plans || []).map((p, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-200 bg-white/60 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        Plano {i + 1}
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-700 shadow-sm transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-900/40 dark:focus:ring-red-900/60"
                        onClick={() => removePlan(i)}
                      >
                        Remover
                      </button>
                    </div>
                    <div className="grid gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            Nome
                          </label>
                          <input
                            className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                            placeholder="Nome do plano"
                            value={getSaaSValue(
                              ['pricing', 'plans', i, 'name'],
                              p?.name || '',
                            )}
                            onChange={(e) =>
                              updatePlan(i, 'name', e.target.value)
                            }
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            Preço
                          </label>
                          <input
                            className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                            placeholder="Ex.: R$ 49"
                            value={getSaaSValue(
                              ['pricing', 'plans', i, 'price'],
                              p?.price || '',
                            )}
                            onChange={(e) =>
                              updatePlan(i, 'price', e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            Período
                          </label>
                          <input
                            className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                            placeholder="Ex.: /mês"
                            value={getSaaSValue(
                              ['pricing', 'plans', i, 'period'],
                              p?.period || '',
                            )}
                            onChange={(e) =>
                              updatePlan(i, 'period', e.target.value)
                            }
                          />
                        </div>
                        <div className="flex items-end">
                          <label className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-200">
                            <input
                              type="checkbox"
                              checked={
                                !!getSaaSValue(
                                  ['pricing', 'plans', i, 'featured'],
                                  p?.featured || false,
                                )
                              }
                              onChange={(e) =>
                                updatePlan(i, 'featured', e.target.checked)
                              }
                            />
                            Destaque
                          </label>
                        </div>
                      </div>
                      <div className="grid gap-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          Recursos (1 por linha)
                        </label>
                        <textarea
                          className="min-h-[100px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder={
                            'Ex.:\n- Ilimitado\n- Suporte prioritário'
                          }
                          value={
                            featuresTextByIndex[i] ??
                            getSaaSValue(
                              ['pricing', 'plans', i, 'features'],
                              p?.features || [],
                            ).join('\n')
                          }
                          onChange={(e) =>
                            setPlanFeaturesText(i, e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex justify-end">
              <button
                className="inline-flex h-11 items-center justify-center rounded-lg bg-sky-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:opacity-50 dark:bg-sky-500 dark:hover:bg-sky-600 dark:focus:ring-sky-700/40"
                onClick={onSave}
              >
                Salvar e visualizar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isD2C) {
    const heroBullets = Array.isArray(getD2CValue(['hero', 'bullets'], []))
      ? getD2CValue(['hero', 'bullets'], [])
      : [];
    const heroStats = Array.isArray(getD2CValue(['hero', 'stats'], []))
      ? getD2CValue(['hero', 'stats'], [])
      : [];
    const highlights = Array.isArray(getD2CValue(['highlights'], []))
      ? getD2CValue(['highlights'], [])
      : [];
    const lifestyleBullets = Array.isArray(
      getD2CValue(['lifestyle', 'bullets'], []),
    )
      ? getD2CValue(['lifestyle', 'bullets'], [])
      : [];
    const bundles = Array.isArray(getD2CValue(['bundles'], []))
      ? getD2CValue(['bundles'], [])
      : [];
    const testimonials = Array.isArray(getD2CValue(['testimonials'], []))
      ? getD2CValue(['testimonials'], [])
      : [];
    const faq = Array.isArray(getD2CValue(['faq'], []))
      ? getD2CValue(['faq'], [])
      : [];
    const logos = Array.isArray(getD2CValue(['socialProof', 'logos'], []))
      ? getD2CValue(['socialProof', 'logos'], [])
      : [];
    const guaranteeBullets = Array.isArray(
      getD2CValue(['guarantee', 'bullets'], []),
    )
      ? getD2CValue(['guarantee', 'bullets'], [])
      : [];

    const updateHeroStat = (index, field, value) =>
      setContent((prev) => {
        const list = getWorkingArray(prev, ['hero', 'stats'], heroStats);
        while (list.length <= index) list.push({});
        list[index] = { ...(list[index] || {}), [field]: value };
        return setIn(prev || {}, ['hero', 'stats'], list);
      });
    const addHeroStat = () =>
      setContent((prev) => {
        const list = getWorkingArray(prev, ['hero', 'stats'], heroStats);
        list.push({ label: '', value: '' });
        return setIn(prev || {}, ['hero', 'stats'], list);
      });
    const removeHeroStat = (index) =>
      setContent((prev) => {
        const list = getWorkingArray(prev, ['hero', 'stats'], heroStats);
        list.splice(index, 1);
        return setIn(prev || {}, ['hero', 'stats'], list);
      });

    const updateHighlight = (index, field, value) =>
      setContent((prev) => {
        const list = getWorkingArray(prev, ['highlights'], highlights);
        while (list.length <= index) list.push({});
        list[index] = { ...(list[index] || {}), [field]: value };
        return setIn(prev || {}, ['highlights'], list);
      });
    const addHighlight = () =>
      setContent((prev) => {
        const list = getWorkingArray(prev, ['highlights'], highlights);
        list.push({ icon: '✨', title: '', text: '' });
        return setIn(prev || {}, ['highlights'], list);
      });
    const removeHighlight = (index) =>
      setContent((prev) => {
        const list = getWorkingArray(prev, ['highlights'], highlights);
        list.splice(index, 1);
        return setIn(prev || {}, ['highlights'], list);
      });

    const updateBundle = (index, field, value) =>
      setContent((prev) => {
        const list = getWorkingArray(prev, ['bundles'], bundles);
        while (list.length <= index) list.push({});
        list[index] = { ...(list[index] || {}), [field]: value };
        return setIn(prev || {}, ['bundles'], list);
      });
    const handleBundleBenefits = (index, text) =>
      updateBundle(index, 'benefits', linesToArray(text));
    const addBundle = () =>
      setContent((prev) => {
        const list = getWorkingArray(prev, ['bundles'], bundles);
        list.push({
          id: '',
          name: '',
          description: '',
          price: '',
          oldPrice: '',
          badge: '',
          delivery: '',
          benefits: [],
        });
        return setIn(prev || {}, ['bundles'], list);
      });
    const removeBundle = (index) =>
      setContent((prev) => {
        const list = getWorkingArray(prev, ['bundles'], bundles);
        list.splice(index, 1);
        return setIn(prev || {}, ['bundles'], list);
      });

    const updateTestimonial = (index, field, value) =>
      setContent((prev) => {
        const list = getWorkingArray(prev, ['testimonials'], testimonials);
        while (list.length <= index) list.push({});
        list[index] = { ...(list[index] || {}), [field]: value };
        return setIn(prev || {}, ['testimonials'], list);
      });
    const addTestimonial = () =>
      setContent((prev) => {
        const list = getWorkingArray(prev, ['testimonials'], testimonials);
        list.push({ name: '', location: '', quote: '', rating: 5 });
        return setIn(prev || {}, ['testimonials'], list);
      });
    const removeTestimonial = (index) =>
      setContent((prev) => {
        const list = getWorkingArray(prev, ['testimonials'], testimonials);
        list.splice(index, 1);
        return setIn(prev || {}, ['testimonials'], list);
      });

    const updateFaq = (index, field, value) =>
      setContent((prev) => {
        const list = getWorkingArray(prev, ['faq'], faq);
        while (list.length <= index) list.push({});
        list[index] = { ...(list[index] || {}), [field]: value };
        return setIn(prev || {}, ['faq'], list);
      });
    const addFaq = () =>
      setContent((prev) => {
        const list = getWorkingArray(prev, ['faq'], faq);
        list.push({ question: '', answer: '' });
        return setIn(prev || {}, ['faq'], list);
      });
    const removeFaq = (index) =>
      setContent((prev) => {
        const list = getWorkingArray(prev, ['faq'], faq);
        list.splice(index, 1);
        return setIn(prev || {}, ['faq'], list);
      });

    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
          <div className="mx-auto max-w-6xl px-6 py-10 lg:py-16">
            <header className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    Editar Landing Page
                  </h1>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    {lp.titulo} · Template: D2C
                  </p>
                </div>
                <button
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40"
                  onClick={() => nav(-1)}
                  type="button"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M19 12H5" />
                    <path d="M12 19l-7-7 7-7" />
                  </svg>
                  Voltar
                </button>
              </div>
            </header>

            <div className="grid gap-6">
              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  Paleta de cores
                </h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Cor do texto
                    </label>
                    <input
                      type="color"
                      value={getD2CValue(['theme', 'text'], '#0f172a')}
                      onChange={(e) =>
                        onChangePath(['theme', 'text'], e.target.value)
                      }
                      className="h-11 w-24 cursor-pointer rounded-lg border border-slate-300 bg-white px-2 py-1 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Cor de fundo
                    </label>
                    <input
                      type="color"
                      value={getD2CValue(['theme', 'background'], '#fff7ed')}
                      onChange={(e) =>
                        onChangePath(['theme', 'background'], e.target.value)
                      }
                      className="h-11 w-24 cursor-pointer rounded-lg border border-slate-300 bg-white px-2 py-1 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  Hero e chamada principal
                </h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Label
                    </label>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      value={getD2CValue(['hero', 'label'], '')}
                      onChange={(e) =>
                        onChangePath(['hero', 'label'], e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Badge
                    </label>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      value={getD2CValue(['hero', 'badge'], '')}
                      onChange={(e) =>
                        onChangePath(['hero', 'badge'], e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="mt-4 grid gap-4">
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Título principal
                    </label>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      value={getD2CValue(['hero', 'title'], '')}
                      onChange={(e) =>
                        onChangePath(['hero', 'title'], e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Descrição
                    </label>
                    <textarea
                      className="min-h-[100px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      value={getD2CValue(['hero', 'description'], '')}
                      onChange={(e) =>
                        onChangePath(['hero', 'description'], e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {[
                    { label: 'Preço', path: ['hero', 'price'] },
                    { label: 'Preço anterior', path: ['hero', 'oldPrice'] },
                    { label: 'Frete/Garantia', path: ['hero', 'shipping'] },
                  ].map((item) => (
                    <div className="grid gap-1.5" key={item.label}>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {item.label}
                      </label>
                      <input
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                        value={getD2CValue(item.path, '')}
                        onChange={(e) =>
                          onChangePath(item.path, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Garantia destacada
                    </label>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      value={getD2CValue(['hero', 'guarantee'], '')}
                      onChange={(e) =>
                        onChangePath(['hero', 'guarantee'], e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Avaliações
                    </label>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      value={getD2CValue(['hero', 'reviews'], '')}
                      onChange={(e) =>
                        onChangePath(['hero', 'reviews'], e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="mt-4 grid gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Bullets (1 por linha)
                  </label>
                  <textarea
                    className="min-h-[100px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    value={heroBullets.join('\n')}
                    onChange={(e) =>
                      onChangePath(
                        ['hero', 'bullets'],
                        linesToArray(e.target.value),
                      )
                    }
                  />
                </div>
                <div className="mt-4 grid gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Imagem principal
                  </label>
                  <input
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    value={getD2CValue(['hero', 'image'], '')}
                    onChange={(e) =>
                      onChangePath(['hero', 'image'], e.target.value)
                    }
                  />
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {[
                    {
                      label: 'CTA principal (texto)',
                      path: ['hero', 'ctaPrimary', 'label'],
                    },
                    {
                      label: 'CTA principal (link)',
                      path: ['hero', 'ctaPrimary', 'href'],
                    },
                    {
                      label: 'CTA secundária (texto)',
                      path: ['hero', 'ctaSecondary', 'label'],
                    },
                    {
                      label: 'CTA secundária (link)',
                      path: ['hero', 'ctaSecondary', 'href'],
                    },
                  ].map((item) => (
                    <div className="grid gap-1.5" key={item.label}>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {item.label}
                      </label>
                      <input
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                        value={getD2CValue(item.path, '')}
                        onChange={(e) =>
                          onChangePath(item.path, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-6 grid gap-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Métricas exibidas no hero
                    </h3>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      onClick={addHeroStat}
                    >
                      Adicionar métrica
                    </button>
                  </div>
                  <div className="grid gap-4">
                    {heroStats.map((stat, i) => (
                      <div
                        key={`${stat?.label || 'stat'}-${i}`}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                      >
                        <div className="flex justify-between gap-4">
                          <div className="grid flex-1 gap-1.5">
                            <label className="text-xs uppercase tracking-wide text-slate-500">
                              Valor
                            </label>
                            <input
                              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                              value={stat?.value || ''}
                              onChange={(e) =>
                                updateHeroStat(i, 'value', e.target.value)
                              }
                            />
                          </div>
                          <div className="grid flex-1 gap-1.5">
                            <label className="text-xs uppercase tracking-wide text-slate-500">
                              Rótulo
                            </label>
                            <input
                              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                              value={stat?.label || ''}
                              onChange={(e) =>
                                updateHeroStat(i, 'label', e.target.value)
                              }
                            />
                          </div>
                          <button
                            type="button"
                            className="mt-6 h-10 rounded-lg border border-red-200 px-3 text-sm text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-200 dark:hover:bg-red-900/30"
                            onClick={() => removeHeroStat(i)}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                      Benefícios / Highlights
                    </h2>
                    <p className="text-sm text-slate-500">
                      Ícone, título e descrição dos diferenciais
                    </p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={addHighlight}
                  >
                    Adicionar destaque
                  </button>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {highlights.map((item, i) => (
                    <div
                      key={`${item?.title || 'highlight'}-${i}`}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Destaque #{i + 1}
                        </h3>
                        <button
                          type="button"
                          className="text-xs text-red-600 dark:text-red-300"
                          onClick={() => removeHighlight(i)}
                        >
                          Remover
                        </button>
                      </div>
                      <div className="mt-3 grid gap-2">
                        <input
                          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Ícone ou emoji"
                          value={item?.icon || ''}
                          onChange={(e) =>
                            updateHighlight(i, 'icon', e.target.value)
                          }
                        />
                        <input
                          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Título"
                          value={item?.title || ''}
                          onChange={(e) =>
                            updateHighlight(i, 'title', e.target.value)
                          }
                        />
                        <textarea
                          className="min-h-[90px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Descrição"
                          value={item?.text || ''}
                          onChange={(e) =>
                            updateHighlight(i, 'text', e.target.value)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  Lifestyle
                </h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Título
                    </label>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      value={getD2CValue(['lifestyle', 'title'], '')}
                      onChange={(e) =>
                        onChangePath(['lifestyle', 'title'], e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Imagem
                    </label>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      value={getD2CValue(['lifestyle', 'image'], '')}
                      onChange={(e) =>
                        onChangePath(['lifestyle', 'image'], e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="mt-4 grid gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Descrição
                  </label>
                  <textarea
                    className="min-h-[120px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    value={getD2CValue(['lifestyle', 'description'], '')}
                    onChange={(e) =>
                      onChangePath(['lifestyle', 'description'], e.target.value)
                    }
                  />
                </div>
                <div className="mt-4 grid gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Bullets (1 por linha)
                  </label>
                  <textarea
                    className="min-h-[100px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    value={lifestyleBullets.join('\n')}
                    onChange={(e) =>
                      onChangePath(
                        ['lifestyle', 'bullets'],
                        linesToArray(e.target.value),
                      )
                    }
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                      Kits / bundles
                    </h2>
                    <p className="text-sm text-slate-500">
                      Configure os combos ofertados com benefícios
                    </p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={addBundle}
                  >
                    Adicionar kit
                  </button>
                </div>
                <div className="mt-4 grid gap-6">
                  {bundles.map((bundle, i) => (
                    <div
                      key={`${bundle?.id || 'bundle'}-${i}`}
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                          Kit #{i + 1}
                        </h3>
                        <button
                          type="button"
                          className="text-sm text-red-600 dark:text-red-300"
                          onClick={() => removeBundle(i)}
                        >
                          Remover
                        </button>
                      </div>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {[
                          { label: 'Identificador', field: 'id' },
                          { label: 'Nome', field: 'name' },
                          { label: 'Preço', field: 'price' },
                          { label: 'Preço anterior', field: 'oldPrice' },
                          { label: 'Badge', field: 'badge' },
                          { label: 'Entrega', field: 'delivery' },
                        ].map((cfg) => (
                          <div className="grid gap-1.5" key={cfg.field}>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                              {cfg.label}
                            </label>
                            <input
                              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                              value={bundle?.[cfg.field] || ''}
                              onChange={(e) =>
                                updateBundle(i, cfg.field, e.target.value)
                              }
                            />
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 grid gap-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          Descrição
                        </label>
                        <textarea
                          className="min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          value={bundle?.description || ''}
                          onChange={(e) =>
                            updateBundle(i, 'description', e.target.value)
                          }
                        />
                      </div>
                      <div className="mt-4 grid gap-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          Benefícios (1 por linha)
                        </label>
                        <textarea
                          className="min-h-[100px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          value={
                            Array.isArray(bundle?.benefits)
                              ? bundle.benefits.join('\n')
                              : ''
                          }
                          onChange={(e) =>
                            handleBundleBenefits(i, e.target.value)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Social proof · badge
                    </label>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      value={getD2CValue(['socialProof', 'badge'], '')}
                      onChange={(e) =>
                        onChangePath(['socialProof', 'badge'], e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Texto complementar
                    </label>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      value={getD2CValue(['socialProof', 'text'], '')}
                      onChange={(e) =>
                        onChangePath(['socialProof', 'text'], e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="mt-4 grid gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Logos (1 por linha)
                  </label>
                  <textarea
                    className="min-h-[100px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    value={logos.join('\n')}
                    onChange={(e) =>
                      onChangePath(
                        ['socialProof', 'logos'],
                        linesToArray(e.target.value),
                      )
                    }
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                      Depoimentos
                    </h2>
                    <p className="text-sm text-slate-500">
                      Ajuste as avaliações exibidas na seção Social Proof
                    </p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={addTestimonial}
                  >
                    Adicionar depoimento
                  </button>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {testimonials.map((dep, i) => (
                    <div
                      key={`${dep?.name || 'testimonial'}-${i}`}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Depoimento #{i + 1}
                        </h3>
                        <button
                          type="button"
                          className="text-xs text-red-600 dark:text-red-300"
                          onClick={() => removeTestimonial(i)}
                        >
                          Remover
                        </button>
                      </div>
                      <div className="mt-3 grid gap-2">
                        <input
                          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Nome"
                          value={dep?.name || ''}
                          onChange={(e) =>
                            updateTestimonial(i, 'name', e.target.value)
                          }
                        />
                        <input
                          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Cidade/Estado"
                          value={dep?.location || ''}
                          onChange={(e) =>
                            updateTestimonial(i, 'location', e.target.value)
                          }
                        />
                        <input
                          type="number"
                          min="1"
                          max="5"
                          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Nota (1-5)"
                          value={dep?.rating ?? ''}
                          onChange={(e) =>
                            updateTestimonial(
                              i,
                              'rating',
                              Number(e.target.value),
                            )
                          }
                        />
                        <textarea
                          className="min-h-[90px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Citação"
                          value={dep?.quote || ''}
                          onChange={(e) =>
                            updateTestimonial(i, 'quote', e.target.value)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="grid gap-4">
                    <div className="grid gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Título da garantia
                      </label>
                      <input
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                        value={getD2CValue(['guarantee', 'title'], '')}
                        onChange={(e) =>
                          onChangePath(['guarantee', 'title'], e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Descrição
                      </label>
                      <textarea
                        className="min-h-[100px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                        value={getD2CValue(['guarantee', 'description'], '')}
                        onChange={(e) =>
                          onChangePath(
                            ['guarantee', 'description'],
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Imagem
                      </label>
                      <input
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                        value={getD2CValue(['guarantee', 'image'], '')}
                        onChange={(e) =>
                          onChangePath(['guarantee', 'image'], e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Bullets (1 por linha)
                      </label>
                      <textarea
                        className="min-h-[100px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                        value={guaranteeBullets.join('\n')}
                        onChange={(e) =>
                          onChangePath(
                            ['guarantee', 'bullets'],
                            linesToArray(e.target.value),
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        FAQ
                      </h3>
                      <button
                        type="button"
                        className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        onClick={addFaq}
                      >
                        Adicionar pergunta
                      </button>
                    </div>
                    <div className="grid gap-3">
                      {faq.map((item, i) => (
                        <div
                          key={`${item?.question || 'faq'}-${i}`}
                          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                        >
                          <div className="grid gap-1.5">
                            <label className="text-xs uppercase tracking-wide text-slate-500">
                              Pergunta
                            </label>
                            <input
                              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                              value={item?.question || ''}
                              onChange={(e) =>
                                updateFaq(i, 'question', e.target.value)
                              }
                            />
                          </div>
                          <div className="mt-3 grid gap-1.5">
                            <label className="text-xs uppercase tracking-wide text-slate-500">
                              Resposta
                            </label>
                            <textarea
                              className="min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                              value={item?.answer || ''}
                              onChange={(e) =>
                                updateFaq(i, 'answer', e.target.value)
                              }
                            />
                          </div>
                          <button
                            type="button"
                            className="mt-3 text-xs text-red-600 dark:text-red-300"
                            onClick={() => removeFaq(i)}
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  Rodapé
                </h2>
                <div className="mt-4 grid gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Texto do rodapé
                  </label>
                  <input
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    value={getD2CValue(['footer', 'note'], '')}
                    onChange={(e) =>
                      onChangePath(['footer', 'note'], e.target.value)
                    }
                  />
                </div>
              </section>

              <div className="flex justify-end">
                <button
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-sky-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:opacity-50 dark:bg-sky-500 dark:hover:bg-sky-600 dark:focus:ring-sky-700/40"
                  onClick={onSave}
                >
                  Salvar e visualizar
                </button>
              </div>
            </div>
          </div>
        </div>
        <AppFooter />
      </>
    );
  }

  if (isEvento) {
    const navLinks = getEventoValue(['navbar', 'links'], []);
    const heroStats = getEventoValue(['hero', 'stats'], []);
    const highlightItems = getEventoValue(['highlights', 'items'], []);
    const agendaDays = getEventoValue(['agenda', 'days'], []);
    const speakersList = getEventoValue(['speakers', 'people'], []);
    const ticketPlans = getEventoValue(['tickets', 'plans'], []);
    const testimonials = getEventoValue(['testimonials'], []);
    const partnerLogos = getEventoValue(['partners', 'logos'], []);
    const faq = getEventoValue(['faq'], []);

    const updateArrayField = (path, snapshot, index, field, value) =>
      setContent((prev) => {
        const list = getWorkingArray(prev, path, snapshot);
        while (list.length <= index) list.push({});
        list[index] = { ...(list[index] || {}), [field]: value };
        return setIn(prev || {}, path, list);
      });

    const addArrayItem = (path, snapshot, template) =>
      setContent((prev) => {
        const list = getWorkingArray(prev, path, snapshot);
        list.push(template);
        return setIn(prev || {}, path, list);
      });

    const removeArrayItem = (path, snapshot, index) =>
      setContent((prev) => {
        const list = getWorkingArray(prev, path, snapshot);
        list.splice(index, 1);
        return setIn(prev || {}, path, list);
      });

    const updateAgendaDay = (index, field, value) =>
      updateArrayField(['agenda', 'days'], agendaDays, index, field, value);

    const addAgendaDay = () =>
      addArrayItem(['agenda', 'days'], agendaDays, {
        label: '',
        date: '',
        slots: [],
      });

    const removeAgendaDay = (index) =>
      removeArrayItem(['agenda', 'days'], agendaDays, index);

    const updateAgendaSlot = (dayIndex, slotIndex, field, value) =>
      setContent((prev) => {
        const days = getWorkingArray(prev, ['agenda', 'days'], agendaDays);
        while (days.length <= dayIndex) days.push({ slots: [] });
        const day = { ...(days[dayIndex] || {}) };
        const slots = Array.isArray(day.slots) ? [...day.slots] : [];
        while (slots.length <= slotIndex) slots.push({});
        slots[slotIndex] = { ...(slots[slotIndex] || {}), [field]: value };
        day.slots = slots;
        days[dayIndex] = day;
        return setIn(prev || {}, ['agenda', 'days'], days);
      });

    const addAgendaSlot = (dayIndex) =>
      setContent((prev) => {
        const days = getWorkingArray(prev, ['agenda', 'days'], agendaDays);
        while (days.length <= dayIndex) days.push({ slots: [] });
        const day = { ...(days[dayIndex] || {}) };
        const slots = Array.isArray(day.slots) ? [...(day.slots || [])] : [];
        slots.push({ time: '', type: '', title: '', speaker: '' });
        day.slots = slots;
        days[dayIndex] = day;
        return setIn(prev || {}, ['agenda', 'days'], days);
      });

    const removeAgendaSlot = (dayIndex, slotIndex) =>
      setContent((prev) => {
        const days = getWorkingArray(prev, ['agenda', 'days'], agendaDays);
        if (!days[dayIndex]) return prev || {};
        const day = { ...(days[dayIndex] || {}) };
        const slots = Array.isArray(day.slots) ? [...day.slots] : [];
        slots.splice(slotIndex, 1);
        day.slots = slots;
        days[dayIndex] = day;
        return setIn(prev || {}, ['agenda', 'days'], days);
      });

    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
          <div className="mx-auto max-w-6xl px-6 py-10 lg:py-16">
            <header className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    Editar Landing Page
                  </h1>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    {lp.titulo} · Template: Evento
                  </p>
                </div>
                <button
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40"
                  onClick={() => nav(-1)}
                  type="button"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M19 12H5" />
                    <path d="M12 19l-7-7 7-7" />
                  </svg>
                  Voltar
                </button>
              </div>
            </header>

            <div className="grid gap-6">
              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    Navbar
                  </h2>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() =>
                      addArrayItem(['navbar', 'links'], navLinks, {
                        label: '',
                        href: '',
                      })
                    }
                  >
                    Adicionar link
                  </button>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Logo / nome
                    </label>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      value={getEventoValue(['navbar', 'logo'], '')}
                      onChange={(e) =>
                        onChangePath(['navbar', 'logo'], e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      CTA (texto)
                    </label>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      value={getEventoValue(['navbar', 'cta', 'label'], '')}
                      onChange={(e) =>
                        onChangePath(['navbar', 'cta', 'label'], e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      CTA (link)
                    </label>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      value={getEventoValue(['navbar', 'cta', 'href'], '')}
                      onChange={(e) =>
                        onChangePath(['navbar', 'cta', 'href'], e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="mt-6 grid gap-3">
                  {navLinks.map((link, i) => (
                    <div
                      key={`${link?.label || 'link'}-${i}`}
                      className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          Link {i + 1}
                        </span>
                        <button
                          type="button"
                          className="text-xs text-red-600 dark:text-red-300"
                          onClick={() =>
                            removeArrayItem(['navbar', 'links'], navLinks, i)
                          }
                        >
                          Remover
                        </button>
                      </div>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <input
                          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Label"
                          value={link?.label || ''}
                          onChange={(e) =>
                            updateArrayField(
                              ['navbar', 'links'],
                              navLinks,
                              i,
                              'label',
                              e.target.value,
                            )
                          }
                        />
                        <input
                          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="#secao"
                          value={link?.href || ''}
                          onChange={(e) =>
                            updateArrayField(
                              ['navbar', 'links'],
                              navLinks,
                              i,
                              'href',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    Hero
                  </h2>
                </div>
                <div className="mt-4 grid gap-4">
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Badge
                    </label>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      value={getEventoValue(['hero', 'badge'], '')}
                      onChange={(e) =>
                        onChangePath(['hero', 'badge'], e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Título
                    </label>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      value={getEventoValue(['hero', 'title'], '')}
                      onChange={(e) =>
                        onChangePath(['hero', 'title'], e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Subtítulo
                    </label>
                    <textarea
                      className="min-h-[100px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      value={getEventoValue(['hero', 'subtitle'], '')}
                      onChange={(e) =>
                        onChangePath(['hero', 'subtitle'], e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      { label: 'Data / horário', path: ['hero', 'date'] },
                      { label: 'Local / formato', path: ['hero', 'location'] },
                    ].map((field) => (
                      <div className="grid gap-1.5" key={field.label}>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {field.label}
                        </label>
                        <input
                          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          value={getEventoValue(field.path, '')}
                          onChange={(e) =>
                            onChangePath(field.path, e.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Imagem / cover
                    </label>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      value={getEventoValue(['hero', 'cover'], '')}
                      onChange={(e) =>
                        onChangePath(['hero', 'cover'], e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      {
                        label: 'CTA principal (texto)',
                        path: ['hero', 'ctaPrimary', 'label'],
                      },
                      {
                        label: 'CTA principal (link)',
                        path: ['hero', 'ctaPrimary', 'href'],
                      },
                      {
                        label: 'CTA secundária (texto)',
                        path: ['hero', 'ctaSecondary', 'label'],
                      },
                      {
                        label: 'CTA secundária (link)',
                        path: ['hero', 'ctaSecondary', 'href'],
                      },
                    ].map((field) => (
                      <div className="grid gap-1.5" key={field.label}>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {field.label}
                        </label>
                        <input
                          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          value={getEventoValue(field.path, '')}
                          onChange={(e) =>
                            onChangePath(field.path, e.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Métricas
                  </h3>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() =>
                      addArrayItem(['hero', 'stats'], heroStats, {
                        value: '',
                        label: '',
                      })
                    }
                  >
                    Adicionar métrica
                  </button>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  {heroStats.map((stat, i) => (
                    <div
                      key={`${stat?.label || 'stat'}-${i}`}
                      className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-wide text-slate-500">
                          Métrica {i + 1}
                        </span>
                        <button
                          type="button"
                          className="text-xs text-red-600 dark:text-red-300"
                          onClick={() =>
                            removeArrayItem(['hero', 'stats'], heroStats, i)
                          }
                        >
                          Remover
                        </button>
                      </div>
                      <div className="mt-3 grid gap-2">
                        <input
                          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Valor"
                          value={stat?.value || ''}
                          onChange={(e) =>
                            updateArrayField(
                              ['hero', 'stats'],
                              heroStats,
                              i,
                              'value',
                              e.target.value,
                            )
                          }
                        />
                        <input
                          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Label"
                          value={stat?.label || ''}
                          onChange={(e) =>
                            updateArrayField(
                              ['hero', 'stats'],
                              heroStats,
                              i,
                              'label',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    Por que participar
                  </h2>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() =>
                      addArrayItem(['highlights', 'items'], highlightItems, {
                        icon: '',
                        title: '',
                        text: '',
                      })
                    }
                  >
                    Adicionar item
                  </button>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {[
                    { label: 'Badge', path: ['highlights', 'badge'] },
                    { label: 'Título da seção', path: ['highlights', 'title'] },
                  ].map((field) => (
                    <div className="grid gap-1.5" key={field.label}>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {field.label}
                      </label>
                      <input
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                        value={getEventoValue(field.path, '')}
                        onChange={(e) =>
                          onChangePath(field.path, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {highlightItems.map((item, i) => (
                    <div
                      key={`${item?.title || 'highlight'}-${i}`}
                      className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          Benefício {i + 1}
                        </span>
                        <button
                          type="button"
                          className="text-xs text-red-600 dark:text-red-300"
                          onClick={() =>
                            removeArrayItem(
                              ['highlights', 'items'],
                              highlightItems,
                              i,
                            )
                          }
                        >
                          Remover
                        </button>
                      </div>
                      <div className="mt-3 grid gap-2">
                        <input
                          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Ícone"
                          value={item?.icon || ''}
                          onChange={(e) =>
                            updateArrayField(
                              ['highlights', 'items'],
                              highlightItems,
                              i,
                              'icon',
                              e.target.value,
                            )
                          }
                        />
                        <input
                          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Título"
                          value={item?.title || ''}
                          onChange={(e) =>
                            updateArrayField(
                              ['highlights', 'items'],
                              highlightItems,
                              i,
                              'title',
                              e.target.value,
                            )
                          }
                        />
                        <textarea
                          className="min-h-[80px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Texto"
                          value={item?.text || ''}
                          onChange={(e) =>
                            updateArrayField(
                              ['highlights', 'items'],
                              highlightItems,
                              i,
                              'text',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    Agenda
                  </h2>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={addAgendaDay}
                  >
                    Adicionar dia
                  </button>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {[
                    { label: 'Título da seção', path: ['agenda', 'title'] },
                    { label: 'Descrição', path: ['agenda', 'description'] },
                  ].map((field) => (
                    <div className="grid gap-1.5" key={field.label}>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {field.label}
                      </label>
                      <textarea
                        className="min-h-[60px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                        value={getEventoValue(field.path, '')}
                        onChange={(e) =>
                          onChangePath(field.path, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-4">
                  {agendaDays.map((day, dayIndex) => {
                    const slots = Array.isArray(day?.slots) ? day.slots : [];
                    return (
                      <div
                        key={`${day?.label || 'day'}-${dayIndex}`}
                        className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            Dia {dayIndex + 1}
                          </span>
                          <button
                            type="button"
                            className="text-xs text-red-600 dark:text-red-300"
                            onClick={() => removeAgendaDay(dayIndex)}
                          >
                            Remover dia
                          </button>
                        </div>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          <input
                            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                            placeholder="Rótulo (ex.: Dia único)"
                            value={day?.label || ''}
                            onChange={(e) =>
                              updateAgendaDay(dayIndex, 'label', e.target.value)
                            }
                          />
                          <input
                            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                            placeholder="Data"
                            value={day?.date || ''}
                            onChange={(e) =>
                              updateAgendaDay(dayIndex, 'date', e.target.value)
                            }
                          />
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            Slots
                          </h4>
                          <button
                            type="button"
                            className="text-xs text-slate-600 underline dark:text-slate-300"
                            onClick={() => addAgendaSlot(dayIndex)}
                          >
                            Adicionar slot
                          </button>
                        </div>
                        <div className="mt-3 grid gap-3">
                          {slots.map((slot, slotIndex) => (
                            <div
                              key={`${slot?.title || 'slot'}-${slotIndex}`}
                              className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs uppercase tracking-wide text-slate-500">
                                  Slot {slotIndex + 1}
                                </span>
                                <button
                                  type="button"
                                  className="text-[11px] text-red-600 dark:text-red-300"
                                  onClick={() =>
                                    removeAgendaSlot(dayIndex, slotIndex)
                                  }
                                >
                                  Remover
                                </button>
                              </div>
                              <div className="mt-2 grid gap-2 md:grid-cols-4">
                                {[
                                  { placeholder: 'Hora', field: 'time' },
                                  { placeholder: 'Tipo', field: 'type' },
                                  { placeholder: 'Título', field: 'title' },
                                  {
                                    placeholder: 'Palestrante',
                                    field: 'speaker',
                                  },
                                ].map((slotField) => (
                                  <input
                                    key={slotField.field}
                                    className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                                    placeholder={slotField.placeholder}
                                    value={slot?.[slotField.field] || ''}
                                    onChange={(e) =>
                                      updateAgendaSlot(
                                        dayIndex,
                                        slotIndex,
                                        slotField.field,
                                        e.target.value,
                                      )
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    Mentores
                  </h2>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() =>
                      addArrayItem(['speakers', 'people'], speakersList, {
                        name: '',
                        role: '',
                        bio: '',
                        avatar: '',
                      })
                    }
                  >
                    Adicionar mentor
                  </button>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {[
                    { label: 'Badge', path: ['speakers', 'badge'] },
                    { label: 'Título da seção', path: ['speakers', 'title'] },
                  ].map((field) => (
                    <div className="grid gap-1.5" key={field.label}>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {field.label}
                      </label>
                      <input
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                        value={getEventoValue(field.path, '')}
                        onChange={(e) =>
                          onChangePath(field.path, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Destaque
                  </label>
                  <textarea
                    className="min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    value={getEventoValue(['speakers', 'highlight'], '')}
                    onChange={(e) =>
                      onChangePath(['speakers', 'highlight'], e.target.value)
                    }
                  />
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {speakersList.map((speaker, i) => (
                    <div
                      key={`${speaker?.name || 'speaker'}-${i}`}
                      className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          Mentor {i + 1}
                        </span>
                        <button
                          type="button"
                          className="text-xs text-red-600 dark:text-red-300"
                          onClick={() =>
                            removeArrayItem(
                              ['speakers', 'people'],
                              speakersList,
                              i,
                            )
                          }
                        >
                          Remover
                        </button>
                      </div>
                      <div className="mt-3 grid gap-2">
                        <input
                          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Nome"
                          value={speaker?.name || ''}
                          onChange={(e) =>
                            updateArrayField(
                              ['speakers', 'people'],
                              speakersList,
                              i,
                              'name',
                              e.target.value,
                            )
                          }
                        />
                        <input
                          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Cargo / empresa"
                          value={speaker?.role || ''}
                          onChange={(e) =>
                            updateArrayField(
                              ['speakers', 'people'],
                              speakersList,
                              i,
                              'role',
                              e.target.value,
                            )
                          }
                        />
                        <textarea
                          className="min-h-[80px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Bio"
                          value={speaker?.bio || ''}
                          onChange={(e) =>
                            updateArrayField(
                              ['speakers', 'people'],
                              speakersList,
                              i,
                              'bio',
                              e.target.value,
                            )
                          }
                        />
                        <input
                          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Avatar (URL)"
                          value={speaker?.avatar || ''}
                          onChange={(e) =>
                            updateArrayField(
                              ['speakers', 'people'],
                              speakersList,
                              i,
                              'avatar',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    Ingressos
                  </h2>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() =>
                      addArrayItem(['tickets', 'plans'], ticketPlans, {
                        name: '',
                        price: '',
                        description: '',
                        badge: '',
                        featured: false,
                        features: [],
                      })
                    }
                  >
                    Adicionar plano
                  </button>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {[
                    { label: 'Título da seção', path: ['tickets', 'title'] },
                    { label: 'Subtítulo', path: ['tickets', 'subtitle'] },
                  ].map((field) => (
                    <div className="grid gap-1.5" key={field.label}>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {field.label}
                      </label>
                      <input
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                        value={getEventoValue(field.path, '')}
                        onChange={(e) =>
                          onChangePath(field.path, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Observação
                  </label>
                  <input
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    value={getEventoValue(['tickets', 'disclaimer'], '')}
                    onChange={(e) =>
                      onChangePath(['tickets', 'disclaimer'], e.target.value)
                    }
                  />
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  {ticketPlans.map((plan, i) => {
                    const features = Array.isArray(plan?.features)
                      ? plan.features
                      : [];
                    return (
                      <div
                        key={`${plan?.name || 'plan'}-${i}`}
                        className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            Plano {i + 1}
                          </span>
                          <button
                            type="button"
                            className="text-xs text-red-600 dark:text-red-300"
                            onClick={() =>
                              removeArrayItem(
                                ['tickets', 'plans'],
                                ticketPlans,
                                i,
                              )
                            }
                          >
                            Remover
                          </button>
                        </div>
                        <div className="mt-3 grid gap-2">
                          <input
                            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                            placeholder="Nome"
                            value={plan?.name || ''}
                            onChange={(e) =>
                              updateArrayField(
                                ['tickets', 'plans'],
                                ticketPlans,
                                i,
                                'name',
                                e.target.value,
                              )
                            }
                          />
                          <input
                            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                            placeholder="Preço"
                            value={plan?.price || ''}
                            onChange={(e) =>
                              updateArrayField(
                                ['tickets', 'plans'],
                                ticketPlans,
                                i,
                                'price',
                                e.target.value,
                              )
                            }
                          />
                          <input
                            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                            placeholder="Badge"
                            value={plan?.badge || ''}
                            onChange={(e) =>
                              updateArrayField(
                                ['tickets', 'plans'],
                                ticketPlans,
                                i,
                                'badge',
                                e.target.value,
                              )
                            }
                          />
                          <textarea
                            className="min-h-[70px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                            placeholder="Descrição"
                            value={plan?.description || ''}
                            onChange={(e) =>
                              updateArrayField(
                                ['tickets', 'plans'],
                                ticketPlans,
                                i,
                                'description',
                                e.target.value,
                              )
                            }
                          />
                          <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <input
                              type="checkbox"
                              checked={!!plan?.featured}
                              onChange={(e) =>
                                updateArrayField(
                                  ['tickets', 'plans'],
                                  ticketPlans,
                                  i,
                                  'featured',
                                  e.target.checked,
                                )
                              }
                            />
                            Destacar plano
                          </label>
                        </div>
                        <div className="mt-3 grid gap-1.5">
                          <label className="text-xs uppercase tracking-wide text-slate-500">
                            Benefícios (1 por linha)
                          </label>
                          <textarea
                            className="min-h-[90px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                            value={features.join('\n')}
                            onChange={(e) =>
                              updateArrayField(
                                ['tickets', 'plans'],
                                ticketPlans,
                                i,
                                'features',
                                linesToArray(e.target.value),
                              )
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    Parceiros
                  </h2>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() =>
                      addArrayItem(['partners', 'logos'], partnerLogos, {
                        name: '',
                        logo: '',
                      })
                    }
                  >
                    Adicionar parceiro
                  </button>
                </div>
                <div className="mt-4 grid gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Título da seção
                  </label>
                  <input
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    value={getEventoValue(['partners', 'title'], '')}
                    onChange={(e) =>
                      onChangePath(['partners', 'title'], e.target.value)
                    }
                  />
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {partnerLogos.map((partner, i) => (
                    <div
                      key={`${partner?.name || 'partner'}-${i}`}
                      className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          Parceiro {i + 1}
                        </span>
                        <button
                          type="button"
                          className="text-xs text-red-600 dark:text-red-300"
                          onClick={() =>
                            removeArrayItem(
                              ['partners', 'logos'],
                              partnerLogos,
                              i,
                            )
                          }
                        >
                          Remover
                        </button>
                      </div>
                      <div className="mt-3 grid gap-2">
                        <input
                          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Nome"
                          value={partner?.name || ''}
                          onChange={(e) =>
                            updateArrayField(
                              ['partners', 'logos'],
                              partnerLogos,
                              i,
                              'name',
                              e.target.value,
                            )
                          }
                        />
                        <input
                          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Logo (URL)"
                          value={partner?.logo || ''}
                          onChange={(e) =>
                            updateArrayField(
                              ['partners', 'logos'],
                              partnerLogos,
                              i,
                              'logo',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  Captura de leads
                </h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {[
                    { label: 'Badge', path: ['leadForm', 'badge'] },
                    { label: 'Título', path: ['leadForm', 'title'] },
                  ].map((field) => (
                    <div className="grid gap-1.5" key={field.label}>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {field.label}
                      </label>
                      <input
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                        value={getEventoValue(field.path, '')}
                        onChange={(e) =>
                          onChangePath(field.path, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Texto
                  </label>
                  <textarea
                    className="min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    value={getEventoValue(['leadForm', 'copy'], '')}
                    onChange={(e) =>
                      onChangePath(['leadForm', 'copy'], e.target.value)
                    }
                  />
                </div>
                <label className="mt-4 inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={!!getEventoValue(['leadForm', 'textWhite'], true)}
                    onChange={(e) =>
                      onChangePath(['leadForm', 'textWhite'], e.target.checked)
                    }
                  />
                  Usar texto branco sobre o gradiente
                </label>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    Depoimentos
                  </h2>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() =>
                      addArrayItem(['testimonials'], testimonials, {
                        name: '',
                        role: '',
                        text: '',
                      })
                    }
                  >
                    Adicionar depoimento
                  </button>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {testimonials.map((item, i) => (
                    <div
                      key={`${item?.name || 'testimonial'}-${i}`}
                      className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          Depoimento {i + 1}
                        </span>
                        <button
                          type="button"
                          className="text-xs text-red-600 dark:text-red-300"
                          onClick={() =>
                            removeArrayItem(['testimonials'], testimonials, i)
                          }
                        >
                          Remover
                        </button>
                      </div>
                      <div className="mt-3 grid gap-2">
                        <input
                          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Nome"
                          value={item?.name || ''}
                          onChange={(e) =>
                            updateArrayField(
                              ['testimonials'],
                              testimonials,
                              i,
                              'name',
                              e.target.value,
                            )
                          }
                        />
                        <input
                          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Cargo / empresa"
                          value={item?.role || ''}
                          onChange={(e) =>
                            updateArrayField(
                              ['testimonials'],
                              testimonials,
                              i,
                              'role',
                              e.target.value,
                            )
                          }
                        />
                        <textarea
                          className="min-h-[80px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          placeholder="Texto"
                          value={item?.text || ''}
                          onChange={(e) =>
                            updateArrayField(
                              ['testimonials'],
                              testimonials,
                              i,
                              'text',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  Formato / local
                </h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {[
                    { label: 'Título', path: ['venue', 'title'] },
                    { label: 'Endereço / link', path: ['venue', 'address'] },
                  ].map((field) => (
                    <div className="grid gap-1.5" key={field.label}>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {field.label}
                      </label>
                      <input
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                        value={getEventoValue(field.path, '')}
                        onChange={(e) =>
                          onChangePath(field.path, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Descrição
                  </label>
                  <textarea
                    className="min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    value={getEventoValue(['venue', 'description'], '')}
                    onChange={(e) =>
                      onChangePath(['venue', 'description'], e.target.value)
                    }
                  />
                </div>
                <div className="mt-4 grid gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Mapa (embed)
                  </label>
                  <input
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    value={getEventoValue(['venue', 'mapEmbed'], '')}
                    onChange={(e) =>
                      onChangePath(['venue', 'mapEmbed'], e.target.value)
                    }
                  />
                </div>
                <div className="mt-4 grid gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Destaques (1 por linha)
                  </label>
                  <textarea
                    className="min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    value={getEventoValue(['venue', 'highlights'], []).join(
                      '\n',
                    )}
                    onChange={(e) =>
                      onChangePath(
                        ['venue', 'highlights'],
                        linesToArray(e.target.value),
                      )
                    }
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    FAQ
                  </h2>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() => addArrayItem(['faq'], faq, { q: '', a: '' })}
                  >
                    Adicionar pergunta
                  </button>
                </div>
                <div className="mt-4 grid gap-3">
                  {faq.map((item, i) => (
                    <div
                      key={`${item?.q || 'faq'}-${i}`}
                      className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          Pergunta {i + 1}
                        </span>
                        <button
                          type="button"
                          className="text-xs text-red-600 dark:text-red-300"
                          onClick={() => removeArrayItem(['faq'], faq, i)}
                        >
                          Remover
                        </button>
                      </div>
                      <div className="mt-3 grid gap-1.5">
                        <label className="text-xs uppercase tracking-wide text-slate-500">
                          Pergunta
                        </label>
                        <input
                          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          value={item?.q || ''}
                          onChange={(e) =>
                            updateArrayField(
                              ['faq'],
                              faq,
                              i,
                              'q',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="mt-3 grid gap-1.5">
                        <label className="text-xs uppercase tracking-wide text-slate-500">
                          Resposta
                        </label>
                        <textarea
                          className="min-h-[80px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          value={item?.a || ''}
                          onChange={(e) =>
                            updateArrayField(
                              ['faq'],
                              faq,
                              i,
                              'a',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  Rodapé
                </h2>
                <div className="mt-4 grid gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Texto
                  </label>
                  <input
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    value={getEventoValue(['footer', 'note'], '')}
                    onChange={(e) =>
                      onChangePath(['footer', 'note'], e.target.value)
                    }
                  />
                </div>
              </section>

              <div className="flex justify-end">
                <button
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-sky-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:opacity-50 dark:bg-sky-500 dark:hover:bg-sky-600 dark:focus:ring-sky-700/40"
                  onClick={onSave}
                >
                  Salvar e visualizar
                </button>
              </div>
            </div>
          </div>
        </div>
        <AppFooter />
      </>
    );
  }

  if (isWaitlist) {
    const heroBulletsSnapshot = getWaitlistValue(['hero', 'bullets'], []);
    const heroBullets = Array.isArray(heroBulletsSnapshot)
      ? heroBulletsSnapshot
      : [];
    const heroStatsSnapshot = getWaitlistValue(['hero', 'stats'], []);
    const heroStats = Array.isArray(heroStatsSnapshot)
      ? heroStatsSnapshot
      : [];
    const highlightsSnapshot = getWaitlistValue(['highlights'], []);
    const highlights = Array.isArray(highlightsSnapshot)
      ? highlightsSnapshot
      : [];
    const milestonesSnapshot = getWaitlistValue(['milestones'], []);
    const milestones = Array.isArray(milestonesSnapshot)
      ? milestonesSnapshot
      : [];
    const perksSnapshot = getWaitlistValue(['perks'], []);
    const perks = Array.isArray(perksSnapshot) ? perksSnapshot : [];
    const socialLogosSnapshot = getWaitlistValue(['socialProof', 'logos'], []);
    const socialLogos = Array.isArray(socialLogosSnapshot)
      ? socialLogosSnapshot
      : [];
    const socialQuotesSnapshot = getWaitlistValue(
      ['socialProof', 'quotes'],
      [],
    );
    const socialQuotes = Array.isArray(socialQuotesSnapshot)
      ? socialQuotesSnapshot
      : [];
    const faqSnapshot = getWaitlistValue(['faq'], []);
    const faqList = Array.isArray(faqSnapshot) ? faqSnapshot : [];

    const updateThemeColor = (field, value) =>
      setContent((prev) => ({
        ...(prev || {}),
        theme: { ...(prev?.theme || {}), [field]: value },
      }));

    const updateObjectArrayField = (path, snapshot, index, field, value) =>
      setContent((prev) => {
        const list = getWorkingArray(prev, path, snapshot);
        while (list.length <= index) list.push({});
        const current = { ...(list[index] || {}) };
        current[field] = value;
        list[index] = current;
        return setIn(prev || {}, path, list);
      });

    const addArrayItem = (path, snapshot, template) =>
      setContent((prev) => {
        const list = getWorkingArray(prev, path, snapshot);
        list.push(template);
        return setIn(prev || {}, path, list);
      });

    const removeArrayItem = (path, snapshot, index) =>
      setContent((prev) => {
        const list = getWorkingArray(prev, path, snapshot);
        list.splice(index, 1);
        return setIn(prev || {}, path, list);
      });

    const updatePrimitiveArrayValue = (path, snapshot, index, value) =>
      setContent((prev) => {
        const list = getWorkingArray(prev, path, snapshot);
        while (list.length <= index) list.push('');
        list[index] = value;
        return setIn(prev || {}, path, list);
      });

    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
          <div className="mx-auto max-w-6xl px-6 py-10 lg:py-16">
            <header className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    Editar Landing Page
                  </h1>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    {lp.titulo} · Template: Lista de Espera
                  </p>
                </div>
                <button
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40"
                  onClick={() => nav(-1)}
                  type="button"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M19 12H5" />
                    <path d="M12 19l-7-7 7-7" />
                  </svg>
                  Voltar
                </button>
              </div>
            </header>

            <div className="grid gap-6">
              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  Paleta do template
                </h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Cor primária
                    </label>
                    <input
                      type="color"
                      value={getWaitlistValue(['theme', 'primary'], '#2563eb')}
                      onChange={(e) =>
                        updateThemeColor('primary', e.target.value)
                      }
                      className="h-11 w-24 cursor-pointer rounded-lg border border-slate-300 bg-white px-2 py-1 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Cor de destaque
                    </label>
                    <input
                      type="color"
                      value={getWaitlistValue(['theme', 'accent'], '#a855f7')}
                      onChange={(e) => updateThemeColor('accent', e.target.value)}
                      className="h-11 w-24 cursor-pointer rounded-lg border border-slate-300 bg-white px-2 py-1 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Fundo principal
                    </label>
                    <input
                      type="color"
                      value={getWaitlistValue(['theme', 'surface'], '#f8fafc')}
                      onChange={(e) =>
                        updateThemeColor('surface', e.target.value)
                      }
                      className="h-11 w-24 cursor-pointer rounded-lg border border-slate-300 bg-white px-2 py-1 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Cor do texto
                    </label>
                    <input
                      type="color"
                      value={getWaitlistValue(['theme', 'text'], '#0f172a')}
                      onChange={(e) => updateThemeColor('text', e.target.value)}
                      className="h-11 w-24 cursor-pointer rounded-lg border border-slate-300 bg-white px-2 py-1 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  Barra de anúncio
                </h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Rótulo
                    </label>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      value={getWaitlistValue(['announcement', 'label'], '')}
                      onChange={(e) =>
                        onChangePath(['announcement', 'label'], e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Texto
                    </label>
                    <textarea
                      className="min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      value={getWaitlistValue(['announcement', 'text'], '')}
                      onChange={(e) =>
                        onChangePath(['announcement', 'text'], e.target.value)
                      }
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  Hero
                </h2>
                <div className="mt-4 grid gap-4">
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Eyebrow / selo
                    </label>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      value={getWaitlistValue(['hero', 'eyebrow'], '')}
                      onChange={(e) =>
                        onChangePath(['hero', 'eyebrow'], e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Título
                    </label>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      value={getWaitlistValue(['hero', 'title'], '')}
                      onChange={(e) =>
                        onChangePath(['hero', 'title'], e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Subtítulo
                    </label>
                    <textarea
                      className="min-h-[110px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      value={getWaitlistValue(['hero', 'subtitle'], '')}
                      onChange={(e) =>
                        onChangePath(['hero', 'subtitle'], e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Título do formulário
                      </label>
                      <input
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                        value={getWaitlistValue(['hero', 'formTitle'], '')}
                        onChange={(e) =>
                          onChangePath(['hero', 'formTitle'], e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Texto do formulário
                      </label>
                      <textarea
                        className="min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                        value={getWaitlistValue(['hero', 'formSubtitle'], '')}
                        onChange={(e) =>
                          onChangePath(['hero', 'formSubtitle'], e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Nota abaixo do formulário
                    </label>
                    <textarea
                      className="min-h-[70px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      value={getWaitlistValue(['hero', 'note'], '')}
                      onChange={(e) =>
                        onChangePath(['hero', 'note'], e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        CTA principal · texto
                      </label>
                      <input
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                        value={getWaitlistValue(['hero', 'cta', 'label'], '')}
                        onChange={(e) =>
                          onChangePath(['hero', 'cta', 'label'], e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        CTA principal · link
                      </label>
                      <input
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                        value={getWaitlistValue(['hero', 'cta', 'href'], '')}
                        onChange={(e) =>
                          onChangePath(['hero', 'cta', 'href'], e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        CTA secundária · texto
                      </label>
                      <input
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                        value={getWaitlistValue(
                          ['hero', 'secondaryCta', 'label'],
                          '',
                        )}
                        onChange={(e) =>
                          onChangePath(
                            ['hero', 'secondaryCta', 'label'],
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        CTA secundária · link
                      </label>
                      <input
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                        value={getWaitlistValue(
                          ['hero', 'secondaryCta', 'href'],
                          '',
                        )}
                        onChange={(e) =>
                          onChangePath(
                            ['hero', 'secondaryCta', 'href'],
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="grid gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Slots · título
                      </label>
                      <input
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                        value={getWaitlistValue(['hero', 'slots', 'label'], '')}
                        onChange={(e) =>
                          onChangePath(['hero', 'slots', 'label'], e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Slots · valor
                      </label>
                      <input
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                        value={getWaitlistValue(['hero', 'slots', 'value'], '')}
                        onChange={(e) =>
                          onChangePath(['hero', 'slots', 'value'], e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Slots · legenda
                      </label>
                      <input
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                        value={getWaitlistValue(['hero', 'slots', 'caption'], '')}
                        onChange={(e) =>
                          onChangePath(
                            ['hero', 'slots', 'caption'],
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Imagem (URL)
                      </label>
                      <input
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                        value={getWaitlistValue(['hero', 'image'], '')}
                        onChange={(e) =>
                          onChangePath(['hero', 'image'], e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Texto alternativo
                      </label>
                      <input
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                        value={getWaitlistValue(['hero', 'imageAlt'], '')}
                        onChange={(e) =>
                          onChangePath(['hero', 'imageAlt'], e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    Hero · pontos-chave
                  </h2>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() =>
                      addArrayItem(
                        ['hero', 'bullets'],
                        heroBullets,
                        { title: '', description: '' },
                      )
                    }
                  >
                    Adicionar bullet
                  </button>
                </div>
                <div className="mt-4 grid gap-3">
                  {heroBullets.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Nenhum ponto cadastrado.
                    </p>
                  )}
                  {heroBullets.map((item, i) => (
                    <div
                      key={`${item?.title || 'bullet'}-${i}`}
                      className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          Bullet {i + 1}
                        </span>
                        <button
                          type="button"
                          className="text-xs text-red-600 dark:text-red-300"
                          onClick={() =>
                            removeArrayItem(
                              ['hero', 'bullets'],
                              heroBullets,
                              i,
                            )
                          }
                        >
                          Remover
                        </button>
                      </div>
                      <div className="mt-3 grid gap-1.5">
                        <label className="text-xs uppercase tracking-wide text-slate-500">
                          Título
                        </label>
                        <input
                          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          value={item?.title || ''}
                          onChange={(e) =>
                            updateObjectArrayField(
                              ['hero', 'bullets'],
                              heroBullets,
                              i,
                              'title',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="mt-3 grid gap-1.5">
                        <label className="text-xs uppercase tracking-wide text-slate-500">
                          Descrição
                        </label>
                        <textarea
                          className="min-h-[70px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          value={item?.description || ''}
                          onChange={(e) =>
                            updateObjectArrayField(
                              ['hero', 'bullets'],
                              heroBullets,
                              i,
                              'description',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    Hero · indicadores
                  </h2>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() =>
                      addArrayItem(
                        ['hero', 'stats'],
                        heroStats,
                        { value: '', label: '' },
                      )
                    }
                  >
                    Adicionar indicador
                  </button>
                </div>
                <div className="mt-4 grid gap-3">
                  {heroStats.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Nenhum indicador configurado.
                    </p>
                  )}
                  {heroStats.map((item, i) => (
                    <div
                      key={`${item?.label || 'stat'}-${i}`}
                      className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          Indicador {i + 1}
                        </span>
                        <button
                          type="button"
                          className="text-xs text-red-600 dark:text-red-300"
                          onClick={() =>
                            removeArrayItem(['hero', 'stats'], heroStats, i)
                          }
                        >
                          Remover
                        </button>
                      </div>
                      <div className="mt-3 grid gap-4 md:grid-cols-2">
                        <div className="grid gap-1.5">
                          <label className="text-xs uppercase tracking-wide text-slate-500">
                            Valor
                          </label>
                          <input
                            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                            value={item?.value || ''}
                            onChange={(e) =>
                              updateObjectArrayField(
                                ['hero', 'stats'],
                                heroStats,
                                i,
                                'value',
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <label className="text-xs uppercase tracking-wide text-slate-500">
                            Rótulo
                          </label>
                          <input
                            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                            value={item?.label || ''}
                            onChange={(e) =>
                              updateObjectArrayField(
                                ['hero', 'stats'],
                                heroStats,
                                i,
                                'label',
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    Destaques
                  </h2>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() =>
                      addArrayItem(['highlights'], highlights, {
                        tag: '',
                        title: '',
                        text: '',
                      })
                    }
                  >
                    Adicionar destaque
                  </button>
                </div>
                <div className="mt-4 grid gap-3">
                  {highlights.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Nenhum destaque configurado.
                    </p>
                  )}
                  {highlights.map((item, i) => (
                    <div
                      key={`${item?.title || 'highlight'}-${i}`}
                      className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          Bloco {i + 1}
                        </span>
                        <button
                          type="button"
                          className="text-xs text-red-600 dark:text-red-300"
                          onClick={() =>
                            removeArrayItem(['highlights'], highlights, i)
                          }
                        >
                          Remover
                        </button>
                      </div>
                      <div className="mt-3 grid gap-4 md:grid-cols-3">
                        <div className="grid gap-1.5">
                          <label className="text-xs uppercase tracking-wide text-slate-500">
                            Tag
                          </label>
                          <input
                            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                            value={item?.tag || ''}
                            onChange={(e) =>
                              updateObjectArrayField(
                                ['highlights'],
                                highlights,
                                i,
                                'tag',
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="grid gap-1.5 md:col-span-2">
                          <label className="text-xs uppercase tracking-wide text-slate-500">
                            Título
                          </label>
                          <input
                            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                            value={item?.title || ''}
                            onChange={(e) =>
                              updateObjectArrayField(
                                ['highlights'],
                                highlights,
                                i,
                                'title',
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className="mt-3 grid gap-1.5">
                        <label className="text-xs uppercase tracking-wide text-slate-500">
                          Texto
                        </label>
                        <textarea
                          className="min-h-[70px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          value={item?.text || ''}
                          onChange={(e) =>
                            updateObjectArrayField(
                              ['highlights'],
                              highlights,
                              i,
                              'text',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    Cronograma / milestones
                  </h2>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() =>
                      addArrayItem(['milestones'], milestones, {
                        label: '',
                        title: '',
                        description: '',
                        date: '',
                      })
                    }
                  >
                    Adicionar etapa
                  </button>
                </div>
                <div className="mt-4 grid gap-3">
                  {milestones.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Nenhuma etapa cadastrada.
                    </p>
                  )}
                  {milestones.map((item, i) => (
                    <div
                      key={`${item?.title || 'milestone'}-${i}`}
                      className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          Etapa {i + 1}
                        </span>
                        <button
                          type="button"
                          className="text-xs text-red-600 dark:text-red-300"
                          onClick={() =>
                            removeArrayItem(['milestones'], milestones, i)
                          }
                        >
                          Remover
                        </button>
                      </div>
                      <div className="mt-3 grid gap-4 md:grid-cols-2">
                        <div className="grid gap-1.5">
                          <label className="text-xs uppercase tracking-wide text-slate-500">
                            Label
                          </label>
                          <input
                            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                            value={item?.label || ''}
                            onChange={(e) =>
                              updateObjectArrayField(
                                ['milestones'],
                                milestones,
                                i,
                                'label',
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <label className="text-xs uppercase tracking-wide text-slate-500">
                            Data / observação
                          </label>
                          <input
                            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                            value={item?.date || ''}
                            onChange={(e) =>
                              updateObjectArrayField(
                                ['milestones'],
                                milestones,
                                i,
                                'date',
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className="mt-3 grid gap-1.5">
                        <label className="text-xs uppercase tracking-wide text-slate-500">
                          Título
                        </label>
                        <input
                          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          value={item?.title || ''}
                          onChange={(e) =>
                            updateObjectArrayField(
                              ['milestones'],
                              milestones,
                              i,
                              'title',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="mt-3 grid gap-1.5">
                        <label className="text-xs uppercase tracking-wide text-slate-500">
                          Descrição
                        </label>
                        <textarea
                          className="min-h-[70px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          value={item?.description || ''}
                          onChange={(e) =>
                            updateObjectArrayField(
                              ['milestones'],
                              milestones,
                              i,
                              'description',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    Benefícios exclusivos
                  </h2>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() =>
                      addArrayItem(['perks'], perks, {
                        icon: '✨',
                        title: '',
                        text: '',
                      })
                    }
                  >
                    Adicionar benefício
                  </button>
                </div>
                <div className="mt-4 grid gap-3">
                  {perks.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Nenhum benefício configurado.
                    </p>
                  )}
                  {perks.map((item, i) => (
                    <div
                      key={`${item?.title || 'perk'}-${i}`}
                      className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          Benefício {i + 1}
                        </span>
                        <button
                          type="button"
                          className="text-xs text-red-600 dark:text-red-300"
                          onClick={() => removeArrayItem(['perks'], perks, i)}
                        >
                          Remover
                        </button>
                      </div>
                      <div className="mt-3 grid gap-4 md:grid-cols-3">
                        <div className="grid gap-1.5">
                          <label className="text-xs uppercase tracking-wide text-slate-500">
                            Ícone / emoji
                          </label>
                          <input
                            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                            value={item?.icon || ''}
                            onChange={(e) =>
                              updateObjectArrayField(
                                ['perks'],
                                perks,
                                i,
                                'icon',
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="grid gap-1.5 md:col-span-2">
                          <label className="text-xs uppercase tracking-wide text-slate-500">
                            Título
                          </label>
                          <input
                            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                            value={item?.title || ''}
                            onChange={(e) =>
                              updateObjectArrayField(
                                ['perks'],
                                perks,
                                i,
                                'title',
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className="mt-3 grid gap-1.5">
                        <label className="text-xs uppercase tracking-wide text-slate-500">
                          Texto
                        </label>
                        <textarea
                          className="min-h-[70px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          value={item?.text || ''}
                          onChange={(e) =>
                            updateObjectArrayField(
                              ['perks'],
                              perks,
                              i,
                              'text',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  Prova social
                </h2>
                <div className="mt-4 grid gap-4">
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Legenda acima das logos
                    </label>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      value={getWaitlistValue(['socialProof', 'label'], '')}
                      onChange={(e) =>
                        onChangePath(['socialProof', 'label'], e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="mt-4 grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        Logos
                      </span>
                      <button
                        type="button"
                        className="text-xs text-slate-700 underline dark:text-slate-200"
                        onClick={() =>
                          addArrayItem(['socialProof', 'logos'], socialLogos, '')
                        }
                      >
                        Adicionar logo
                      </button>
                    </div>
                    <div className="mt-3 grid gap-3">
                      {socialLogos.length === 0 && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Nenhum logo cadastrado.
                        </p>
                      )}
                      {socialLogos.map((logo, i) => (
                        <div
                          key={`logo-${i}`}
                          className="flex items-center gap-3"
                        >
                          <input
                            className="h-10 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                            value={
                              typeof logo === 'string'
                                ? logo
                                : logo?.label || ''
                            }
                            onChange={(e) =>
                              updatePrimitiveArrayValue(
                                ['socialProof', 'logos'],
                                socialLogos,
                                i,
                                e.target.value,
                              )
                            }
                          />
                          <button
                            type="button"
                            className="text-xs text-red-600 dark:text-red-300"
                            onClick={() =>
                              removeArrayItem(
                                ['socialProof', 'logos'],
                                socialLogos,
                                i,
                              )
                            }
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        Depoimentos curtos
                      </span>
                      <button
                        type="button"
                        className="text-xs text-slate-700 underline dark:text-slate-200"
                        onClick={() =>
                          addArrayItem(['socialProof', 'quotes'], socialQuotes, {
                            text: '',
                            author: '',
                            role: '',
                          })
                        }
                      >
                        Adicionar depoimento
                      </button>
                    </div>
                    <div className="mt-3 grid gap-3">
                      {socialQuotes.length === 0 && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Nenhum depoimento cadastrado.
                        </p>
                      )}
                      {socialQuotes.map((quote, i) => (
                        <div
                          key={`${quote?.author || 'quote'}-${i}`}
                          className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Depoimento {i + 1}
                            </span>
                            <button
                              type="button"
                              className="text-xs text-red-600 dark:text-red-300"
                              onClick={() =>
                                removeArrayItem(
                                  ['socialProof', 'quotes'],
                                  socialQuotes,
                                  i,
                                )
                              }
                            >
                              Remover
                            </button>
                          </div>
                          <div className="mt-3 grid gap-1.5">
                            <label className="text-xs uppercase tracking-wide text-slate-500">
                              Texto
                            </label>
                            <textarea
                              className="min-h-[70px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                              value={quote?.text || ''}
                              onChange={(e) =>
                                updateObjectArrayField(
                                  ['socialProof', 'quotes'],
                                  socialQuotes,
                                  i,
                                  'text',
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="mt-3 grid gap-4 md:grid-cols-2">
                            <div className="grid gap-1.5">
                              <label className="text-xs uppercase tracking-wide text-slate-500">
                                Autor(a)
                              </label>
                              <input
                                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                                value={quote?.author || ''}
                                onChange={(e) =>
                                  updateObjectArrayField(
                                    ['socialProof', 'quotes'],
                                    socialQuotes,
                                    i,
                                    'author',
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div className="grid gap-1.5">
                              <label className="text-xs uppercase tracking-wide text-slate-500">
                                Cargo / empresa
                              </label>
                              <input
                                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                                value={quote?.role || ''}
                                onChange={(e) =>
                                  updateObjectArrayField(
                                    ['socialProof', 'quotes'],
                                    socialQuotes,
                                    i,
                                    'role',
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  CTA final
                </h2>
                <div className="mt-4 grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Eyebrow
                      </label>
                      <input
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                        value={getWaitlistValue(['finalCta', 'eyebrow'], '')}
                        onChange={(e) =>
                          onChangePath(['finalCta', 'eyebrow'], e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Título
                      </label>
                      <input
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                        value={getWaitlistValue(['finalCta', 'title'], '')}
                        onChange={(e) =>
                          onChangePath(['finalCta', 'title'], e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Subtítulo
                    </label>
                    <textarea
                      className="min-h-[90px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      value={getWaitlistValue(['finalCta', 'subtitle'], '')}
                      onChange={(e) =>
                        onChangePath(['finalCta', 'subtitle'], e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Nota
                    </label>
                    <textarea
                      className="min-h-[70px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                      value={getWaitlistValue(['finalCta', 'note'], '')}
                      onChange={(e) =>
                        onChangePath(['finalCta', 'note'], e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        CTA · texto
                      </label>
                      <input
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                        value={getWaitlistValue(['finalCta', 'cta', 'label'], '')}
                        onChange={(e) =>
                          onChangePath(
                            ['finalCta', 'cta', 'label'],
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        CTA · link
                      </label>
                      <input
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                        value={getWaitlistValue(['finalCta', 'cta', 'href'], '')}
                        onChange={(e) =>
                          onChangePath(['finalCta', 'cta', 'href'], e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    FAQ
                  </h2>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() =>
                      addArrayItem(['faq'], faqList, { q: '', a: '' })
                    }
                  >
                    Adicionar pergunta
                  </button>
                </div>
                <div className="mt-4 grid gap-3">
                  {faqList.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Nenhuma pergunta configurada.
                    </p>
                  )}
                  {faqList.map((item, i) => (
                    <div
                      key={`${item?.q || 'faq'}-${i}`}
                      className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          Pergunta {i + 1}
                        </span>
                        <button
                          type="button"
                          className="text-xs text-red-600 dark:text-red-300"
                          onClick={() =>
                            removeArrayItem(['faq'], faqList, i)
                          }
                        >
                          Remover
                        </button>
                      </div>
                      <div className="mt-3 grid gap-1.5">
                        <label className="text-xs uppercase tracking-wide text-slate-500">
                          Pergunta
                        </label>
                        <input
                          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          value={item?.q || ''}
                          onChange={(e) =>
                            updateObjectArrayField(
                              ['faq'],
                              faqList,
                              i,
                              'q',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="mt-3 grid gap-1.5">
                        <label className="text-xs uppercase tracking-wide text-slate-500">
                          Resposta
                        </label>
                        <textarea
                          className="min-h-[80px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                          value={item?.a || ''}
                          onChange={(e) =>
                            updateObjectArrayField(
                              ['faq'],
                              faqList,
                              i,
                              'a',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  Rodapé
                </h2>
                <div className="mt-4 grid gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Texto legal / direitos
                  </label>
                  <input
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                    value={getWaitlistValue(['footer', 'note'], '')}
                    onChange={(e) =>
                      onChangePath(['footer', 'note'], e.target.value)
                    }
                  />
                </div>
              </section>

              <div className="flex justify-end">
                <button
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-sky-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:opacity-50 dark:bg-sky-500 dark:hover:bg-sky-600 dark:focus:ring-sky-700/40"
                  onClick={onSave}
                >
                  Salvar e visualizar
                </button>
              </div>
            </div>
          </div>
        </div>
        <AppFooter />
      </>
    );
  }

  // Editor genérico (templates simples)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:py-16">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Editar Landing Page
              </h1>
              <p className="mt-1 text-slate-600 dark:text-slate-300">
                {lp.titulo}
              </p>
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-sky-700/40"
              onClick={() => nav(-1)}
              type="button"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-md backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Cor do tema
              </label>
              <input
                type="color"
                value={content.theme}
                onChange={(e) => onChange('theme', e.target.value)}
                className="h-11 w-24 cursor-pointer rounded-lg border border-slate-300 bg-white px-2 py-1 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Headline
              </label>
              <input
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-700/40"
                placeholder="Headline"
                value={content.headline}
                onChange={(e) => onChange('headline', e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <button
                className="inline-flex h-11 items-center justify-center rounded-lg bg-sky-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:opacity-50 dark:bg-sky-500 dark:hover:bg-sky-600 dark:focus:ring-sky-700/40"
                onClick={onSave}
              >
                Salvar e visualizar
              </button>
            </div>
          </div>
        </section>
      </div>
      <AppFooter />
    </div>
  );
}
