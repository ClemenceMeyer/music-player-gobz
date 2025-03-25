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
      { title: "Puppeteer", artist: "Jorge Riverra-Herrans", audioPath: "puppeteer-jorge-riverra-herrans.mp3", coverImgPath: "epic-circe-saga.jpg" }
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
  }

  cacheDOM() {
    this.playButton = document.querySelector("#play");
    this.playImage = document.querySelector("#playImg");
    this.nextButton = document.querySelector("#next");
    this.prevButton = document.querySelector("#prev");
    this.trackTitle = document.querySelector("#track-title");

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
      gsap.set(t, {
        scale: 1 - (i / 6),
        bottom: i * 40,
        zIndex: this.tracks.length - i
      });
      this.draggables.push(Draggable.create(t, {
          type: "x",
          onDragEnd: () => {
            if (this.draggables[i][0].endX < -(this.draggables[i][0].target.clientWidth * 0.75)) this.changeTrack(false);
            else if (this.draggables[i][0].endX > window.innerWidth - (this.draggables[i][0].target.clientWidth / 4)) this.changeTrack(true);
            else gsap.to(this.draggables[i][0].target, { x: 0 });
          }
        }
      ));
      this.draggables[i][0].disable();
    });
    this.draggables[0][0].enable();
  }

  bindEvents() {
    this.playButton.addEventListener("click", () => this.togglePlay());
    this.nextButton.addEventListener("click", () => this.changeTrack(true));
    this.prevButton.addEventListener("click", () => this.changeTrack(false));
    this.audio.addEventListener("ended", () => this.changeTrack(true));
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
    this.animText.to(this.trackTitle, {
      x: next ? '-100%' : '100%',
      opacity: 0,
      duration: 0.2
    })
    this.animText.set(this.trackTitle, {
      text: `${this.tracks[this.currentTrackIndex].title} <br> ${this.tracks[this.currentTrackIndex].artist}`,
      opacity: 1,
      x: 0,
      onComplete: () => {
        this.splitText = new SplitText(this.trackTitle, {
          type: "lines"
        })
        this.animText.set(this.splitText.lines, {
          x: next ? window.innerWidth / 2 + this.trackTitle.clientWidth : -(window.innerWidth / 2 + this.trackTitle.clientWidth)
        })
        this.animText.to(this.splitText.lines, {
          duration: 1,
          x:0,
          ease: "back.inOut(1.7)",
          stagger: 0.2
        });
      }
    })
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

  changeTrack(next) {
    this.currentTrackIndex = (next ? (this.currentTrackIndex + 1) : (this.currentTrackIndex - 1 + this.tracks.length)) % this.tracks.length;
    this.loadTrack();
    this.togglePlay(true);
    this.updateCarousel();
    this.playTextAnim(next);
  }

  updateCarousel() {
    this.draggables.forEach(d => {
      d[0].disable();
      gsap.set(d[0].target, {
        x:0
      })
    })
    this.playlistCovers.forEach((t, i) => {
      const idx = (i - this.currentTrackIndex + this.playlistCovers.length) % this.playlistCovers.length;
      gsap.fromTo(t, {
        zIndex: this.tracks.length - idx,
      }, {
      scale: 1 - (idx / 6),
        bottom: idx * 40,
        duration: 0.2
      });
    });
    this.draggables[this.currentTrackIndex][0].enable()
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
