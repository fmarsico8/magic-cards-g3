"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchUserCardsStart, fetchUserCardsSuccess, fetchUserCardsFailure } from "@/lib/cardsSlice"
import type { GameResponseDTO } from "@/types/game"
import { useState } from "react"

// Mock data
const mockGames: GameResponseDTO[] = [
  { id: "1", name: "Pokemon Red/Blue", createdAt: new Date(), updatedAt: new Date() },
  { id: "2", name: "Pokemon Gold/Silver", createdAt: new Date(), updatedAt: new Date() },
  { id: "3", name: "Pokemon Ruby/Sapphire", createdAt: new Date(), updatedAt: new Date() },
]

export default function MyCardsPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { userCards, isLoading } = useAppSelector((state) => state.cards)
  const { currentUser } = useAppSelector((state) => state.user)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGame, setSelectedGame] = useState<string>("")

  useEffect(() => {
    // Check if user is logged in
    if (!currentUser) {
      router.push("/login")
      return
    }

    dispatch(fetchUserCardsStart())

    // Simulate API call to fetch user's cards
    setTimeout(() => {
      try {
        // Filter cards to only include those owned by the current user
        const filteredCards =
          userCards.length > 0 ? userCards : mockCards.filter((card) => card.owner.ownerId === currentUser.id)

        dispatch(fetchUserCardsSuccess(filteredCards))
      } catch (error) {
        dispatch(fetchUserCardsFailure("Failed to load your cards"))
      }
    }, 500)
  }, [dispatch, currentUser, router])

  const filteredCards = userCards.filter((card) => {
    let matchesSearch = true
    let matchesGame = true

    if (searchTerm) {
      matchesSearch = card.cardBase.Name.toLowerCase().includes(searchTerm.toLowerCase())
    }

    if (selectedGame && selectedGame !== "all") {
      matchesGame = card.game.Id === selectedGame
    }

    return matchesSearch && matchesGame
  })

  // Mock cards data - in a real app, this would come from the API
  const mockCards = [
    {
      id: "1",
      urlImage: "https://assets.pokemon.com/assets/cms2/img/cards/web/SV01/SV01_EN_63.png",
      cardBase: {
        Id: "cb1",
        Name: "Pikachu",
      },
      game: {
        Id: "1",
        Name: "Pokemon Red/Blue",
      },
      owner: {
        ownerId: "user-123", // This matches the test user ID
        ownerName: "Test User",
      },
      createdAt: new Date(),
    },
    {
      id: "3",
      urlImage: "https://assets.pokemon.com/assets/cms2/img/cards/web/SV02/SV02_EN_1.png",
      cardBase: {
        Id: "cb3",
        Name: "Bulbasaur",
      },
      game: {
        Id: "1",
        Name: "Pokemon Red/Blue",
      },
      owner: {
        ownerId: "user-123", // This matches the test user ID
        ownerName: "Test User",
      },
      createdAt: new Date(),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">My Cards</h1>
        <Button onClick={() => router.push("/cards/create")} className="bg-yellow-500 hover:bg-yellow-600 text-black">
          <Plus className="mr-2 h-4 w-4" />
          Add Card
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search my cards..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedGame} onValueChange={setSelectedGame}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Games" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Games</SelectItem>
            {mockGames.map((game) => (
              <SelectItem key={game.id} value={game.id}>
                {game.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading your cards...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCards.map((card) => (
              <Card key={card.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[2/3] relative">
                  <img
                    src={card.urlImage || "/placeholder.svg"}
                    alt={card.cardBase.Name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">{card.cardBase.Name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 pb-2">
                  <p className="text-sm text-muted-foreground">{card.game.Name}</p>
                </CardContent>
                <CardFooter className="p-4 pt-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/cards/${card.id}`)}
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
                    onClick={() => router.push(`/publications/create?cardId=${card.id}`)}
                  >
                    Publish
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredCards.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">You don't have any cards yet.</p>
              <Button
                onClick={() => router.push("/cards/create")}
                className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                Add Your First Card
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
