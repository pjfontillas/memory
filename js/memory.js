import React, { Component } from 'react'
import styles from '../styles/Home.module.css'
import game from '../styles/game.module.css'
import {Howl, Howler} from 'howler';

/**
 * Individual card implementation, responsible for handling
 * flipping of cards and reporting value to parent game
 * component. Also makes itself inactive after a match.
 */
class Card extends React.Component {
	constructor(props) {
		super(props);
		this.flip = this.flip.bind(this);
    this.hide = this.hide.bind(this);
		this.state = {
			active: false, // by default all card values are hidden
		};
	}

  /**
   * Visually flips the card by toggling the active state that is
   * then used in the render function. Also reports card value
   * to parent game component to check for matches.
   */
	flip() {
		if (this.props.isLocked() || this.state.hidden) return;

    // toggle active state from true to false or vice versa
		this.setState({ active: !this.state.active }, () => {
      // sends card value if active
      if (this.state.active) {
        this.props.onFlip(this.props.value, this.flip, this.hide);
      } else {
        // sends null to clear data sent to parent game component
        this.props.onFlip(null, null);
      }
    });
	}

  /**
   * Hides card by activating hidden state styling through state.
   */
  hide() {
    this.setState({hidden:true});
  }

  /**
  CSS flip trick modified from good ol' David Walsh:
  https://davidwalsh.name/demo/css-flip.php
  */
	render() {
		return (
			<div data-testid={`card-${this.props.value}`} className={`${game.flipCard} animate__animated ${this.state.hidden ? `animate__rotateOut ${game.inactive}`: ''}`} onClick={this.flip}>
				<div className={`${game.flipCardInner} ${this.state.active ? game.flipCardInnerActive: '' }`}>
					<div className={game.flipCardFront}></div>
					<div className={game.flipCardBack}>
            <div className={game.cardTop} suppressHydrationWarning>{`${this.state.active ? this.props.value : '0'}`}</div>
            <div className={game.cardBottom} suppressHydrationWarning>{`${this.state.active ? this.props.value : '0'}`}</div>
					</div>
				</div>
			</div>
		);
	}
}

/**
 * Game component responsible for generating and tracking cards. Tracks
 * matches and triggers audio cues to match animations.
 */
class Memory extends React.Component {
	constructor(props) {
		super(props);
		this.checkForMatch = this.checkForMatch.bind(this);
		this.isLocked = this.isLocked.bind(this);
    this.replay = this.replay.bind(this);
		this.state = {
			first: {
				value: null,
				flip: null, // reference to card's flip function, flips it back down if no match
        hide: null, // reference to card's hide fn, hides/disables it on match
			},
			second: {
				value: null,
				flip: null,
        hide: null,
			},
			locked: false, // used to lock all other cards when 2 are already flipped
      cards: this.generateCards(), // holds array of card objects
      matches: 0, // used to track win condition
      sounds: {
        flip: null,
        match: null,
        win: null,
      },
      start: null, // date created on first flip
      timer: null, // time elapsed since first flip and last match
		};
	}

  /**
   * Used to broadcast locked status to cards, toggling whether they can
   * flip or not.
   *
   * @return {boolean} Game card lock status.
   */
	isLocked() {
		return this.state.locked;
	}

  /**
   * After every flip checks for matching cards.
   * Also handles playing audio to match animations.
   *
   * @param {number|string} cardValue.
   * @param {function} flip Reference to card component function to flip card.
   * @param {function} hide Reference to card component function to disable card.
   */
	checkForMatch(cardValue, flip, hide) {
		const first = this.state.first;
    const second = this.state.second;

    // Initializing sounds after user interaction.
    // https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio
    if (!this.state.sounds.flip) {
      this.setState({
        sounds: {
          flip: new Howl({
            src: ['/sounds/flip.mp3'],
            volume: 0.2,
          }),
          match: new Howl({
            src: ['/sounds/match.mp3'],
            volume: 0.2,
          }),
          win: new Howl({
            src: ['/sounds/win.mp3'],
            loop: true,
            volume: 0.05,
          }),
        },
      }, () => {
        this.state.sounds.flip.play();
      });
    } else {
      this.state.sounds.flip.play();
    }

    // non-null values are face up cards
		if (cardValue != null) {
      // start game timer
      if (this.state.start == null) {
        const date = Date.now();
        this.setState({
          start: date,
        });
      }

      // set first card value if empty
			if (first.value == null) {
				this.setState({
					first: {
						value: cardValue,
						flip: flip,
            hide: hide,
					},
				});
			} else {
        // set second card value
				this.setState({
					second: {
						value: cardValue,
						flip: flip,
            hide: hide,
					},
					locked: true, // locks game, preventing other cards from flipping
				}, () => {
          // 1s timeout lets animation play out
					setTimeout(() => {
						this.setState({
							locked: false,
						}, () => {
							if (this.state.first.value == this.state.second.value) {
                this.state.sounds.match.play();
                this.state.first.hide();
                this.state.second.hide();

                let matches = this.state.matches;
                this.setState({
                  matches: ++matches
                }, () => {
                  // game win condition
                  if (this.state.matches == this.props.pairs) {
                    // game end timer set to 2 decimal places
                    this.setState({
                      timer: ((Date.now() - this.state.start) / 1000).toFixed(2),
                    });

                    // resets cards to clear game board
                    this.setState({
                      cards: [],
                    });
                    setTimeout(() => {
                      this.state.sounds.win.play();
                    }, 500);
                  }
                });
							} else {
                // flip face-up cards back down
								this.state.first.flip();
								this.state.second.flip();
							}
              // reset stored cards after match
							this.setState({
								first: {
									value: null,
									flip: null,
									hide: null,
								},
								second: {
									value: null,
									flip: null,
									hide: null,
								},
							});
						});
					}, 1000);
				});
			}
		} else {
      // null removes stored cards
      if (second.value != null) {
        this.setState({
          second: {
            value: null,
            flip: null,
            hide: null,
          },
        });
      } else {
        this.setState({
          first: {
            value: null,
            flip: null,
            hide: null,
          },
        });
      }
    }
	}

  /**
   * Generates pairs of playing cards and randomly sorts them.
   *
   * @return {array<object>} Array of paired and randomly sorted cards.
   */
  generateCards() {
    //const max = 13;
    let cards = [];
    // tweaked for loop to do 2-13, all but Aces
    for (let i = 1; i <= this.props.pairs; i++) {
      //let value = this.convertFaceCards(Math.floor(Math.random() * Math.floor(max)) + 1);
      let value = this.convertFaceCards(i + 1);
      cards.push({
        value: value,
        key: Math.random(),
      });
      cards.push({
        value: value,
        key: Math.random(),
      });
    }
    return cards.sort(() => Math.random() - 0.5); // close enough random sort hack
  }

  /**
   * Converts numbers to face cards.
   *
   * @param {number} value
   * @return {number|string}
   */
  convertFaceCards(value) {
    switch(value) {
      case 1:
        return 'A';
      case 11:
        return 'J';
      case 12:
        return 'Q';
      case 13:
        return 'K';
      default:
        return value;
    }
  }

  /**
   * Resets game so user can play again.
   */
  replay() {
    this.state.sounds.win.stop();
    this.setState({
      matches: 0,
      cards: this.generateCards(),
      start: null,
      timer: null,
    });
  }

	render() {
    const _this = this;
    const titleStyle = {
      color: '#ca2f35',
    };
    return (
        <div>
          <main>
            <h1 className={styles.title}>
              Me<span style={titleStyle}>mory</span>
            </h1>

            <p className={styles.description}>
              Choose any card to start
            </p>
          </main>
          <div className={(this.state.matches == this.props.pairs) ? `animate__animated animate__rollIn ${game.winScreen}`: game.hidden}>
            <div className={styles.grid}>
              <div>
                <p>Time: {this.state.timer}s</p>
                <button className={`animate__animated animate__heartBeat animate__infinite infinite`} onClick={this.replay}>Play Again</button>
              </div>
              <img src="/nana.gif" width="300" />
            </div>
          </div>
          <div className={`${styles.grid} animate__animated animate__jackInTheBox`}>
            {this.state.cards.map((card) => {
              return <Card value={card.value} key={card.key} onFlip={this.checkForMatch} isLocked={this.isLocked} />;
            })}
          </div>
        </div>
    );
	}
}

export {
  Memory,
  Card,
}