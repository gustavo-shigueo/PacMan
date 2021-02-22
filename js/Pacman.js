class Pacman {
	constructor() {
		this.x = gridSize * 13.5 + 37.5
		this.y = gridSize * 17 + 77.5
		this.velocity = [-1, 0]
		this.turnTo = [1, 0]

		this.state = 1
		this.stateArr = ['full', 'semi', 'open']

		this.controls = {
			ArrowUp: [0, -1],
			ArrowDown: [0, 1],
			ArrowLeft: [-1, 0],
			ArrowRight: [1, 0],
		}

		this.spritePositions = {
			full: [35, 35, 464, 0, 195, 195],
			semi: [35, 35, 240, 0, 195, 195],
			open: [35, 35, 0, 0, 195, 195],
		}
	}

	show() {
		const state = this.stateArr[this.state]
		let rotation
		if (this.velocity[0] === 0) {
			rotation = this.velocity[1] === 1 ? 90 : -90
		} else {
			rotation = this.velocity[0] === 1 ? 0 : 180
		}
		push()
		translate(this.x, this.y)
		angleMode(DEGREES)
		rotate(rotation)
		imageMode(CENTER)
		image(pacmanSprite, 0, 0, ...this.spritePositions[state])
		pop()
	}

	checkPosition() {
		const [x, y] = [
			this.x + PACMAN_SPEED * this.velocity[0],
			this.y + PACMAN_SPEED * this.velocity[1],
		]

		const centerX = (this.x - 37.5) % gridSize === 0
		const centerY = (this.y - 77.5) % gridSize === 0
		const intoWall = tiles.some(tile => {
			const { isWall, isForGhosts } = tile
			const isClose = dist(x, y, tile.x, tile.y) < gridSize
			return (isWall || isForGhosts) && isClose
		})

		if (centerX && centerY && intoWall) return
		return true
	}

	changeDirection(key) {
		if (!this.controls[key]) return
		this.turnTo = this.controls[key]
		this.setVelocity()
	}

	setVelocity() {
		if (Math.abs(this.velocity[0]) !== Math.abs(this.turnTo[0])) {
			const centerX = (this.x - 37.5) % gridSize === 0
			const centerY = (this.y - 77.5) % gridSize === 0
			if (centerX && centerY) {
				const [futureCell] = tiles.filter(tile => {
					const checkX = tile.x === this.x + this.turnTo[0] * gridSize
					const checkY = tile.y === this.y + this.turnTo[1] * gridSize
					return checkX && checkY
				})

				let freeCell = false
				if (futureCell)
					freeCell = !(futureCell.isWall || futureCell.isForGhosts)
				this.velocity = freeCell ? this.turnTo : this.velocity
			}
		} else this.velocity = this.turnTo
	}

	update() {
		if (!this.checkPosition()) return
		this.x += PACMAN_SPEED * this.velocity[0]
		this.y += PACMAN_SPEED * this.velocity[1]
		this.updateCell()
		if (this.x < -gridSize / 2) this.x = 28.5 * gridSize + 37.5
		if (this.x > 28.5 * gridSize + 37.5) this.x = -gridSize + 37.5

		const [ghost] = ghosts.filter(
			ghost =>
				ghost.isFrightened && dist(this.x, this.y, ghost.x, ghost.y) < gridSize
		)
		if (ghost) {
			ghost.x = floor((this.x - 37.5) / gridSize) * gridSize + 37.5
			ghost.y = floor((this.y - 77.5) / gridSize) * gridSize + 77.5
			ghost.setMode('eaten')
			score += 200 * 2 ** scoreMultiplierExponent
			scoreMultiplierExponent++
		}
		this.setVelocity()
	}

	updateCell() {
		const centerX = (this.x - 37.5) % gridSize === 0
		const centerY = (this.y - 77.5) % gridSize === 0

		if (centerX && centerY) {
			const [cell] = tiles.filter(
				tile => tile.x === this.x && tile.y === this.y
			)
			if (cell && (cell.isDot || cell.isBigDot)) {
				dots++
				if (cell.isBigDot) {
					frightenTimer = 300
					ghosts
						.filter(ghost => !(ghost.isEaten && !ghost.isFrightened))
						.forEach(ghost => ghost.setMode('frightened'))
					score += 50
				} else score += 10
				cell.isDot = false
				cell.isBigDot = false
				cell.isEmpty = true
			}
		}
	}

	dead() {
		const check = ghosts.some(
			ghost =>
				dist(this.x, this.y, ghost.x, ghost.y) <= gridSize &&
				!ghost.isFrightened &&
				!ghost.isEaten
		)
		return check
	}
}
