function preload() {
	img = loadImage('./assets/map.jpg')
	sprites = loadImage('./assets/ghosts.png')
	frightenedSprite = loadImage('./assets/frightened-ghost.png')
	eatenSprite = loadImage('./assets/eaten.png')
	pacmanSprite = loadImage('./assets/pacman-sprite.png')
	font = loadFont('./assets/PressStart2P-Regular.ttf')
	icon = loadImage('./assets/icon.png')
}

function setup() {
	rectMode(CENTER)
	createCanvas(1020, 1210)
	background(0)
	image(img, 20, 60, 980, 1085)
	frameRate(30)
	framecounter = 0
	frightenTimer = 300
	blinkTimer = 5

	pacman = new Pacman()
	blinky = new Blinky()
	pinky = new Pinky()
	clyde = new Clyde()
	inky = new Inky()

	ghosts = [blinky, pinky, inky, clyde]

	ghosts.forEach(ghost => ghost.setMode('scatter'))
	mode = 'scatter'
}

buildBoard()

function buildBoard() {
	for (const row in board) {
		board[row].forEach((cell, column) => {
			const tile = new Tile(row, column)
			switch (cell) {
				case 0:
					tile.isWall = true
					break
				case 1:
					tile.isDot = true
					break
				case 2:
					tile.isBigDot = true
					break
				case 3:
					tile.isEmpty = true
					break
				case 4:
					tile.isForGhosts = true
					break
			}
			tiles.push(tile)
		})
	}
}

function draw() {
	background(0)
	image(img, 20, 60, 980, 1085)

	push()
	textSize(32)
	fill(255)
	textFont(font)
	textAlign(LEFT)
	text(`Score: ${score}`, 20, 45)
	textAlign(RIGHT)
	text(`Highscore: ${highscore}`, 1000, 45)
	pop()

	for (let i = 0; i < lives; i++) {
		push()
		translate(i * 20, 0)
		image(icon, (i + 1) * 20, 1160, 35, 35)
		pop()
	}

	if (framecounter < 2520) framecounter++
	tiles.forEach(tile => tile.show())
	pacman.update()
	pacman.show()

	if ([210, 1020, 1770, 2520].includes(framecounter)) {
		ghosts.forEach(ghost => {
			if (ghost.isScattering) ghost.setMode('chase')
			mode = 'chase'
		})
	}

	if ([810, 1620, 2370].includes(framecounter)) {
		ghosts.forEach(ghost => {
			if (ghost.isChasing) ghost.setMode('scatter')
			mode = 'scatter'
		})
	}

	if (ghosts.some(ghost => ghost.isFrightened)) {
		frightenTimer--
		if (frightenTimer <= 90) {
			blinkTimer--
			if (blinkTimer === 0) {
				blinkTimer = 5
				ghosts
					.filter(ghost => ghost.isFrightened)
					.forEach(ghost => {
						ghost.isEaten = !ghost.isEaten
					})
			}
		}
	} else frightenTimer = 300

	if (frightenTimer === 0) {
		ghosts.forEach(ghost => {
			if (ghost.isFrightened) ghost.setMode(mode)
		})
		frightenTimer = 300
	}

	blinky.setTarget()
	blinky.update()

	pinky.setTarget()
	pinky.update()

	if (dots >= 30) {
		inky.setTarget()
		inky.update()
	}

	if (dots >= 90) {
		clyde.setTarget()
		clyde.update()
	}

	ghosts.forEach(ghost => {
		ghost.show()
	})

	if (pacman.dead()) lives > 0 ? resetPositions() : gameOver(0)

	if (!stopped && tiles.every(tile => !tile.isBigDot && !tile.isDot)) {
		gameOver(1)
		stopped = true
	}
}

function keyPressed() {
	pacman.changeDirection(key)
}

function resetPositions() {
	noLoop()
	lives--
	setup()
	draw()
	setTimeout(() => {
		loop()
	}, 5000)
}

function gameOver(val) {
	stopped = true
	noLoop()
	title.innerText = val === 1 ? 'You win!' : 'Game Over!'
	highscore = Math.max(score, highscore)
	gameoverScreen.classList.add('active')
	showScore.innerText = `Score: ${score}`
	showHighscore.innerText = `Highscore: ${highscore ?? 0}`
	draw()
}

function restart(e) {
	score = 0
	lives = 3
	tiles = []
	gameoverScreen.classList.remove('active')
	setup()
	dots = 0
	buildBoard()
	loop()
	stopped = false
}

setInterval(() => {
	if (pacman) pacman.state += pacman.state !== 2 ? 1 : -2
}, 100)

function touchStarted() {
	touchCoords = []
	if (TouchList.length !== 1) return
	const [x, y] = [TouchList.item(0).screenX, TouchList.item(0).screenY]
	touchCoords.push([x, y])
}

function touchMoved() {
	if (TouchList.length !== 1) return
	const [x, y] = [TouchList.item(0).screenX, TouchList.item(0).screenY]
	touchCoords[1] = [x, y]
}

function touchEnded() {
	const deltaX = touchCoords[1][0] - touchCoords[0][0]
	const deltaY = touchCoords[1][1] - touchCoords[0][1]

	if (Math.abs(deltaX) === Math.abs(deltaY)) return

	if (Math.abs(deltaX) > Math.abs(deltaY)) {
		pacman.changeDirection(deltaX > 0 ? 'ArrowRight' : 'ArrowLeft')
	} else {
		pacman.changeDirection(deltaY > 0 ? 'ArrowDown' : 'ArrowUp')
	}
}
