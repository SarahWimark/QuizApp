import { Quiz } from './quiz.js'
import { HighScore } from './highscore.js'
const quiz = new Quiz()
const highScore = new HighScore()

document.getElementById('questionBtn').addEventListener('click', quiz.getQuestion.bind(quiz))
document.getElementById('answerForm').addEventListener('submit', quiz.getNextUrl.bind(quiz))
highScore.getHighscores()
