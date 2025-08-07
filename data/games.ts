import SnakeGameMobile from "@/components/snake-game-mobile"
import MahjongGameMobile from "@/components/mahjong-game-mobile"
import SpaceShooterMobile from "@/components/space-shooter-mobile"
import FruitCrushGame from "@/components/fruit-crush-game"
import FlappyBirdGame from "@/components/flappy-bird-game" // Import FlappyBirdGame

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
    image: "/images/spaceshooter-logo.jpg",
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
    image: "/images/mahjonggame-logo.jpg",
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
    component: FruitCrushGame,
  },
  {
    id: "flappy-bird",
    title: "Flappy Bird",
    description: "Guide the bird through pipes! Tap to flap and avoid obstacles.",
    image: "/images/flappybird-logo.png",
    category: "skill", // Or a new category like "arcade"
    playable: true,
    component: FlappyBirdGame, // Added component property
  },
]
