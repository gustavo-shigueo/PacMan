class Tile {
	constructor(row, column) {
		this.x = column * gridSize + 37.5
		this.y = row * gridSize + 77.5
		this.isWall = false
		this.isDot = false
		this.isBigDot = false
		this.isEmpty = false
		this.isForGhosts = false
	}

	show() {
		if (!this.isDot && !this.isBigDot) return
		push()
		fill('#FF7')
		const size = this.isDot ? 10 : 20
		circle(this.x, this.y, size)
		pop()
	}
}
