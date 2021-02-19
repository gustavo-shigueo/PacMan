const swiper = new Swipe(document)

swiper.onUp(function () {
	pacman.changeDirection('ArrowUp')
})

swiper.onLeft(function () {
	pacman.changeDirection('ArrowLeft')
})

swiper.onDown(function () {
	pacman.changeDirection('ArrowDown')
})

swiper.onRight(function () {
	pacman.changeDirection('ArrowRight')
})

swiper.run()
