const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PlAYER_STORAGE_KEY = "duck_player";

const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playBtn =$('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');


const app = {
    currentIndex:0, //lấy currentIdex đầu mảng là bài hết đầu tiên
    isPlaying:false,
    isRandom:false,
    isRepeat:false,
    config :JSON.parse(localStorage.getItem(PlAYER_STORAGE_KEY)) || {},
    songs:[
        {
            name: 'Chơi đồ',
            singer:'MCK',
            path: './accsets/mp3/choido.mp3',
            image: './accsets/img/choidomck.jpg'
        },
        {
            name: 'Tay to',
            singer:'MCK',
            path: './accsets/mp3/tayto.mp3',
            image: './accsets/img/tayto.jpg'
        },
        {
            name: 'Và thế giới mất đi một người cô đơn',
            singer:'Mazus',
            path: './accsets/mp3/mazus.mp3',
            image: './accsets/img/mazus.jpg'
        },
        {
          name: 'Điều khác lạ',
          singer:'Đạt-G',
          path: './accsets/mp3/dieukhacla.mp3',
          image: './accsets/img/dieukhacla.jpg'
        },
        {
            name: 'Hương rừng',
            singer:'meme',
            path: './accsets/mp3/huonrung.mp3',
            image: './accsets/img/huongrung.jpg'
        },
        {
            name: '1 phút',
            singer:'A n d i e z',
            path: './accsets/mp3/1phut.mp3',
            image: './accsets/img/1phut.jpg'
        },
        {
          name: 'Ai đợi mình được mãi',
          singer:'Thanh Hưng',
          path: './accsets/mp3/aidoiminh.mp3',
          image: './accsets/img/aidoiminhduocmai.jpg'
        },
        {
          name: 'Xấu',
          singer:'2 Can',
          path: './accsets/mp3/xau.mp3',
          image: './accsets/img/unnamed.jpg'
        },
        {
            name: 'Duyên số',
            singer:'Du Uyên',
            path: './accsets/mp3/music0.mp3',
            image: './accsets/img/img0.jpg'
        },
        {
            name: 'Nếu ngày ấy',
            singer:'Vô danh',
            path: './accsets/mp3/music1.mp3',
            image: './accsets/img/img1.jpg'
        }
    ],
    setConfig : function (key, value) {
      this.config[key] = value;
      localStorage.setItem(PlAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    //Render playlist
    render: function(){
        const htmls = this.songs.map((song,index) =>{
            return `
            <div class="song ${index === this.currentIndex ? 'active': ''}" data-index=${index}>
            <div class="thumb" style="background-image: url('${song.image}')">
            </div>
            <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author">${song.singer}</p>
            </div>
            <div class="option">
              <i class="fas fa-ellipsis-h"></i>
            </div>
          </div>
            `
        })
        $('.playlist').innerHTML = htmls.join('');
    },
    //định nghĩa các thuộc tính cho object
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        })
    },
    // định nghĩa các sự kiện (DOM event)
    handleEvents: function(){
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // Xử lý CD quay / dừng 
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ],{
            duration: 10000, // 10 seconds
            iterations: Infinity//
        })
        cdThumbAnimate.pause();

        // Xử lý phóng to thu nhỏ
        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0; //nếu newcd < 0  thì mặc định cho nó = 0 để không âm.
            cd.style.opacity = newCdWidth/ cdWidth; // opacity giảm dần.
        };

        // Xử lý khi click play
        playBtn.onclick = function(){
            if(_this.isPlaying){
                audio.pause();
            } 
            else{
                audio.play();     
            }
        };

        // khi song được play 
        audio.onplay = function(){
            _this.isPlaying=true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        };

        //khi song bị path
        audio.onpause = function(){
            _this.isPlaying = false;
            player.classList.remove("playing");
            cdThumbAnimate.pause();

        };

        // khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function(){
            if(audio.duration){
                const progressPercent  = Math.floor(audio.currentTime / audio.duration *100);
                progress.value = progressPercent;
            }
                
        };

        // Xử lý khi tua xong 
        progress.onchange = function(e){
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
        };

        //Khi next bài hát
        nextBtn.onclick = function(){
            if (_this.isRandom){
                _this.playRandomSong();   
            } else{
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        };

        // Khi prev bài hát
        prevBtn.onclick = function(){
            if(_this.isRandom){
                _this.playRandomSong();   
            } else{
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();

        };

        
        // Khi bật tắt random bài hát
        randomBtn.onclick = function(e){
          _this.isRandom = !_this.isRandom;
          _this.setConfig('isRandom', _this.isRandom);
          randomBtn.classList.toggle('active', _this.isRandom);
        }
        
        // xử lý lặp lại bài hát
        repeatBtn.onclick = function(){
          _this.isRepeat = !_this.isRepeat;
          _this.setConfig('isRepeat', _this.isRepeat);
          repeatBtn.classList.toggle('active', _this.isRepeat);

        }
        // Xử lý next khi bài hát kết thúc
        audio.onended = function () {
          if(_this.isRepeat){ //khi bật lặp lại
            audio.play();
          } else {
                nextBtn.click();
            }
        }

        // Xử lý khi ấn click vào bài hát để chuyển ở play list
        playlist.onclick = function(e){
          const songNode = e.target.closest('.song:not(.active)')
          if(songNode || e.target.closest('.option')){
            // xử lí khi click vào song
            if(songNode){
              _this.currentIndex = Number(songNode.dataset.index);
              _this.LoadCurrentSong();
              _this.render();
              audio.play();
            }
            //Xử lý khi click vào option
            if(e.target.closest('.option')){

            }
          }
        }
    },
    scrollToActiveSong : function (){
      setTimeout( () =>{
        $('.song.active').scrollIntoView({
          behavior:'smooth',
          block:'nearest',
        })
      },300)
    },
    //tải thông tin bài hát đầu tiên vào UI khi chạy app
    LoadCurrentSong: function(){
        heading.textContent =  this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    // gán cấu hình config vào ứng dụng
    LoadConfig: function(){
      this.isRandom = this.config.isRandom;
      this.isRepeat = this.config.isRepeat;
    },
    //next bài
    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
          this.currentIndex = 0;
        }
        this.LoadCurrentSong();
    },
    // lùi bài hát
    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
          this.currentIndex = this.songs.length - 1;
        }
        this.LoadCurrentSong();
    },
    // ngẫu nhiên bài hát
    playRandomSong: function () {
        let newIndex 
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } 
        while (newIndex == this.currentIndex);
        
        this.currentIndex = newIndex;
        this.LoadCurrentSong();
    },
    start: function(){

        this.LoadConfig()

        this.defineProperties();

        this.handleEvents();

        this.LoadCurrentSong();

        this.render();

        // Hiển thị trạng thái ban đầu của button repeat và random
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    }

}
app.start();











/*
// Một số bài hát có thể bị lỗi do liên kết bị hỏng. Vui lòng thay thế liên kết khác để có thể phát
// Some songs may be faulty due to broken links. Please replace another link so that it can be played

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PlAYER_STORAGE_KEY = "F8_PLAYER";

const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: {},
  // (1/2) Uncomment the line below to use localStorage
  // config: JSON.parse(localStorage.getItem(PlAYER_STORAGE_KEY)) || {},
  songs: [
    {
        name: 'Duyên số',
        singer:'Du Uyên',
        path: './accsets/mp3/music0.mp3',
        image: './accsets/img/img0.jpg'
    },
    {
        name: 'Nếu ngày ấy',
        singer:'meme',
        path: './accsets/mp3/music1.mp3',
        image: './accsets/img/img1.jpg'
    },{
        name: 'Duyên số',
        singer:'Du Uyên',
        path: './accsets/mp3/music0.mp3',
        image: './accsets/img/img0.jpg'
    },
    {
        name: 'Nếu ngày ấy',
        singer:'meme',
        path: './accsets/mp3/music1.mp3',
        image: './accsets/img/img1.jpg'
    },
    {
        name: 'Duyên số',
        singer:'Du Uyên',
        path: './accsets/mp3/music0.mp3',
        image: './accsets/img/img0.jpg'
    },
    {
        name: 'Nếu ngày ấy',
        singer:'meme',
        path: './accsets/mp3/music1.mp3',
        image: './accsets/img/img1.jpg'
    },
    {
        name: 'Duyên số',
        singer:'Du Uyên',
        path: './accsets/mp3/music0.mp3',
        image: './accsets/img/img0.jpg'
    },
    {
        name: 'Nếu ngày ấy',
        singer:'meme',
        path: './accsets/mp3/music1.mp3',
        image: './accsets/img/img1.jpg'
    }
  ],
  setConfig: function (key, value) {
    this.config[key] = value;
    // (2/2) Uncomment the line below to use localStorage
    // localStorage.setItem(PlAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
                        <div class="song ${
                          index === this.currentIndex ? "active" : ""
                        }" data-index="${index}">
                            <div class="thumb"
                                style="background-image: url('${song.image}')">
                            </div>
                            <div class="body">
                                <h3 class="title">${song.name}</h3>
                                <p class="author">${song.singer}</p>
                            </div>
                            <div class="option">
                                <i class="fas fa-ellipsis-h"></i>
                            </div>
                        </div>
                    `;
    });
    playlist.innerHTML = htmls.join("");
  },
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      }
    });
  },
  handleEvents: function () {
    const _this = this;
    const cdWidth = cd.offsetWidth;

    // Xử lý CD quay / dừng
    // Handle CD spins / stops
    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000, // 10 seconds
      iterations: Infinity
    });
    cdThumbAnimate.pause();

    // Xử lý phóng to / thu nhỏ CD
    // Handles CD enlargement / reduction
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;

      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    // Xử lý khi click play
    // Handle when click play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    // Khi song được play
    // When the song is played
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };

    // Khi song bị pause
    // When the song is pause
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    // Khi tiến độ bài hát thay đổi
    // When the song progress changes
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      }
    };

    // Xử lý khi tua song
    // Handling when seek
    progress.onchange = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
    };

    // Khi next song
    // When next song
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // Khi prev song
    // When prev song
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // Xử lý bật / tắt random song
    // Handling on / off random song
    randomBtn.onclick = function (e) {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      randomBtn.classList.toggle("active", _this.isRandom);
    };

    // Xử lý lặp lại một song
    // Single-parallel repeat processing
    repeatBtn.onclick = function (e) {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };

    // Xử lý next song khi audio ended
    // Handle next song when audio ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    // Lắng nghe hành vi click vào playlist
    // Listen to playlist clicks
    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");

      if (songNode || e.target.closest(".option")) {
        // Xử lý khi click vào song
        // Handle when clicking on the song
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }

        // Xử lý khi click vào song option
        // Handle when clicking on the song option
        if (e.target.closest(".option")) {
        }
      }
    };
  },
  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }, 300);
  },
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
  },
  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },
  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);

    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },
  start: function () {
    // Gán cấu hình từ config vào ứng dụng
    // Assign configuration from config to application
    this.loadConfig();

    // Định nghĩa các thuộc tính cho object
    // Defines properties for the object
    this.defineProperties();

    // Lắng nghe / xử lý các sự kiện (DOM events)
    // Listening / handling events (DOM events)
    this.handleEvents();

    // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
    // Load the first song information into the UI when running the app
    this.loadCurrentSong();

    // Render playlist
    this.render();

    // Hiển thị trạng thái ban đầu của button repeat & random
    // Display the initial state of the repeat & random button
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);
  }
};

app.start();*/
