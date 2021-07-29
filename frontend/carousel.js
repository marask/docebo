class Carousel {
    constructor(options) {
        this.containerId = options.container;
        this.chunkSize = 6;
        this.icon = options.icon;
        this.title = options.title;
        this.subtitle = options.subtitle;
        this.fetchCards = options.fetchCards;
        this.firstCard = 0;
        this.totalCardsFromAPI = 0;
        this.loadedCards = 0;
        this.allCardsLoaded = false;
        this.prevButton = null;
        this.nextButton = null;
        this.currentChunk = 1;
        this.swiping = false;
        this.buildStructure();
    }

    //BUILD MAIN STRUCTURAL ELEMENTS
    buildStructure() {

        this.carouselNumber = this.containerId.replace('carousel', '');
        this.mainContainer = document.getElementById(this.containerId);
        this.mainContainer.classList.add('carousel-container');
        this.mainContainer.classList.add('carousel-' + this.carouselNumber);
        this.buildTitle();
        this.buildCardsContainer();
        this.buildCardsScroller();
        this.buildNavigation();
        this.cardsContainer.addEventListener('touchstart', ((e) => this.swipeStart(e)), {passive: true});
        this.cardsContainer.addEventListener('touchmove', ((e) => this.swipe(e)), {passive: true});
        this.cardsContainer.addEventListener('touchend', ((e) => this.swipeEnd(e)), {passive: true});
        this.buildCards();

    }

    buildTitle() {
        this.mainContainer.innerHTML += '<div class="title-container"><div><div class="carousel-icon"><span class="material-icons">' + this.icon + '</span></div></div>' +
            '<div><h1>' + this.title + '<span class="material-icons" style="color:#2770A0; vertical-align: -6px;">chevron_right</span></h1>' +
            '<h2 class="carousel-subtitle">' + this.subtitle + '</h2></div></div>';
    }

    buildCardsContainer() {
        this.mainContainer.innerHTML += '<div class="cards-container"></div>';
        this.cardsContainer = this.mainContainer.querySelector('.cards-container');
        this.cardsWidth = this.cardsContainer.clientWidth / this.chunkSize;
    }

    buildCardsScroller() {
        this.cardsContainer.innerHTML += '<div class="cards" style="position:absolute; left:0;"></div>';
        this.cardsScroller = this.cardsContainer.querySelector('.cards');
    }

    // FETCH CARD DATA FROM API
    buildCards(chunk = 1) {
        let first = 0;
        if (chunk > 1) {
            first = this.chunkSize * (chunk - 1);
            // RESET COUNTER WHEN END OF DATA IS REACHED (TO SIMULATE MORE DATA)
            if (first > this.totalCardsFromAPI) {
                first = 0;
            }
        }
        this.fetchCards(this.chunkSize, first).then((data) => {
            this.totalCardsFromAPI = data.total;
            if (data.cards && data.cards.length) {
                let i = this.loadedCards;
                this.loadedCards += data.cards.length;

                data.cards.forEach(card => {
                    this.showCardSkeleton(card, i);
                    i++;
                });
            } else {
                this.hideKeys('next');
                this.prevCard(true);
                this.allCardsLoaded = true;
            }
        });

    }

    // SHOW CARD "SKELETON" (DEFAULT PRELOAD LAYOUT)
    showCardSkeleton(card, index) {
        this.cardsScroller = this.cardsContainer.querySelector('.cards');
        this.cardsScroller.innerHTML += '<div style="width:' + this.cardsWidth + 'px; min-width: 200px;" id="card-' + this.carouselNumber + '-' + index + '"><div class="card">' +
            '<div class="card-preloader" style="height:150px; background-color: #cccccc;">' +
            '<span class="material-icons spinner" style="font-size:4rem; color:#ffffff;">hourglass_empty</span></div>' +
            '<div class="card-body" style="background-image: url(images/skeleton_bg.jpg); background-size: contain; background-repeat: no-repeat;"></div>' +
            '</div></div>';
        // SIMULATE API DELAY
        setTimeout(() => {
            this.replaceSkeleton(card, index);
        }, 1500)
    }

    // REPLACE SKELETON WITH ACTUAL CARD CONTENT
    replaceSkeleton(card, index) {
        let durationClass = 'card-duration';
        let collectionItem = '';
        let languageItem = '';

        let isCollection = card.cardinality === 'collection';
        let hasLanguage = card.language;
        if (!card.duration) {
            durationClass += ' hidden';
        }
        if (isCollection) {
            collectionItem = '<div class="card-collection"><div class="othercard othercard-1"></div><div class="othercard othercard-2"></div></div>';
        }
        if (hasLanguage) {
            languageItem = '<div class="card-language">' + card.language + '</div>';
        }

        let toReplace = document.getElementById('card-' + this.carouselNumber + '-' + index);
        toReplace.innerHTML = '<div class="card">' +
            '<div class="card-img" style="height:150px; background-image: url(images/' + card.image + ')">' +
            '<div class="card-type">' + card.type + '</div>' +
            '<div class="' + durationClass + '" id="card-' + index + '-duration">' + new Date(card.duration * 1000).toISOString().substr(11, 8) + '</div>' +
            '</div>' +
            '<div class="card-body">' + card.title + languageItem + '</div>' +
            '</div>' + collectionItem;
    }

    // CREATE ARROW BUTTONS
    buildNavigation() {
        let height = this.cardsContainer.clientHeight;
        this.cardsContainer.innerHTML += '<a class="key-previous hidden" id="prev" href="javascript:;" style="height: ' + height + 'px">' +
            '<span class="material-icons">chevron_left</span></a>' +
            '<a class="key-next hidden" id="next" href="javascript:void(0);" style="height: ' + height + 'px">' +
            '<span class="material-icons">chevron_right</span></a>';
        this.prevButton = this.cardsContainer.querySelector('.key-previous');
        this.nextButton = this.cardsContainer.querySelector('.key-next');
        // ADD EVENT LISTENERS FOR ARROW BUTTONS
        this.cardsContainer.addEventListener("mouseenter", (() => this.showKeys()));
        this.cardsContainer.addEventListener("mouseleave", (() => this.hideKeys()));
        this.prevButton.addEventListener('click', (() => this.prevCard()));
        this.nextButton.addEventListener('click', (() => this.nextCard()));
    }

    // SHOW ARROW BUTTONS
    showKeys() {
        console.log(this.allCardsLoaded);
        if (this.firstCard > 0) {
            this.prevButton.classList.remove('hidden');
        }
        if (!this.allCardsLoaded) {
            this.nextButton.classList.remove('hidden');
        }

    }

    // HIDE ARROW BUTTONS
    hideKeys(key) {
        if (!key) {
            this.prevButton.classList.add('hidden');
            this.nextButton.classList.add('hidden');
        } else {
            switch (key) {
                case 'prev':
                    this.prevButton.classList.add('hidden');
                    break;
                case 'next':
                    this.nextButton.classList.add('hidden');
                    break;
            }
        }
    }

    // SCROLL BY 1 CARD TO THE LEFT
    prevCard(keepNextHidden = false) {
        let currentLeft = this.cardsScroller.style.left.replace('px', '');
        this.cardsScroller.style.left = +currentLeft + +this.cardsWidth + 'px';
        this.firstCard -= 1;
        if (this.firstCard < 1) {
            this.prevButton.classList.add('hidden');
        }
        if (!keepNextHidden) {
            this.nextButton.classList.remove('hidden');
        }
    }

    // SCROLL BY 1 CARD TO THE RIGHT, LOAD MORE IF AVAILABLE
    nextCard() {
        this.cardsScroller = this.cardsContainer.querySelector('.cards');
        let currentLeft = this.cardsScroller.style.left.replace('px', '');
        this.cardsScroller.style.left = currentLeft - this.cardsWidth + 'px';
        this.firstCard += 1;
        this.prevButton.classList.remove('hidden');
        if (this.firstCard + this.chunkSize > this.loadedCards) {
            this.currentChunk++;
            this.buildCards(+this.currentChunk);
        }
    }

    //SWIPE

    swipeStart(event) {
        this.swiping = true;
        this.startX = event.touches[0].clientX;
    }

    swipe(event) {
        let touch = event.touches[0];
        if (this.swiping) {
            console.log(touch.clientX);

            if (touch.clientX < this.startX - 50) {
                if (this.firstCard + this.chunkSize + 1 <= this.fetchCards.length) {
                    this.nextCard();
                    this.swipeEnd();
                } else {
                    this.cardsScroller = this.cardsContainer.querySelector('.cards');
                    let currentLeft = this.cardsScroller.style.left.replace('px', '');
                    this.cardsScroller.style.left = currentLeft - this.cardsWidth + 'px';
                    this.swipeEnd();
                }
            } else if (touch.clientX > this.startX + 50) {
                if (this.firstCard > 0) {
                    this.prevCard();
                    this.swipeEnd();
                }
            }
        }
    }

    swipeEnd(event) {
        this.swiping = false;
    }

    random(min, max) {
        return Math.floor(Math.random() * (max - min)) + min
    };


}