<template>
  <header class="topbar">
    <div class="search">
      <Icon name="search" :size="17" />
      <input placeholder="Buscar leads, contatos, empresas…" />
      <span class="kbd">⌘K</span>
    </div>
    <div class="tb-right">
      <button class="btn btn-primary" @click="openNewLead">
        <Icon name="plus" :size="17" /> Novo lead
      </button>
      <button class="icon-btn" :class="{ spinning: spin }" title="Atualizar" @click="refresh">
        <Icon name="refresh" :size="18" />
      </button>

      <div class="pop-wrap">
        <button class="icon-btn" title="Notificações" @click="toggle('notif')">
          <Icon name="bell" :size="18" /><span v-if="unread" class="dot" />
        </button>
        <template v-if="menu === 'notif'">
          <div class="pop-backdrop" @click="menu = null" />
          <div class="popover notif-pop">
            <div class="pop-head"><span>Notificações <em v-if="unread">{{ unread }} novas</em></span><button class="lnk" @click="markAll">Marcar todas como lidas</button></div>
            <div class="pop-list">
              <div v-for="(n, i) in notifs" :key="i" class="notif-item" :class="{ unread: n.unread }">
                <span class="ni-ic" :style="{ background: n.bg, color: n.fg }"><Icon :name="n.icon" :size="16" /></span>
                <div class="grow"><div class="ni-t">{{ n.t }}</div><div class="ni-d">{{ n.d }}</div></div>
                <span class="ni-time">{{ n.time }}</span>
              </div>
            </div>
            <div class="pop-foot"><button class="lnk">Ver todas as notificações</button></div>
          </div>
        </template>
      </div>

      <div class="pop-wrap">
        <div class="tb-user" @click="toggle('profile')">
          <span class="avatar ring" style="width:36px;height:36px;font-size:14px;background:#8E3FC4">
            <img v-if="me.photo" :src="me.photo" :alt="me.name" @error="photoErr = true" v-show="!photoErr" />
            <template v-if="photoErr">{{ ini }}</template>
          </span>
          <div class="meta"><div class="nm">{{ me.name }}</div><div class="rl">{{ me.role }}</div></div>
          <Icon name="chevron-down" :size="16" style="color:var(--ink-3)" />
        </div>
        <template v-if="menu === 'profile'">
          <div class="pop-backdrop" @click="menu = null" />
          <div class="popover profile-pop">
            <div class="pp-head">
              <span class="avatar" style="width:42px;height:42px;font-size:16px;background:#8E3FC4">
                <img v-if="me.photo && !photoErr" :src="me.photo" :alt="me.name" />
                <template v-else>{{ ini }}</template>
              </span>
              <div class="grow"><div class="pp-nm">{{ me.name }}</div><div class="pp-em">diego@eenvo.com.br</div></div>
            </div>
            <button class="pp-item" @click="goConfig"><Icon name="users" :size="16" /> Meu perfil</button>
            <button class="pp-item" @click="goConfig"><Icon name="settings" :size="16" /> Configurações</button>
            <div class="pp-sep" />
            <button class="pp-item danger" @click="sair"><Icon name="logout" :size="16" /> Sair</button>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { me, initials } from '~/utils/protoData'

const { logout } = useAuth()
const { openNewLead } = useOverlays()
const menu = ref<string | null>(null)
const spin = ref(false)
const photoErr = ref(false)
const ini = initials(me.name)

const notifs = ref([
  { icon: 'sparkles', bg: '#F3EAFB', fg: '#8E3FC4', t: 'Novo lead via Centelha', d: 'PetClube entrou no pipeline', time: '5 min', unread: true },
  { icon: 'check-circle', bg: '#ECFDF3', fg: '#16A34A', t: 'Proposta aceita', d: 'FitStore aprovou o plano anual', time: '1 h', unread: true },
  { icon: 'calendar', bg: '#EFF4FF', fg: '#2563EB', t: 'Reunião hoje às 14h', d: 'Call de descoberta — BeautyBox', time: '2 h', unread: false }
])
const unread = computed(() => notifs.value.filter((n) => n.unread).length)

function toggle(m: string) { menu.value = menu.value === m ? null : m }
function markAll() { notifs.value.forEach((n) => (n.unread = false)) }
function refresh() { spin.value = true; setTimeout(() => (spin.value = false), 700) }
function novoLead() { /* abre modal de novo lead (a portar) */ }
function goConfig() { menu.value = null; navigateTo('/configuracoes') }
async function sair() { menu.value = null; await logout() }
</script>
