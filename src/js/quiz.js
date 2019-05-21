import { HighScore } from './highscore.js'
const highScore = new HighScore()

/**
 * Module for a Quiz
 *
 * @export
 * @class Quiz
 */
export class Quiz {
  constructor () {
    this._currentNbrOfQuestions = 1
    this._input = document.getElementById('answerTxt')
    this._output = document.getElementById('question')
    this._alternatives = document.querySelector('.buttons')
    this._questionBtn = document.getElementById('questionBtn')
    this._submitBtn = document.getElementById('submitBtn')
    this._progress = document.getElementById('progress')
    this._url = 'http://vhost3.lnu.se:20080/question/1'
    this._nextUrl = 'http://vhost3.lnu.se:20080/answer/1'
    this._name = document.getElementById('nameTxt')
    this.interval = undefined
    this.intervalTime = 20
    this.totalTime = 0
    this._progress.innerHTML = '20'
  }

  /**
   * Restart the quiz and reset stats
   *
   * @memberof Quiz
   */
  startOver () {
    this._questionBtn.disabled = false
    this._currentNbrOfQuestions = 1
    this.totalTime = 0
    this._name.value = ''
    this._name.disabled = false
    this._output.innerHTML = ''
    this._input.value = ''
    this._input.disabled = true
    this._url = 'http://vhost3.lnu.se:20080/question/1'
    this._questionBtn.innerHTML = 'Start Quiz'
    this._progress.innerHTML = '20'
    this._submitBtn.disabled = false
    this.removeAlternatives()
  }

  /**
   * Remove the alternatives that got generated for the previous question
   *
   * @memberof Quiz
   */
  removeAlternatives () {
    let nbrofButtons = this._alternatives.childNodes.length
    if (nbrofButtons > 0) {
      while (this._alternatives.firstChild) {
        this._alternatives.removeChild(this._alternatives.firstChild)
      }
    }
    this._input.classList.remove('hide')
    this._submitBtn.classList.remove('hide')
  }

  /**
   * Add a listener to every alternative button to be able to get what alternative the user clicked
   *
   * @param {*} that
   * @memberof Quiz
   */
  addListener (that) {
    this._alternatives.addEventListener('click', function (event) {
      event.target.classList.add('active')
      let id = event.target.id
      that.getAlternative(id)
      that.getNextUrl(event)
    })
  }

  /**
   * Add the buttons for if a question have different alternatives
   *
   * @param {*} alternatives - the different alternatives for an answer
   * @param {*} question - the question the alternatives belongs to
   * @memberof Quiz
   */
  createAlternatives (alternatives, question) {
    this._output.innerHTML = question
    this._input.classList.add('hide')
    this._submitBtn.classList.add('hide')
    let answers = Object.values(alternatives)

    for (let i = 0; i < answers.length; i++) {
      let button = document.createElement('button')
      button.id = `alt${i + 1}`
      button.className = 'altBtn'
      button.innerHTML = `${answers[i]}`
      this._alternatives.appendChild(button)
    }
    this.addListener(this)
  }

  /**
   *Set the value of the answer input to the chosen alternative
   *
   * @param {*} id
   * @memberof Quiz
   */
  getAlternative (id) {
    this._input.value = id
  }

  /**
   * Start a timer for the question
   *
   * @param {*} startTime
   * @memberof Quiz
   */
  getTimer (startTime) {
    let self = this
    this.interval = setInterval(function () {
      startTimer()
    }, 1000)

    function startTimer () {
      startTime--
      if (startTime < 0) {
        self._input.innerHTML = ''
        document.getElementById('noAnswer').innerHTML = 'Out of time'
        setTimeout(() => {
          document.getElementById('noAnswer').innerHTML = ''
        }, 3000)
        self.gameOver(3000)
        self.stopTimer(self.interval)
      } else {
        self._progress.innerHTML = `${startTime}`
      }
    }
  }

  /**
   *Count the players total quiztime
   *
   * @param {*} time - the time it took to answer a question
   * @memberof Quiz
   */
  countTotalTime (time) {
    this.totalTime += (this.intervalTime - time)
  }

  /**
   * Stop the timer
   *
   * @param {*} interval - interval to stop
   * @memberof Quiz
   */
  stopTimer (interval) {
    clearInterval(interval)
  }

  /**
   * Disable buttons so the user can´t use them when game over or the quiz is over and then reset the game
   *
   * @memberof Quiz
   */
  gameOver (time) {
    this._submitBtn.disabled = true
    this._questionBtn.disabled = true
    setTimeout(this.startOver.bind(this), time)
  }

  /**
   * Check the answer the user gives, if it´s correct the user can get the next question, if wrong answer quiz is reset, if correct answer
   * and no more questions the players result is presented and quiz is reset
   *
   * @param {*} nextURL - url of next question
   * @param {*} message - message telling if it´s the correct or wrong answer
   * @memberof Quiz
   */
  checkResult (nextURL, message) {
    if (nextURL === undefined && message === 'Correct answer!') {
      this._currentNbrOfQuestions++
      this._output.innerHTML = `No more questions! You finished ${this._currentNbrOfQuestions} questions in ${this.totalTime} seconds`
      highScore.saveScore(this.totalTime)
      highScore.clearScores()
      highScore.getHighscores()
      this.gameOver(5000)
    } else if (nextURL === undefined && message === 'Wrong answer! :(') {
      this._output.innerHTML = `${message} . Game over...`
      this.gameOver(5000)
    } else {
      this._output.innerHTML = message
      this._input.value = ''
      this._url = nextURL
      this._currentNbrOfQuestions++
    }
  }

  /**
   * Get the next question and start the timer
   *
   * @returns
   * @memberof Quiz
   */
  async getQuestion () {
    highScore.setName()
    this.getTimer(this.intervalTime)
    this._questionBtn.innerHTML = 'Get next question'
    this._questionBtn.disabled = true
    this._name.disabled = true
    this._input.disabled = false
    let nextQuestion = await window.fetch(`${this._url}`)
    nextQuestion = await nextQuestion.json()
    this._nextUrl = nextQuestion.nextURL
    if (nextQuestion.alternatives !== undefined) {
      this.createAlternatives(nextQuestion.alternatives, nextQuestion.question)
    } else {
      this._output.innerHTML = nextQuestion.question
    }
  }

  /**
   * Check the answer and get next url. If the answer is wrong or there are no more questions the quiz starts over
   *
   * @param {*} event
   * @memberof Quiz
   */
  async getNextUrl (event) {
    event.preventDefault()
    this.stopTimer(this.interval)
    this.countTotalTime(parseInt(this._progress.innerHTML))
    this.removeAlternatives()
    this._questionBtn.disabled = false
    let answer = this._input.value
    let data = await window.fetch(`${this._nextUrl}`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        answer: answer
      })
    })
    data = await data.json()
    this.checkResult(data.nextURL, data.message)
  }
}
