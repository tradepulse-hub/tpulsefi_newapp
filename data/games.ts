import SnakeGameMobile from "@/components/snake-game-mobile"
import MahjongGameMobile from "@/components/mahjong-game-mobile"
import SpaceShooterMobile from "@/components/space-shooter-mobile"
// FruitCrushGame is now a page, so no need to import it as a component here

export interface Game {
  id: string
  title: string
  description: string
  image: string
  category: string // Corresponds to category.id
  playable: boolean
  component?: React.ComponentType<{ onClose: () => void }> // Optional component for modal games
}

export const allGames: Game[] = [
  {
    id: "space-shooter",
    title: "Super Space Shooter",
    description: "Epic space battles await! Pilot your ship through asteroid fields and defeat alien invaders.",
    image: "/images/spaceshooter-logo.png", // <--- Caminho da imagem atualizado para .jpg
    category: "action",
    playable: true,
    component: SpaceShooterMobile,
  },
  {
    id: "snake-game",
    title: "Snake Game",
    description: "Test your limits! Grow your snake by eating food, but don't hit the walls or yourself.",
    image: "/images/snakegame-logo.jpg",
    category: "skill",
    playable: true,
    component: SnakeGameMobile,
  },
  {
    id: "mahjong-solitaire",
    title: "Mahjong Solitaire",
    description: "Classic tile matching puzzle! Find matching pairs to clear the board.",
    image: "/images/mahjonggame-logo.png",
    category: "mahjong",
    playable: true,
    component: MahjongGameMobile,
  },
  {
    id: "fruit-crush",
    title: "Fruit Crush",
    description: "Match colorful fruits and clear the board in this juicy puzzle game!",
    image: "/images/fruitcrush-logo.png",
    category: "match3",
    playable: true,
    // No component property here, as it's a dedicated page
  },
]
