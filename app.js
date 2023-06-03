const squares = document.querySelectorAll('.square')
const mole = document.querySelector('.mole')
const timeLeft = document.querySelector('#time-left')
const score = document.querySelector('#score')
const final = document.querySelector('#final-score')

let result = 0
let hit = 0
let currentTime = 30
let timer = null

randomSquare = () => {
    squares.forEach(square => {
        square.classList.remove('mole')
    })

    let randomSquare = squares[Math.floor(Math.random() * 9)]
    randomSquare.classList.add('mole')
    hit = randomSquare.id
}
squares.forEach(square => {
    square.addEventListener('mousedown', () => {
        if(square.id == hit){
            result++
            score.textContent = result
            hit = null
        }
    })
})
moveMole = () => {
    if(currentTime >= 20)
        timer = setInterval(randomSquare, 500)
    else if(currentTime<20)
        timer = setInterval(randomSquare, 100)
}
moveMole()

countDown = () => {
    currentTime--
    timeLeft.textContent = currentTime
    if(currentTime == 0) {
        clearInterval(countDownTimer)
        clearInterval(timer)
        final.innerHTML = `Your final score is : ${score.textContent}`
        document.querySelector('.stats').style.display = 'none'
    }
}
countDownTimer = setInterval(countDown, 1000)
