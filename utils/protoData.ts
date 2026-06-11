/* ============================================================
   eenvo CRM — dados do protótipo de alta fidelidade (port de data.jsx)
   ============================================================ */
const P = (g: string, n: number) => `https://randomuser.me/api/portraits/${g}/${n}.jpg`

export const STAGES = [
  { id: 'mapeado', name: 'Mapeado', color: '#8A8F99' },
  { id: 'contatado', name: 'Contatado', color: '#2563EB' },
  { id: 'reuniao', name: 'Reunião marcada', color: '#8E3FC4' },
  { id: 'apresentado', name: 'Apresentado', color: '#0891B2' },
  { id: 'proposta', name: 'Proposta enviada', color: '#D97706' },
  { id: 'perdido', name: 'Perdido', color: '#DC2626' }
]

export const AMBIENTES = [
  { id: 'centelha', name: 'Projeto Centelha', short: 'Centelha', color: '#8E3FC4', icon: 'sparkles', desc: 'Programa de inovação · multi-estado' },
  { id: 'indicacao', name: 'Indicação', short: 'Indicação', color: '#16A34A', icon: 'users', desc: 'Indicado por cliente ou parceiro' },
  { id: 'inbound', name: 'Inbound', short: 'Inbound', color: '#2563EB', icon: 'globe', desc: 'Site, conteúdo e busca orgânica' },
  { id: 'evento', name: 'Evento', short: 'Evento', color: '#D97706', icon: 'star', desc: 'Feiras e eventos do setor' }
]
export const amb = (id: string) => AMBIENTES.find((a) => a.id === id)

const UF_REGIAO: Record<string, string> = {
  SP: 'Sudeste', RJ: 'Sudeste', MG: 'Sudeste', ES: 'Sudeste',
  PR: 'Sul', SC: 'Sul', RS: 'Sul',
  BA: 'Nordeste', PE: 'Nordeste', CE: 'Nordeste',
  GO: 'Centro-Oeste', DF: 'Centro-Oeste', MT: 'Centro-Oeste'
}
export const regiao = (uf: string) => UF_REGIAO[uf] || '—'

const LOGO_COLORS = ['#8E3FC4', '#2563EB', '#0891B2', '#16A34A', '#D97706', '#DB2777', '#0EA5E9', '#F97316', '#6366F1', '#0D9488']

const REF = {
  mariana: { name: 'Mariana Lopes', role: 'Diretora · Loja Viva (cliente eenvo)', company: 'Loja Viva', email: 'mariana@lojaviva.com.br', phone: '+55 11 99812-3344', photo: P('women', 47) },
  carlos: { name: 'Carlos Eduardo', role: 'Sócio · Casa&Cia', company: 'Casa&Cia', email: 'carlos@casaecia.com.br', phone: '+55 31 99744-1180', photo: P('men', 77) },
  helena: { name: 'Helena Dias', role: 'COO · Bun Express (parceiro)', company: 'Bun Express', email: 'helena@bunexpress.com.br', phone: '+55 51 99650-2210', photo: P('women', 50) },
  ricardo: { name: 'Ricardo Mendes', role: 'CEO · ModaPlus (cliente eenvo)', company: 'ModaPlus', email: 'ricardo@modaplus.com.br', phone: '+55 11 99588-7711', photo: P('men', 85) }
}

export const LEADS: any[] = [
  { id: 'L-1042', company: 'Lojas Maré', seg: 'Moda & Vestuário', value: 2890, stage: 'proposta', temp: 'quente', site: 'lojasmare.com.br', ambiente: 'centelha', estado: 'SP', centelhaFase: 'Fase 2 · aprovado', contact: { name: 'Fernanda Reis', role: 'Diretora de Operações', email: 'fernanda@lojasmare.com.br', phone: '+55 11 98821-4410', photo: P('women', 44) }, city: 'São Paulo, SP', employees: '50–120', shipments: '~4.200/mês', created: '2026-05-12', next: { label: 'Enviar contrato revisado', date: '2026-06-10', due: true }, tags: [{ t: 'Enterprise', c: 'purple' }, { t: 'Multi-CD', c: 'info' }] },
  { id: 'L-1051', company: 'BeautyBox', seg: 'Cosméticos', value: 1740, stage: 'reuniao', temp: 'quente', site: 'beautybox.com.br', ambiente: 'indicacao', estado: 'RJ', indicadoPor: REF.mariana, contact: { name: 'Lucas Andrade', role: 'Head de E-commerce', email: 'lucas@beautybox.com.br', phone: '+55 21 99654-2201', photo: P('men', 45) }, city: 'Rio de Janeiro, RJ', employees: '20–50', shipments: '~1.800/mês', created: '2026-05-21', next: { label: 'Call de descoberta — 14h', date: '2026-06-11', due: false }, tags: [{ t: 'Growth', c: 'info' }] },
  { id: 'L-1063', company: 'TechNova', seg: 'Eletrônicos', value: 4250, stage: 'apresentado', temp: 'morno', site: 'technova.com.br', ambiente: 'centelha', estado: 'SP', centelhaFase: 'Fase 2 · aprovado', contact: { name: 'Patrícia Gomes', role: 'COO', email: 'patricia@technova.com.br', phone: '+55 11 97712-9008', photo: P('women', 68) }, city: 'Campinas, SP', employees: '120–300', shipments: '~9.500/mês', created: '2026-04-30', next: { label: 'Follow-up pós-demo', date: '2026-06-12', due: false }, tags: [{ t: 'Enterprise', c: 'purple' }, { t: 'Integração ERP', c: 'warn' }] },
  { id: 'L-1071', company: 'Verde Casa', seg: 'Casa & Decoração', value: 980, stage: 'contatado', temp: 'morno', site: 'verdecasa.com.br', ambiente: 'indicacao', estado: 'MG', indicadoPor: REF.carlos, contact: { name: 'Roberto Dias', role: 'Fundador', email: 'roberto@verdecasa.com.br', phone: '+55 31 98123-7745', photo: P('men', 76) }, city: 'Belo Horizonte, MG', employees: '5–20', shipments: '~620/mês', created: '2026-05-28', next: { label: 'Reengajar por e-mail', date: '2026-06-13', due: false }, tags: [{ t: 'SMB', c: 'gray' }] },
  { id: 'L-1080', company: 'PetClube', seg: 'Pet Shop', value: 1320, stage: 'mapeado', temp: 'frio', site: 'petclube.com.br', ambiente: 'centelha', estado: 'PR', centelhaFase: 'Fase 1 · em análise', contact: { name: 'Mariana Costa', role: 'Gerente de Logística', email: 'mariana@petclube.com.br', phone: '+55 41 99001-2233', photo: P('women', 65) }, city: 'Curitiba, PR', employees: '20–50', shipments: '~1.100/mês', created: '2026-06-02', next: { label: 'Primeira abordagem', date: '2026-06-16', due: false }, tags: [{ t: 'SMB', c: 'gray' }] },
  { id: 'L-1088', company: 'FitStore', seg: 'Suplementos', value: 2150, stage: 'proposta', temp: 'quente', site: 'fitstore.com.br', ambiente: 'inbound', estado: 'SP', contact: { name: 'Thiago Mendes', role: 'CEO', email: 'thiago@fitstore.com.br', phone: '+55 11 96543-8890', photo: P('men', 22) }, city: 'São Paulo, SP', employees: '50–120', shipments: '~3.400/mês', created: '2026-05-08', next: { label: 'Negociar desconto anual', date: '2026-06-11', due: false }, tags: [{ t: 'Growth', c: 'info' }, { t: 'Anual', c: 'pos' }] },
  { id: 'L-1094', company: 'Kids&Co', seg: 'Infantil', value: 760, stage: 'contatado', temp: 'morno', site: 'kidseco.com.br', ambiente: 'indicacao', estado: 'RS', indicadoPor: REF.helena, contact: { name: 'Juliana Prado', role: 'Sócia', email: 'juliana@kidseco.com.br', phone: '+55 51 98877-1100', photo: P('women', 12) }, city: 'Porto Alegre, RS', employees: '5–20', shipments: '~540/mês', created: '2026-05-30', next: { label: 'Enviar material', date: '2026-06-14', due: false }, tags: [{ t: 'SMB', c: 'gray' }] },
  { id: 'L-1101', company: 'Urban Bags', seg: 'Acessórios', value: 1580, stage: 'reuniao', temp: 'quente', site: 'urbanbags.com.br', ambiente: 'inbound', estado: 'SP', contact: { name: 'Felipe Araújo', role: 'Diretor Comercial', email: 'felipe@urbanbags.com.br', phone: '+55 11 97654-3321', photo: P('men', 52) }, city: 'São Paulo, SP', employees: '20–50', shipments: '~1.450/mês', created: '2026-05-19', next: { label: 'Demo técnica — 10h', date: '2026-06-11', due: false }, tags: [{ t: 'Growth', c: 'info' }] },
  { id: 'L-1109', company: 'Naturê', seg: 'Alimentos Naturais', value: 1190, stage: 'apresentado', temp: 'morno', site: 'nature.com.br', ambiente: 'centelha', estado: 'SP', centelhaFase: 'Fase 2 · aprovado', contact: { name: 'Camila Ferreira', role: 'Head de Operações', email: 'camila@nature.com.br', phone: '+55 19 99332-4456', photo: P('women', 30) }, city: 'Ribeirão Preto, SP', employees: '20–50', shipments: '~970/mês', created: '2026-05-15', next: { label: 'Enviar proposta', date: '2026-06-12', due: false }, tags: [{ t: 'Growth', c: 'info' }] },
  { id: 'L-1115', company: 'DecorArte', seg: 'Decoração', value: 3100, stage: 'mapeado', temp: 'frio', site: 'decorarte.com.br', ambiente: 'evento', estado: 'SP', eventoNome: 'E-commerce Brasil 2026', contact: { name: 'Gustavo Lima', role: 'Diretor', email: 'gustavo@decorarte.com.br', phone: '+55 11 98090-1212', photo: P('men', 60) }, city: 'São Paulo, SP', employees: '120–300', shipments: '~6.800/mês', created: '2026-06-03', next: { label: 'Pesquisar stakeholders', date: '2026-06-17', due: false }, tags: [{ t: 'Enterprise', c: 'purple' }] },
  { id: 'L-1120', company: 'SportMax', seg: 'Artigos Esportivos', value: 2680, stage: 'perdido', temp: 'frio', site: 'sportmax.com.br', ambiente: 'inbound', estado: 'SP', contact: { name: 'Renata Alves', role: 'COO', email: 'renata@sportmax.com.br', phone: '+55 11 96677-8899', photo: P('women', 90) }, city: 'Guarulhos, SP', employees: '50–120', shipments: '~2.900/mês', created: '2026-04-22', next: { label: '—', date: '', due: false }, lostReason: 'Optou por concorrente (preço)', tags: [{ t: 'Perdido', c: 'neg' }] },
  { id: 'L-1126', company: 'Aroma Café', seg: 'Alimentos & Bebidas', value: 890, stage: 'contatado', temp: 'morno', site: 'aromacafe.com.br', ambiente: 'inbound', estado: 'RJ', contact: { name: 'Bruno Tavares', role: 'Fundador', email: 'bruno@aromacafe.com.br', phone: '+55 21 98445-6677', photo: P('men', 15) }, city: 'Niterói, RJ', employees: '5–20', shipments: '~410/mês', created: '2026-06-01', next: { label: 'Ligar para qualificar', date: '2026-06-13', due: false }, tags: [{ t: 'SMB', c: 'gray' }] },
  { id: 'L-1131', company: 'Bella Moda', seg: 'Moda & Vestuário', value: 1980, stage: 'reuniao', temp: 'quente', site: 'bellamoda.com.br', ambiente: 'indicacao', estado: 'SP', indicadoPor: REF.ricardo, contact: { name: 'Sofia Ribeiro', role: 'Head de E-commerce', email: 'sofia@bellamoda.com.br', phone: '+55 11 97001-5566', photo: P('women', 79) }, city: 'São Paulo, SP', employees: '50–120', shipments: '~2.300/mês', created: '2026-05-25', next: { label: 'Reunião com diretoria', date: '2026-06-12', due: false }, tags: [{ t: 'Growth', c: 'info' }] },
  { id: 'L-1137', company: 'GameZone', seg: 'Games', value: 3520, stage: 'apresentado', temp: 'quente', site: 'gamezone.com.br', ambiente: 'centelha', estado: 'SP', centelhaFase: 'Fase 2 · aprovado', contact: { name: 'André Castro', role: 'CEO', email: 'andre@gamezone.com.br', phone: '+55 11 96000-7788', photo: P('men', 11) }, city: 'São Paulo, SP', employees: '120–300', shipments: '~7.200/mês', created: '2026-05-10', next: { label: 'Alinhar proposta técnica', date: '2026-06-11', due: false }, tags: [{ t: 'Enterprise', c: 'purple' }, { t: 'API', c: 'warn' }] },
  { id: 'L-1140', company: 'EcoVerde', seg: 'Sustentáveis', value: 1050, stage: 'mapeado', temp: 'frio', site: 'ecoverde.com.br', ambiente: 'centelha', estado: 'SC', centelhaFase: 'Fase 1 · em análise', contact: { name: 'Larissa Monteiro', role: 'Sócia', email: 'larissa@ecoverde.com.br', phone: '+55 48 99112-3344', photo: P('women', 33) }, city: 'Florianópolis, SC', employees: '5–20', shipments: '~480/mês', created: '2026-06-04', next: { label: 'Conectar no LinkedIn', date: '2026-06-18', due: false }, tags: [{ t: 'SMB', c: 'gray' }] },
  { id: 'L-1145', company: 'Móveis Lar', seg: 'Móveis', value: 4680, stage: 'proposta', temp: 'quente', site: 'moveislar.com.br', ambiente: 'evento', estado: 'SP', eventoNome: 'Intralogística 2026', contact: { name: 'Paulo Henrique', role: 'Diretor de Operações', email: 'paulo@moveislar.com.br', phone: '+55 11 95544-2211', photo: P('men', 3) }, city: 'São Bernardo, SP', employees: '300+', shipments: '~12.000/mês', created: '2026-04-28', next: { label: 'Aprovação jurídica do cliente', date: '2026-06-13', due: false }, tags: [{ t: 'Enterprise', c: 'purple' }, { t: 'Frete pesado', c: 'warn' }] }
]
LEADS.forEach((l, i) => {
  l.logo = LOGO_COLORS[i % LOGO_COLORS.length]
  l.initials = l.company.replace(/[^A-Za-zÀ-ÿ]/g, '').slice(0, 2).toUpperCase()
  l.regiao = regiao(l.estado)
})

export const initials = (s: string) => s.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

export const TIMELINE = [
  { type: 'note', who: 'Você', act: 'adicionou uma nota', time: 'Hoje · 09:14', body: 'Fernanda confirmou que o volume de envios sobe ~40% na Black Friday. Ponto-chave: SLA de coleta no CD de Cajamar. Proposta precisa contemplar prioridade de coleta.' },
  { type: 'email', who: 'Você', act: 'enviou um e-mail', time: 'Ontem · 17:40', body: 'Reenviei a proposta com a faixa de R$ 2.890/mês (até 5k envios) + excedente a R$ 0,42/envio. Pedi retorno até sexta.' },
  { type: 'call', who: 'Você', act: 'registrou uma ligação · 22min', time: '08 jun · 11:02', body: 'Alinhamento técnico: integração via API com a plataforma VTEX deles. Sem bloqueios. Encaminhei docs para o time de TI.' },
  { type: 'meet', who: 'Você', act: 'realizou uma reunião', time: '05 jun · 15:00', body: 'Demo da gestão de envios + rastreio white-label. Diretoria gostou do painel de SLA por transportadora.' },
  { type: 'stage', who: 'Você', act: 'moveu para Proposta enviada', time: '05 jun · 16:20', body: '' }
]

export const EVENTS = [
  { day: 0, start: 9.5, end: 10, title: 'Daily comercial', type: 'internal', synced: true },
  { day: 0, start: 16, end: 16.5, title: 'Reengajar — Verde Casa', type: 'call', synced: false },
  { day: 1, start: 10, end: 11, title: 'Demo técnica — Urban Bags', type: 'meet', synced: true, loc: 'Google Meet' },
  { day: 1, start: 14, end: 14.75, title: 'Call descoberta — BeautyBox', type: 'call', synced: true },
  { day: 2, start: 9, end: 9.5, title: 'Follow-up — Naturê', type: 'call', synced: true },
  { day: 2, start: 11, end: 12, title: 'Reunião diretoria — Bella Moda', type: 'meet', synced: true, loc: 'Google Meet' },
  { day: 2, start: 15, end: 16, title: 'Alinhar proposta — GameZone', type: 'meet', synced: true },
  { day: 3, start: 10, end: 11, title: 'Follow-up pós-demo — TechNova', type: 'call', synced: true },
  { day: 3, start: 13.5, end: 14, title: 'Pesquisar stakeholders — DecorArte', type: 'task', synced: false },
  { day: 4, start: 13, end: 14, title: 'Aprovação contrato — Móveis Lar', type: 'meet', synced: true, loc: 'Presencial' },
  { day: 4, start: 16, end: 16.5, title: 'Enviar contrato — Lojas Maré', type: 'task', synced: true }
]

export const NAV = [
  { group: 'Comercial', items: [
    { id: 'dashboard', label: 'Visão geral', icon: 'grid', to: '/' },
    { id: 'pipeline', label: 'Pipeline', icon: 'kanban', count: 15, to: '/pipeline' },
    { id: 'contacts', label: 'Contatos', icon: 'users', to: '/contatos' },
    { id: 'ambientes', label: 'Ambientes', icon: 'sparkles', to: '/ambientes' },
    { id: 'agenda', label: 'Agenda', icon: 'calendar', to: '/agenda' }
  ] },
  { group: 'Gestão', items: [
    { id: 'reports', label: 'Relatórios', icon: 'chart', to: '/relatorios' },
    { id: 'settings', label: 'Configurações', icon: 'settings', to: '/configuracoes' }
  ] }
]

export const me = { name: 'Diego Martins', role: 'Head Comercial', photo: P('men', 32) }

export const fmtBRL = (n: number) => 'R$ ' + Math.round(n || 0).toLocaleString('pt-BR')
