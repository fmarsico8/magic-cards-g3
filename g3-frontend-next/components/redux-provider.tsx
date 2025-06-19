"use client"

import { useEffect } from "react"
import { Provider } from "react-redux"
import { store } from "@/lib/store"
import { restoreSession } from "@/lib/userSlice"
import { fetchUserNotifications } from "@/lib/notificationSlice"
import _ from "lodash"

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const user = localStorage.getItem("user")
    const tokens = localStorage.getItem("tokens")

    if (user && tokens) {
      const parsedUser = JSON.parse(user)
      const parsedTokens = JSON.parse(tokens)

      // Restaurar en Redux
      store.dispatch(restoreSession(parsedUser))
      store.dispatch(fetchUserNotifications(parsedUser.id))
    }
  }, [])

  return <Provider store={store}>{children}</Provider>
}
