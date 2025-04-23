import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { TextPlugin } from "gsap/TextPlugin";

gsap.registerPlugin(Draggable, SplitText, TextPlugin);
// gsap.registerPlugin(InertiaPlugin);

class MusicPlayer {

  constructor() {
    //audios and covers are always stored in public/audios and public/covers so we only need the name and format, the rest of the path is added upon use
    this.tracks = [
      { title: "Just a Man", artist: "Jorge Riverra-Herrans", audioPath: "just-a-man-jorge-riverra-herrans.mp3", coverImgPath: "epic-troy-saga.jpg" },
      { title: "Open Arms", artist: "Jorge Riverra-Herrans", audioPath: "open-arms-jorge-riverra-herrans.mp3", coverImgPath: "epic-troy-saga.jpg" },
      { title: "Remember Them", artist: "Jorge Riverra-Herrans", audioPath: "remember-them-jorge-riverra-herrans.mp3", coverImgPath: "epic-cyclops-saga.jpg" },
      { title: "Storm", artist: "Jorge Riverra-Herrans", audioPath: "storm-jorge-riverra-herrans.mp3", coverImgPath: "epic-ocean-saga.jpg" },
      { title: "Puppeteer", artist: "Jorge Riverra-Herrans", audioPath: "puppeteer-jorge-riverra-herrans.mp3", coverImgPath: "epic-circe-saga.jpg" },
      { title: "Monster", artist: "Jorge Riverra-Herrans", audioPath: "monster-jorge-riverra-herrans.mp3", coverImgPath: "epic-underworld-saga.jpg" }
    ];
    this.currentTrackIndex = 0;
    this.audio = new Audio();
    this.isPlaying = false;
    this.volume = 1.2;
    this.init();
  }

  init() {
    this.cacheDOM();
    this.bindEvents();
    this.setupDraggable();
    this.loadTrack();
    this.initTrackList();
  }

  cacheDOM() {
    this.playButton = document.querySelector("#play");
    this.playImage = document.querySelector("#playImg");
    this.nextButton = document.querySelector("#next");
    this.prevButton = document.querySelector("#prev");
    this.trackTitle = document.querySelector("#track-title");
    this.trackList = document.querySelector("#track-list");
    this.showQueueButton = document.querySelector("#show-queue");
    this.bottomContainer = document.querySelector("#bottom-container")

    this.playlist = document.querySelector("#playlist");
    this.playlistCovers = [];
    this.tracks.forEach((t) => {
      const tElement = document.createElement("li");
      tElement.innerHTML = `<img src="${`/covers/${t.coverImgPath}`}"/>`;
      this.playlistCovers.push(tElement);
      this.playlist.appendChild(tElement);
    })

    this.trackTitle.innerHTML = `${this.tracks[this.currentTrackIndex].title} <br> ${this.tracks[this.currentTrackIndex].artist}`;
  }

  setupDraggable() {
    this.draggables = [];
    this.playlistCovers.forEach((t, i) => {
      this.positionCover(t, i);
      this.draggables.push(this.createDraggable(t, i));
      this.draggables[i][0].disable(); //disable Draggable once created
    });
    //enable Draggable on the first cover
    this.draggables[0][0].enable();
  }

  positionCover(t, i) {
    gsap.set(t, {
      scale: 1 - (i / 6),
      top: `calc(${-i}*${window.innerWidth > window.innerHeight ? 8 : 5}vh + 50%)`,
      transform: 'translate(0%, -50%)',
      zIndex: this.tracks.length - i
    });
  }

  createDraggable(t, i) {
    return Draggable.create(t, {
      type: "x",
      onDragEnd: () => {
        if (this.draggables[i][0].endX < -(this.draggables[i][0].target.clientWidth * 0.75)) this.prepareChangeTrack(false);
        else if (this.draggables[i][0].endX > window.innerWidth - (this.draggables[i][0].target.clientWidth / 4)) this.prepareChangeTrack(true);
        else gsap.to(this.draggables[i][0].target, { x: 0 });
      }
    })
  }

  bindEvents() {
    this.playButton.addEventListener("click", () => this.togglePlay());
    this.nextButton.addEventListener("click", () => this.prepareChangeTrack(true));
    this.prevButton.addEventListener("click", () => this.prepareChangeTrack(false));
    this.audio.addEventListener("ended", () => this.prepareChangeTrack(true));
    this.showQueueButton.addEventListener("click", () => this.toggleShowQueue());
  }

  loadTrack() {
    if (this.currentTrackIndex < 0 || this.currentTrackIndex >= this.tracks.length) {
      console.error("Index de piste invalide");
      return;
    }
    this.audio.src = '/audios/' + this.tracks[this.currentTrackIndex].audioPath;
  }

  playTextAnim(next) {
    this.animText = gsap.timeline()
    this.fadeTextAnim(next)
    this.prepareApparitionTextAnim(next)
  }

  fadeTextAnim(next) {
    this.animText.to(this.trackTitle, {
      x: next ? '-100%' : '100%',
      opacity: 0,
      duration: 0.2
    })
  }

  prepareApparitionTextAnim(next) {
    this.animText.set(this.trackTitle, {
      text: `${this.tracks[this.currentTrackIndex].title} <br> ${this.tracks[this.currentTrackIndex].artist}`,
      opacity: 1,
      x: 0,
      onComplete: () => this.apparitionTextAnim(next)
    })
  }

  apparitionTextAnim(next) {
    this.splitText = new SplitText(this.trackTitle, {
      type: "lines"
    })
    this.animText.set(this.splitText.lines, {
      x: next ? window.innerWidth / 2 + this.trackTitle.clientWidth : -(window.innerWidth / 2 + this.trackTitle.clientWidth)
    })
    this.animText.to(this.splitText.lines, {
      duration: 0.5,
      x: 0,
      ease: "back.out(1)",
      stagger: 0.05
    });
  }

  togglePlay(forcePlay = false) {
    this.isPlaying = forcePlay || !this.isPlaying
    if (this.isPlaying) {
      this.audio.play().catch(err => console.error("Erreur de lecture :", err));
      this.playImage.src = '/pause.svg';
      this.playImage.alt = 'Pause';
    } else {
      this.audio.pause();
      this.playImage.src = '/play_arrow.svg';
      this.playImage.alt = 'Play';
    }
  }

  prepareChangeTrack(next) {
    this.currentTrackIndex = (next ? (this.currentTrackIndex + 1) : (this.currentTrackIndex - 1 + this.tracks.length)) % this.tracks.length;
    this.changeTrack(next);
  }

  changeTrack(next = true) { //if we change track with the complete playlist, it's not the next or previous track, so by default we play the same text animation as if it was the next track
    this.loadTrack();
    this.togglePlay(true);
    this.updateCarousel();
    this.playTextAnim(next);
  }

  updateCarousel() {
    this.draggables.forEach(d => {
      d[0].disable();
      gsap.set(d[0].target, {
        x: 0
      })
    })
    this.playlistCovers.forEach((t, i) => {
      const idx = (i - this.currentTrackIndex + this.playlistCovers.length) % this.playlistCovers.length;
      gsap.fromTo(t, {
        zIndex: this.tracks.length - idx,
      }, {
        scale: 1 - (idx / 6),
        top: `calc(${-idx}*${window.innerWidth > window.innerHeight ? 8 : 5}vh + 50%)`,
        duration: 0.2
      });
    });
    this.draggables[this.currentTrackIndex][0].enable()
  }

  initTrackList() {
    //create content & their event listener
    this.tracks.forEach((t, i) => {
      const tElement = document.createElement("li");
      tElement.innerHTML = `
          <img class="track-img" src="${`/covers/${t.coverImgPath}`}"/>
          <p>${t.title} | ${t.artist}</p>
        `;
      tElement.classList.add('track-line')
      tElement.addEventListener('click', () => {
        this.currentTrackIndex = i;
        this.changeTrack();
      })
      this.trackList.appendChild(tElement);
    })
    //for mobile
    this.showingQueueOnMobile = false;
  }

  toggleShowQueue() {
    this.showingQueueOnMobile = !this.showingQueueOnMobile;
    if (this.showingQueueOnMobile) {
      this.animShowQueue();
    } else {
      this.animHideQueue();
    }
  }

  animShowQueue() {
    gsap.to(this.bottomContainer, {
      height: "100vh",
      duration: 0.4,
    });
  }

  animHideQueue() {
    gsap.to(this.bottomContainer, {
      height: "30vh",
      duration: 0.4,
    })
  }

}

document.addEventListener('DOMContentLoaded', () => new MusicPlayer)

// Fonctionnalités : Draggable
// On va utiiser Draggable pour drag n drop les images de notre slider, et passer d'une musique à l'autre
// https://gsap.com/docs/v3/Plugins/Draggable/

// Dans cet objet veut utiliser le "Snap", c'est à dire la magnétisation vers un item lorsqu'on relache le drag
// Pour utiliser Snap, il faut également ajouter le Inertia Plugin, (normalement payant, mais la on peut simplement utiliser une version gratos)
// La façon de le faire est d'importer le fichier js https://assets.codepen.io/16327/InertiaPlugin.min.js, dans une balise script, dans ton fichier HTML


// Fonctionnalité : Split Text

// De même, on va utiliser le Plugin Split Text (normalement payant) de GSAP.
// Tu peux trouver le fichier à utiliser ici : https://codepen.io/GreenSock/full/OPqpRJ/
