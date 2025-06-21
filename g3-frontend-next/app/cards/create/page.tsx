"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { createCardStart, createCardSuccess, createCardFailure, createCard } from "@/lib/cardsSlice"
import { createGame, fetchGames} from "@/lib/gameSlice"
import { CreateGameDTO } from "@/types/game"
import type { CreateCardBaseDTO, CreateCardDTO, CardResponseDTO } from "@/types/card"
import { Plus, X } from "lucide-react"
import { createCardBase, fetchCardBases } from "@/lib/cardBaseSlice"
import _ from "lodash"


export default function CreateCardPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isLoading, error } = useAppSelector((state) => state.cards)
  const { currentUser } = useAppSelector((state) => state.user)

  // State for games
  const {games} = useAppSelector((state) => state.game)
  const [gameSelectionMode, setGameSelectionMode] = useState<"existing" | "new">("existing")
  const [selectedGameId, setSelectedGameId] = useState<string>("")
  const [newGameName, setNewGameName] = useState<string>("")

  // State for card bases
  const {cardBases} = useAppSelector((state) => state.baseCards)
  const [filteredCardBases, setFilteredCardBases] = useState(cardBases)
  const [cardBaseSelectionMode, setCardBaseSelectionMode] = useState<"existing" | "new">("existing")
  const [selectedCardBaseId, setSelectedCardBaseId] = useState<string>("")
  const [newCardBaseName, setNewCardBaseName] = useState<string>("")

  // Form state for card details
  const [statusCard, setStatusCard] = useState<number>(5)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null) 
  const [imageError, setImageError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState("")
  const [formErrors, setFormErrors] = useState<{
    cardBase?: string
    statusCard?: string
    image?: string
    game?: string
  }>({})

  useEffect(() => {
    if (!currentUser) {
      router.push("/login")
      return
    }

    if(games.length === 0) {
      dispatch(fetchGames())
      dispatch(fetchCardBases())
    }
  }, [currentUser, router])

  const handleGameSelection = (gameId: string) => {
    setSelectedGameId(gameId)
    setGameSelectionMode("existing")
    setFilteredCardBases(_.filter(cardBases, (cb) => cb.game.id === gameId));
  }
  
  const handleCreateGame = async () => {
    if (!newGameName.trim()) {
      setFormErrors((prev) => ({ ...prev, game: "Game name is required" }))
      return
    }
  
    try {
      const newGameData: CreateGameDTO = {
        name: newGameName,
      }
  
      const newGame = await dispatch(createGame(newGameData))
  
      setSelectedGameId(newGame.id)
      setNewGameName("")
      setGameSelectionMode("existing")
      setFormErrors((prev) => ({ ...prev, game: undefined }))

      if (selectedGameId) {
        setFilteredCardBases(_.filter(cardBases, (cb) => cb.game.id === selectedGameId))
      } else {
        setFilteredCardBases([])
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create game. Please try again.")
      dispatch(createCardFailure("Failed to create game. Please try again."))
    }
  }


  const handleCreateCardBase = async () => {
    if (!selectedGameId) {
      setFormErrors((prev) => ({ ...prev, cardBase: "Please select or create a game first" }))
      return
    }
  
    if (!newCardBaseName.trim()) {
      setFormErrors((prev) => ({ ...prev, cardBase: "Card name is required" }))
      return
    }
  
    try {
      const cardBaseData: CreateCardBaseDTO = {
        gameId: selectedGameId,
        nameCard: newCardBaseName,
      }
  
      const newCardBase = await dispatch(createCardBase(cardBaseData))
  
      setSelectedCardBaseId(newCardBase.id)
      setNewCardBaseName(newCardBase.nameCard)
      setFilteredCardBases([...filteredCardBases, newCardBase])
      setFormErrors((prev) => ({ ...prev, cardBase: undefined }))
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create card base. Please try again.")
      dispatch(createCardFailure("Failed to create card base. Please try again."))
    }
  }

  const validateForm = () => {
    const errors: {
      cardBase?: string
      statusCard?: string
      image?: string
      game?: string
    } = {}

    // Check if we have a card base selected or created
    if (cardBaseSelectionMode === "existing" && !selectedCardBaseId) {
      errors.cardBase = "Please select a card"
    }

    if (cardBaseSelectionMode === "new" && !newCardBaseName) {
      errors.cardBase = "Please enter a card name"
    }

    if (!statusCard || statusCard < 1 || statusCard > 10) {
      errors.statusCard = "Status must be between 1 and 10"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"]
      if (!allowedTypes.includes(file.type)) {
        setImageError("The image should have the following type: jpg, jpeg, png")
        setSelectedFile(null)
        setImagePreviewUrl(null)
      } else {
        setImageError(null)
        setSelectedFile(file)
        setImagePreviewUrl(URL.createObjectURL(file)) // Create a URL for preview
      }
    } else {
      setImageError(null)
      setSelectedFile(null)
      setImagePreviewUrl(null)
    }
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    setImagePreviewUrl(null)
    setImageError(null)
    const fileInput = document.getElementById("cardImage") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError("")

    try {
      if (!currentUser) {
        dispatch(createCardFailure("You must be logged in to create a card"))
        return
      }

      // Additional validation checks before form submission
      if (!selectedGameId) {
        setSubmitError("Please select or create a game first")
        return
      }

      if (!selectedCardBaseId) {
        setSubmitError("Please select or create a card first")
        return
      }

      if (!selectedFile) {
        setSubmitError("Please upload an image for your card")
        return
      }

      if (!validateForm()) {
        return
      }

      dispatch(createCardStart())

      const cardData: CreateCardDTO = {
        cardBaseId: selectedCardBaseId,
        statusCard: statusCard,
        image: selectedFile!,
        ownerId: currentUser.id
      }

      dispatch(createCard(cardData))
      router.push("/cards")
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create card. Please try again.")
      dispatch(createCardFailure("Failed to create card. Please try again."))
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Add a New Card</CardTitle>
          <CardDescription>Add a new Pokemon card to your collection</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Step 1: Select or Create a Game</h3>

              <Tabs
                value={gameSelectionMode}
                onValueChange={(value) => setGameSelectionMode(value as "existing" | "new")}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="existing">Select Existing Game</TabsTrigger>
                  <TabsTrigger value="new">Create New Game</TabsTrigger>
                </TabsList>

                <TabsContent value="existing" className="space-y-4">
                  <Select value={selectedGameId} onValueChange={(gameId) => handleGameSelection(gameId)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a game" />
                    </SelectTrigger>
                    <SelectContent>
                      {_.map(games, (game) => (
                        <SelectItem key={game.id} value={game.id}>
                          {game.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TabsContent>

                <TabsContent value="new" className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newGameName}
                      onChange={(e) => setNewGameName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter new game name"
                    />
                    <Button
                      type="button"
                      onClick={handleCreateGame}
                      disabled={isLoading || !newGameName.trim()}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create
                    </Button>
                  </div>
                  {formErrors.game && <p className="text-sm text-red-500">{formErrors.game}</p>}
                </TabsContent>
              </Tabs>
            </div>

            {selectedGameId && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Step 2: Select or Create a Card</h3>

                <Tabs
                  value={cardBaseSelectionMode}
                  onValueChange={(value) => setCardBaseSelectionMode(value as "existing" | "new")}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="existing">Select Existing Card</TabsTrigger>
                    <TabsTrigger value="new">Create New Card</TabsTrigger>
                  </TabsList>

                  <TabsContent value="existing" className="space-y-4">
                    <Select value={selectedCardBaseId} onValueChange={setSelectedCardBaseId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a card" />
                      </SelectTrigger>
                      <SelectContent>
                        { !_.isEmpty(filteredCardBases) ? (
                          filteredCardBases.map((cardBase) => (
                            <SelectItem key={cardBase.id} value={cardBase.id}>
                              {cardBase.nameCard}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-cards" disabled>
                            No cards available for this game
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </TabsContent>

                  <TabsContent value="new" className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newCardBaseName}
                        onChange={(e) => setNewCardBaseName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter new card name"
                      />
                      <Button
                        type="button"
                        onClick={handleCreateCardBase}
                        disabled={isLoading || !newCardBaseName.trim()}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
                {formErrors.cardBase && <p className="text-sm text-red-500">{formErrors.cardBase}</p>}
              </div>
            )}

            {selectedCardBaseId && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Step 3: Card Details</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="statusCard" className="text-sm font-medium">
                      Card Condition (1-10)
                    </label>
                    <Input
                      id="statusCard"
                      type="number"
                      min={1}
                      max={10}
                      value={statusCard}
                      onChange={(e) => setStatusCard(Number.parseInt(e.target.value))}
                      onKeyDown={handleKeyDown}
                    />
                    <p className="text-xs text-muted-foreground">
                      Rate the condition of your card from 1 (poor) to 10 (mint)
                    </p>
                    {formErrors.statusCard && <p className="text-sm text-red-500">{formErrors.statusCard}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="cardImage" className="text-sm font-medium">
                      Card Image
                    </label>
                    <div className="flex items-center space-x-2">
                      <label
                        htmlFor="cardImage"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer"
                      >
                        Choose File
                      </label>
                      <Input
                        id="cardImage"
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                      <span className="text-sm text-muted-foreground">
                        {selectedFile ? selectedFile.name : "No file chosen"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Upload an image of your card</p>
                    {imageError && <p className="text-sm text-red-500">{imageError}</p>} {/* Display image error */}
                    {imagePreviewUrl && (
                      <div className="relative mt-4 w-fit">
                        <img
                          src={imagePreviewUrl || "/placeholder.svg"}
                          alt="Card Preview"
                          className="max-w-[150px] h-auto rounded-md border"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background/80 hover:bg-background"
                          onClick={handleRemoveImage}
                          aria-label="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                    disabled={isLoading || !!imageError }
                  >
                    {isLoading ? "Creating card..." : "Add Card"}
                  </Button>
                  
                  {submitError && <p className="text-sm text-red-500 mt-2">{submitError}</p>}
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
