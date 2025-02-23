import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { isDesktopMode } from "@/lib/env"
import { useActivation } from "@/hooks/use-activation"
import { useGoto } from "@/hooks/use-goto"
import { useSpace } from "@/hooks/use-space"
import { DatabaseSelect } from "@/components/database-select"

import { useLastOpened } from "./[database]/hook"

export const LandingPage = () => {
  const { spaceList } = useSpace()
  const { lastOpenedDatabase } = useLastOpened()
  const goto = useGoto()
  const navigate = useNavigate()
  const { isActivated } = useActivation()

  useEffect(() => {
    if (isDesktopMode && !isActivated) {
      navigate("/my-licenses")
    } else if (isActivated && lastOpenedDatabase) {
      goto(lastOpenedDatabase)
    }
  }, [lastOpenedDatabase, goto, isActivated])

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="w-[200px]">
        <DatabaseSelect databases={spaceList} />
      </div>
    </div>
  )
}
