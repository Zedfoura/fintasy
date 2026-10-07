/**
 * @author: adibarra (Alec Ibarra)
 * @description: Pinia store for handling app state
 */

import { acceptHMRUpdate, defineStore } from 'pinia'
import type { Portfolio, Tournament, Transaction } from '~/types'

const fintasy = useAPI()

export const useStateStore = defineStore('state', () => {
  interface UserState {
    uuid: string
    username: string
    coins: number
    created_at: string
    isGuest?: boolean
  }

  interface PortfolioState {
    active: number
    available: Portfolio[]
  }

  const user = useStorage<UserState>('state-user', {
    uuid: '',
    username: '',
    coins: 0,
    created_at: '',
    isGuest: false,
  })
  const portfolio = ref<PortfolioState>({
    active: 0,
    available: [],
  })
  const transactions = ref<Transaction[]>([])
  const tournaments = ref<Tournament[]>([])

  // Reactive authentication getters
  const isAuthenticated = computed(() => Boolean(fintasy.authenticated.value && user.value.uuid))
  const isGuest = computed(() => Boolean(user.value.isGuest || user.value.username === 'guest_trader'))

  function clearUserState() {
    user.value.uuid = ''
    user.value.username = ''
    user.value.coins = 0
    user.value.created_at = ''
    user.value.isGuest = false
    portfolio.value.active = 0
    portfolio.value.available = []
    transactions.value = []
    tournaments.value = []
  }

  async function loginAsGuest() {
    const res = await fintasy.loginAsGuest()
    if (res.code === 200 && 'data' in res && res.data) {
      user.value.uuid = res.data.owner
      user.value.username = 'guest_trader'
      user.value.coins = 1500000 // $15,000 in integer cents (INV-1)
      user.value.isGuest = true
      user.value.created_at = new Date().toISOString()
      await refreshAll()
      return res
    }
    return res
  }

  async function logout() {
    await fintasy.logout()
    clearUserState()
  }

  async function refreshUser() {
    if (!user.value.uuid)
      return

    const userRequest = await fintasy.getUser({ uuid: user.value.uuid })
    if (userRequest.code !== 200 || !('data' in userRequest) || !userRequest.data)
      return

    user.value.username = userRequest.data.username
    user.value.coins = userRequest.data.coins
    user.value.created_at = userRequest.data.created_at

    await refreshPortfolios()
  }

  async function refreshPortfolios() {
    if (!user.value.uuid)
      return

    const portfoliosRequest = await fintasy.getPortfolios({ owner: user.value.uuid, limit: 99 })
    if (portfoliosRequest.code !== 200 || !('data' in portfoliosRequest) || !portfoliosRequest.data)
      return

    if (portfolio.value.available.length < portfolio.value.active + 1)
      portfolio.value.active = 0

    portfolio.value.available = portfoliosRequest.data
      .toSorted((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    if (portfoliosRequest.data.length === 0) {
      const createPortfolioRequest = await fintasy.createPortfolio({ name: 'Default Portfolio' })
      if (createPortfolioRequest.code !== 200 || !('data' in createPortfolioRequest) || !createPortfolioRequest.data)
        return

      portfolio.value.available = [createPortfolioRequest.data]
    }

    await refreshTransactions()
  }

  async function refreshTransactions() {
    if (portfolio.value.available.length === 0)
      return

    const portfolioUUID = portfolio.value.available[portfolio.value.active].uuid
    const transactionsRequest = await fintasy.getTransactions({ portfolio: portfolioUUID, limit: 999 })
    if (transactionsRequest.code !== 200 || !('data' in transactionsRequest) || !transactionsRequest.data)
      return

    transactions.value = transactionsRequest.data
      .toSorted((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  async function refreshTournaments() {
    const tournamentsRequest = await fintasy.getTournaments({ limit: 999 })
    if (tournamentsRequest.code !== 200 || !('data' in tournamentsRequest) || !tournamentsRequest.data)
      return

    tournaments.value = tournamentsRequest.data
      .toSorted((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  async function refreshAll() {
    if (!user.value.uuid)
      return

    await refreshUser()
    await refreshPortfolios()
    await refreshTransactions()
    await refreshTournaments()
  }

  watch(() => user.value.uuid, (uuid) => {
    if (uuid)
      refreshAll()
  })
  watch(() => portfolio.value.active, refreshTransactions)
  watch(fintasy.authenticated, (isAuth) => {
    if (!isAuth)
      clearUserState()
  })

  return {
    user,
    portfolio,
    transactions,
    tournaments,
    isAuthenticated,
    isGuest,
    loginAsGuest,
    logout,
    clearUserState,
    refresh: {
      all: refreshAll,
      user: refreshUser,
      portfolios: refreshPortfolios,
      transactions: refreshTransactions,
      tournaments: refreshTournaments,
    },
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useStateStore as any, import.meta.hot))
