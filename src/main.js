import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
gsap.registerPlugin(Draggable) 

class MusicPlayer {

  constructor() {
    //audios and covers are always stored in public/audios and public/covers so we only need the name and format, the rest of the path is added upon use
    this.tracks = [
      { title: "Just a Man", artist: "Jorge Riverra-Herrans", audioPath: "just-a-man-jorge-riverra-herrans.mp3", coverImgPath: "epic-troy-saga.jpg" },
      { title: "Open Arms", artist: "Jorge Riverra-Herrans", audioPath: "open-arms-jorge-riverra-herrans.mp3", coverImgPath: "epic-troy-saga.jpg" }
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
    //this.setupDraggable();
    this.loadTrack();
  }

  cacheDOM() {
    this.playButton = document.querySelector("#play");
    this.nextButton = document.querySelector("#next");
    this.prevButton = document.querySelector("#prev");
    this.trackTitle = document.querySelector("#track-title");

    this.playlist = document.querySelector("#playlist");
    this.tracks.forEach((t) => {
      const tElement = document.createElement("li")
      tElement.innerHTML = `<img src="${`/covers/${t.coverImgPath}`}"/>`
      this.playlist.appendChild(tElement)
    })
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
    this.trackTitle.textContent = this.tracks[this.currentTrackIndex].title;
  }

  togglePlay() {
    if (this.isPlaying) {
      this.audio.pause();
    } else {
      this.audio.play().catch(err => console.error("Erreur de lecture :", err));
    }
    this.isPlaying = !this.isPlaying
  }

  changeTrack(next) {
    this.currentTrackIndex = (next ? (this.currentTrackIndex + 1) : (this.currentTrackIndex - 1)) % this.tracks.length;
    this.loadTrack();
    this.audio.play();
    this.isPlaying = true;
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
