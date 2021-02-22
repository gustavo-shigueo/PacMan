class Ghosts {
	constructor() {
		this.isScattering = false
		this.isFrightened = false
		this.isChasing = true
		this.isEaten = false
		this.y = gridSize * 14 + 77.5
		this.target = [pacman.x, pacman.y]
		this.velocity = [0, -1]
		this.sprites = {
			blinky: {
				up: [35, 35, 190, 0, 160, 160],
				right: [35, 35, 0, 0, 160, 160],
				down: [35, 35, 0, 190, 160, 160],
				left: [35, 35, 190, 190, 160, 160],
			},
			inky: {
				up: [35, 35, 590, 0, 160, 160],
				right: [35, 35, 400, 0, 160, 160],
				down: [35, 35, 400, 190, 160, 160],
				left: [35, 35, 590, 190, 160, 160],
			},
			pinky: {
				up: [35, 35, 190, 380, 160, 160],
				right: [35, 35, 0, 380, 160, 160],
				down: [35, 35, 0, 570, 160, 160],
				left: [35, 35, 190, 570, 160, 160],
			},
			clyde: {
				up: [35, 35, 590, 380, 160, 160],
				right: [35, 35, 400, 380, 160, 160],
				down: [35, 35, 400, 570, 160, 160],
				left: [35, 35, 590, 570, 160, 160],
			},
		}
	}

	show() {
		push()
		let dir = ''
		if (this.velocity[1] === 0) {
			dir = this.velocity[0] === 1 ? 'right' : 'left'
		} else {
			dir = this.velocity[1] === 1 ? 'down' : 'up'
		}
		const imgX = this.x - gridSize / 2
		const imgY = this.y - gridSize / 2
		if (!this.isFrightened && !this.isEaten) {
			image(sprites, imgX, imgY, ...this.sprites[this.name][dir])
		} else if (this.isEaten) {
			image(eatenSprite, imgX, imgY, 35, 35)
		} else {
			image(frightenedSprite, imgX, imgY, 35, 35)
		}
		pop()
	}

	checkPosition(velocity = this.velocity) {
		const [x, y, lastX, lastY] = [
			this.x + GHOSTS_SPEED * velocity[0],
			this.y + GHOSTS_SPEED * velocity[1],
			this.lastPos[0],
			this.lastPos[1],
		]

		if (x === lastX && y === lastY) return

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

	setVelocity() {
		if (
			this.x > gridSize * 14 + 37.5 &&
			this.x < gridSize * 16 + 37.5 &&
			this.y === gridSize * 14 + 77.5
		)
			return (this.velocity = [-1, 0])

		if (
			this.x > gridSize * 11 + 37.5 &&
			this.x < gridSize * 13 + 37.5 &&
			this.y === gridSize * 14 + 77.5
		)
			return (this.velocity = [1, 0])

		if (
			this.x > gridSize * 13 + 37.5 &&
			this.x < gridSize * 14 + 37.5 &&
			this.y === gridSize * 13 + 77.5
		)
			return (this.velocity = [1, 0])

		if (
			this.x > gridSize * 13 + 37.5 &&
			this.x < gridSize * 14 + 37.5 &&
			this.y === gridSize * 14 + 77.5
		)
			return (this.velocity = [-1, 0])

		const centerX = (this.x - 37.5) % gridSize === 0
		const centerY = (this.y - 77.5) % gridSize === 0
		let options = []

		if (!(centerX && centerY)) return

		const possibleVelocities = [
			[0, -1],
			[-1, 0],
			[0, 1],
			[1, 0],
		]

		possibleVelocities.forEach((vel, index) => {
			if (this.checkPosition(vel)) {
				options.push([this.findDistance(vel), index])
			}
		})

		const distances = options.map(opt => opt[0])
		const minDist = min(distances)
		const index = options.findIndex(opt => opt[0] === minDist)

		if (options[index]) this.velocity = possibleVelocities[options[index][1]]
		else this.velocity = [0, -1]
		if (this.isFrightened)
			this.target = [floor(random(27)) * gridSize, floor(random(30)) * gridSize]
	}

	findDistance(vel) {
		const [x, y] = [this.x + gridSize * vel[0], this.y + gridSize * vel[1]]
		const [tX, tY] = this.target
		return dist(x, y, tX, tY)
	}

	update() {
		if (
			this.isEaten &&
			!this.isFrightened &&
			dist(this.x, this.y, gridSize * 13 + 37.5, gridSize * 11 + 77.5) <
				gridSize
		)
			this.setMode(mode)
		this.setVelocity()

		this.lastPos = [this.x, this.y]
		if (this.x <= 2.5) {
			this.x = 27 * gridSize + 37.5
			this.velocity = [-1, 0]
		}
		if (this.x >= 1017.5) {
			this.x = 2.5
			this.velocity = [1, 0]
		}
		this.x += GHOSTS_SPEED * this.velocity[0]
		this.y += GHOSTS_SPEED * this.velocity[1]
	}

	setMode(mode) {
		this.lastPos = [0, 0]
		this.velocity = [-this.velocity[0], -this.velocity[1]]

		switch (mode) {
			case 'chase':
				this.isChasing = true
				this.isEaten = false
				this.isFrightened = false
				this.isScattering = false
				this.setTarget()
				break
			case 'scatter':
				this.isChasing = false
				this.isEaten = false
				this.isFrightened = false
				this.isScattering = true
				break
			case 'eaten':
				this.isChasing = false
				this.isEaten = true
				this.isFrightened = false
				this.isScattering = false
				break
			case 'frightened':
				this.isChasing = false
				this.isEaten = false
				this.isFrightened = true
				this.isScattering = false
				break
		}
	}

	isInGhostHouse() {
		return (
			this.x < 667.5 - gridSize &&
			this.x > 352.5 + gridSize &&
			this.y < 632.5 - gridSize &&
			this.y > 457.5 + gridSize
		)
	}

	cellsAheadOfPacMan(cells = 0) {
		const {
			x,
			y,
			velocity: [vX, vY],
		} = pacman
		const pixels = cells * gridSize
		if (!cells) return [x, y]
		if (pacman.velocity[1] !== -1) return [x + pixels * vX, y + pixels * vY]
		return [x - pixels, y - pixels]
	}

	defaultTarget(offset = 0, corner = [0, 0]) {
		this.target = this.cellsAheadOfPacMan(offset)
		if (this.isInGhostHouse() || this.isEaten)
			this.target = [gridSize * 13 + 37.5, gridSize * 11 + 77.5]
		if (this.isScattering) this.target = corner
	}
}

class Blinky extends Ghosts {
	constructor() {
		super()
		this.x = gridSize * 13.5 + 37.5
		this.y = gridSize * 13 + 77.5
		this.lastPos = [this.x, this.y]
		this.name = 'blinky'
	}

	setTarget() {
		this.defaultTarget(0, [947.5, 72.5])
		this.setVelocity()
	}
}

class Pinky extends Ghosts {
	constructor() {
		super()
		this.x = gridSize * 13.5 + 37.5
		this.y = gridSize * 14 + 77.5
		this.lastPos = [this.x, this.y]
		this.name = 'pinky'
	}

	setTarget() {
		this.defaultTarget(4, [72.5, 72.5])
		this.setVelocity()
	}
}

class Clyde extends Ghosts {
	constructor() {
		super()
		this.x = gridSize * 11.5 + 37.5
		this.y = gridSize * 14 + 77.5
		this.lastPos = [this.x, this.y]
		this.name = 'clyde'
	}

	setTarget() {
		const pacDist = dist(this.x, this.y, pacman.x, pacman.y)
		this.defaultTarget(4, [72.5, 1122.5])
		if (!this.isEaten && !this.isInGhostHouse() && pacDist < 8 * gridSize)
			this.target = [72.5, 1122.5]
		this.setVelocity()
	}
}

class Inky extends Ghosts {
	constructor() {
		super()
		this.x = gridSize * 15.5 + 37.5
		this.y = gridSize * 14 + 77.5
		this.lastPos = [this.x + GHOSTS_SPEED, this.y]
		this.name = 'inky'
	}

	setTarget() {
		const interm = this.cellsAheadOfPacMan(2)
		const deltaX = blinky.x - interm[0]
		const deltaY = blinky.y - interm[1]
		this.target = [interm[0] - deltaX, interm[1] - deltaY]
		if (this.isInGhostHouse() || this.isEaten)
			this.target = [gridSize * 13 + 37.5, gridSize * 11 + 77.5]
		if (this.isScattering) this.target = [947.5, 1122.5]
		this.setVelocity()
	}
}
