/**
 * Module for highscores
 *
 * @export
 * @class HighScore
 */
export class HighScore {
  constructor () {
    this._nameInput = document.getElementById('nameTxt')
    this._highscoreList = JSON.parse(window.localStorage.getItem('highscores')) || []
  }

  /**
   *Save the players score in localstorage. The 5 highest scores are saved
   *
   * @param {*} score
   * @memberof HighScore
   */
  saveScore (score) {
    if (this._nameInput.value !== '') {
      let playerName = this._nameInput.value
      let playerScore = score
      let gameResult = {
        name: playerName,
        score: playerScore
      }

      this._highscoreList.push(gameResult)
      this._highscoreList.sort((a, b) => (a.score - b.score))
      if (this._highscoreList.length > 5) {
        this._highscoreList = this._highscoreList.slice(0, 5)
      }
      window.localStorage.setItem('highscores', JSON.stringify(this._highscoreList))
    }
  }

  /**
   * Display the stored highscores
   *
   * @memberof HighScore
   */
  getHighscores () {
    let highscores
    let minutes
    let seconds
    const scoreBoard = document.getElementById('scores')
    if (window.localStorage.getItem('highscores') !== null) {
      highscores = JSON.parse(window.localStorage.getItem('highscores'))
      for (let i = 0; i < highscores.length; i++) {
        minutes = Math.floor(highscores[i].score / 60)
        seconds = Math.floor(highscores[i].score % 60)
        let li = document.createElement('li')
        li.innerText = `${highscores[i].name} ${minutes}:${seconds}`
        scoreBoard.appendChild(li)
      }
    }
  }

  /**
   * Remove the previous scores
   *
   * @memberof HighScore
   */
  clearScores () {
    document.querySelector('#scores').innerHTML = ''
  }

  /**
   * Save the players name to localstorage if it´s not already saved
   *
   * @memberof HighScore
   */
  setName () {
    if (this._nameInput.value !== '' && this._nameInput.value !== window.localStorage.getItem('name')) {
      window.localStorage.setItem('name', this._nameInput.value)
    }
  }
}
