import React, { Component } from 'react'
import styles from '../styles/Home.module.css'
import game from '../styles/game.module.css'
import {Howl, Howler} from 'howler';

class Card extends React.Component {
	constructor(props) {
		super(props);
		this.flip = this.flip.bind(this);
    this.hide = this.hide.bind(this);
		this.state = {
			active: false,
		};
	}

	flip() {
		const currentState = this.state.active;
		if (this.props.isLocked() || this.state.hidden) return;

		this.setState({ active: !currentState });
		console.log('flipping card(' + this.props.value + ') state: ', !currentState);
		if (!currentState) {
			console.log('sending card value...', this.props.value);
			this.props.onFlip(this.props.value, this.flip, this.hide);
		} else {
			console.log('sending null...');
			this.props.onFlip(null, null);
		}
	}

  hide() {
    console.log('hiding card...');
    this.setState({hidden:true});
    setTimeout(() => {

    }, 1500)
  }

  /**
  CSS flip trick modified from good ol' David Walsh:
  https://davidwalsh.name/demo/css-flip.php
  */
	render() {
		return (
			<div className={`${game.flipCard} animate__animated ${this.state.hidden ? `animate__rotateOut ${game.hidden}`: ''}`} onClick={this.flip}>
				<div className={`${this.state.active ? game.flipCardInnerActive: game.flipCardInner }`}>
					<div className={game.flipCardFront}></div>
					<div className={game.flipCardBack}>
						<p suppressHydrationWarning>{this.props.value}</p>
					</div>
				</div>
			</div>
		);
	}
}

class Memory extends React.Component {
	constructor(props) {
    const flipSound = new Howl({
      src: ['flip.mp3']
    });
    const matchSound = new Howl({
      src: ['match.mp3']
    });
		super(props);
		this.checkForMatch = this.checkForMatch.bind(this);
		this.isLocked = this.isLocked.bind(this);
		this.state = {
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
			locked: false,
      cards: this.generateCards(),
      matches: 0,
      sounds: {
        flip: flipSound,
        match: matchSound,
      },
		};
	}

	renderCard(value, key) {
		return <Card value={value} key={key} onFlip={this.checkForMatch} isLocked={this.isLocked} />;
	}

	isLocked() {
		return this.state.locked;
	}

	checkForMatch(cardValue, flip,hide) {
		const first = this.state.first;
    const second = this.state.second;

    this.state.sounds.flip.play();

		console.log('dumping first...', this.state.first);
		console.log('dumping second...', this.state.second);

		if (cardValue != null) {
			if (first.value == null) {
				console.log("Storing first value:", cardValue);
				this.setState({
					first: {
						value: cardValue,
						flip: flip,
            hide: hide,
					},
				});
			} else {
				console.log("Storing second value:", cardValue);
				this.setState({
					second: {
						value: cardValue,
						flip: flip,
            hide: hide,
					},
					locked: true,
				}, () => {
					// compare the values
					console.log("Comparing values...");

					setTimeout(() => {
						this.setState({
							locked: false,
						}, () => {
							if (this.state.first.value == this.state.second.value) {
								console.log("It's a match!");
                this.state.sounds.match.play();
                this.state.first.hide();
                this.state.second.hide();
                const matches = this.state.matches;
                let _this = this;
                this.setState({matches:matches+1}, () => {
                  if (_this.state.matches == _this.props.pairs) {
                    setTimeout(() => {
                      alert("You win!");
                    }, 1000);
                  }
                });
							} else {
								console.log("No match...");
								this.state.first.flip();
								this.state.second.flip();
							}
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

  generateCards() {
    const max = 13;
    let cards = [];
    for (let i = 1; i <= this.props.pairs; i++) {
      let value = Math.floor(Math.random() * Math.floor(max)) + 1;
      cards.push({
        value: value,
        key: Math.random(),
      });
      cards.push({
        value: value,
        key: Math.random(),
      });
    }
    console.log('dumping cards...', cards);
    return cards.sort(() => Math.random() - 0.5);
  }

	render() {
    const _this = this;
    return (
        <div className={styles.grid}>
          {this.state.cards.map((card) => {
            return _this.renderCard(card.value, card.key)
          })}
        </div>
    );
	}
}

export default Memory